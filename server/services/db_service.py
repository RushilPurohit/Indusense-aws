"""
InduSense Database & Persistence Service
Uses SQLite to persist Diagnosis Cases, Append-Only Audit Trail (Feature A), and Versioned Reviews (Feature C).
"""

import sqlite3
import json
import uuid
import time
import os
from pathlib import Path
from typing import Dict, List, Optional, Any

DB_PATH = Path(__file__).resolve().parent.parent.parent / "abb_maintenance.db"

class DatabaseService:
    def __init__(self, db_path: str = str(DB_PATH)):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # 1. Cases table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS indusense_cases (
                    id TEXT PRIMARY KEY,
                    asset_id TEXT NOT NULL,
                    asset_name TEXT,
                    plant TEXT,
                    dataset_source TEXT,
                    condition_json TEXT NOT NULL,
                    evidence_json TEXT NOT NULL,
                    alignment_json TEXT NOT NULL,
                    validation_json TEXT NOT NULL,
                    routing_json TEXT NOT NULL,
                    explanation_json TEXT NOT NULL,
                    review_json TEXT,
                    stage_log_json TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # 2. Append-only Audit Trail table (Feature A)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS indusense_audit_trail (
                    id TEXT PRIMARY KEY,
                    case_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    details TEXT NOT NULL,
                    metadata_json TEXT,
                    FOREIGN KEY(case_id) REFERENCES indusense_cases(id)
                )
            """)

            # 3. Versioned Technician Reviews table (Feature C)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS indusense_reviews (
                    id TEXT PRIMARY KEY,
                    case_id TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    outcome TEXT NOT NULL,
                    reviewer TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    notes TEXT,
                    rec_version_hash TEXT,
                    FOREIGN KEY(case_id) REFERENCES indusense_cases(id)
                )
            """)
            conn.commit()

    # --- Cases CRUD ---
    def save_case(self, case_dict: Dict[str, Any]) -> Dict[str, Any]:
        case_id = case_dict.get("id") or f"case-{uuid.uuid4().hex[:10]}"
        case_dict["id"] = case_id
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        created_at = case_dict.get("created_at") or now

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO indusense_cases (
                    id, asset_id, asset_name, plant, dataset_source,
                    condition_json, evidence_json, alignment_json,
                    validation_json, routing_json, explanation_json,
                    review_json, stage_log_json, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                case_id,
                case_dict.get("asset_id", ""),
                case_dict.get("asset_name", ""),
                case_dict.get("plant", "Plant 2"),
                case_dict.get("dataset_source", ""),
                json.dumps(case_dict.get("condition", {})),
                json.dumps(case_dict.get("evidence_candidates", [])),
                json.dumps(case_dict.get("alignment", [])),
                json.dumps(case_dict.get("validation", {})),
                json.dumps(case_dict.get("routing", {})),
                json.dumps(case_dict.get("explanation", {})),
                json.dumps(case_dict.get("review", {"outcome": "Pending"})),
                json.dumps(case_dict.get("stage_log", [])),
                created_at,
                now
            ))
            conn.commit()

        # Save any audit trail events included with the case
        for evt in case_dict.get("audit_trail", []):
            self.append_audit_event(
                case_id=case_id,
                event_type=evt.get("event_type", "INFO"),
                actor=evt.get("actor", "System"),
                details=evt.get("details", ""),
                timestamp=evt.get("timestamp") or now,
                metadata=evt.get("metadata")
            )

        return self.get_case(case_id)

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM indusense_cases WHERE id = ?", (case_id,))
            row = cursor.fetchone()
            if not row:
                return None

            case_data = {
                "id": row["id"],
                "asset_id": row["asset_id"],
                "asset_name": row["asset_name"],
                "plant": row["plant"],
                "dataset_source": row["dataset_source"],
                "condition": json.loads(row["condition_json"]),
                "evidence_candidates": json.loads(row["evidence_json"]),
                "alignment": json.loads(row["alignment_json"]),
                "validation": json.loads(row["validation_json"]),
                "routing": json.loads(row["routing_json"]),
                "explanation": json.loads(row["explanation_json"]),
                "review": json.loads(row["review_json"]) if row["review_json"] else {"outcome": "Pending"},
                "stage_log": json.loads(row["stage_log_json"]) if row["stage_log_json"] else [],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
                "audit_trail": self.get_audit_trail(case_id),
                "review_history": self.get_reviews(case_id)
            }
            return case_data

    def list_cases(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM indusense_cases ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [self.get_case(r["id"]) for r in rows if self.get_case(r["id"]) is not None]

    # --- Feature A: Append-Only Audit Trail ---
    def append_audit_event(
        self,
        case_id: str,
        event_type: str,
        actor: str,
        details: str,
        timestamp: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        evt_id = f"evt-{uuid.uuid4().hex[:10]}"
        t_now = timestamp or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        meta_json = json.dumps(metadata) if metadata else None

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO indusense_audit_trail (id, case_id, timestamp, event_type, actor, details, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (evt_id, case_id, t_now, event_type, actor, details, meta_json))
            conn.commit()

        return {
            "id": evt_id,
            "case_id": case_id,
            "timestamp": t_now,
            "event_type": event_type,
            "actor": actor,
            "details": details,
            "metadata": metadata
        }

    def get_audit_trail(self, case_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM indusense_audit_trail
                WHERE case_id = ?
                ORDER BY timestamp ASC
            """, (case_id,))
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "event_type": r["event_type"],
                    "actor": r["actor"],
                    "details": r["details"],
                    "metadata": json.loads(r["metadata_json"]) if r["metadata_json"] else None
                }
                for r in rows
            ]

    # --- Feature C: Versioned Technician Reviews ---
    def add_review(
        self,
        case_id: str,
        outcome: str,
        reviewer: str,
        notes: Optional[str] = None,
        rec_version_hash: Optional[str] = None
    ) -> Dict[str, Any]:
        t_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        rev_id = f"rev-{uuid.uuid4().hex[:10]}"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT MAX(version) FROM indusense_reviews WHERE case_id = ?", (case_id,))
            max_v = cursor.fetchone()[0]
            next_version = 1 if max_v is None else max_v + 1

            cursor.execute("""
                INSERT INTO indusense_reviews (id, case_id, version, outcome, reviewer, timestamp, notes, rec_version_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (rev_id, case_id, next_version, outcome, reviewer, t_now, notes, rec_version_hash))

            # Update latest review on case
            review_dict = {
                "outcome": outcome,
                "reviewer": reviewer,
                "timestamp": t_now,
                "notes": notes,
                "version": next_version,
                "rec_version_hash": rec_version_hash
            }
            cursor.execute("""
                UPDATE indusense_cases
                SET review_json = ?, updated_at = ?
                WHERE id = ?
            """, (json.dumps(review_dict), t_now, case_id))
            conn.commit()

        # Log to audit trail
        self.append_audit_event(
            case_id=case_id,
            event_type="TECHNICIAN_REVIEW",
            actor=reviewer,
            details=f"Review v{next_version}: Decision='{outcome}'. Notes: {notes or 'None'}",
            timestamp=t_now,
            metadata={"version": next_version, "outcome": outcome, "rec_hash": rec_version_hash}
        )

        return review_dict

    def get_reviews(self, case_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM indusense_reviews
                WHERE case_id = ?
                ORDER BY version ASC
            """, (case_id,))
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "version": r["version"],
                    "outcome": r["outcome"],
                    "reviewer": r["reviewer"],
                    "timestamp": r["timestamp"],
                    "notes": r["notes"],
                    "rec_version_hash": r["rec_version_hash"]
                }
                for r in rows
            ]

db_service = DatabaseService()
