"""
InduSense Database & Cache Seeder
Loads synthetic maintenance corpus, demo fleet assets, and benchmark hero cases.
"""

import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from server.api.cases import seed_hero_cases
from server.services.db_service import db_service
from server.api.assets import FLEET_ASSETS
from server.services.knowledge_index import knowledge_index

def seed():
    print("=" * 60)
    print("INDUSENSE — INITIALIZING DATABASE & SEED DATA")
    print("=" * 60)

    # 1. Seed Hero Cases
    seed_hero_cases()
    cases = db_service.list_cases()
    print(f"\n[OK] Database contains {len(cases)} Diagnostic Cases:")
    for c in cases[:5]:
        cond = c.get('condition', {})
        print(f"     - {c['id']}: {c.get('asset_name', c.get('asset_id'))} ({cond.get('fault_label', 'N/A')})")
    if len(cases) > 5:
        print(f"     ... and {len(cases) - 5} more cases in SQLite database.")

    # 2. Seed Fleet Assets
    print(f"\n[OK] Loaded {len(FLEET_ASSETS)} Fleet Monitored Assets:")
    for a in FLEET_ASSETS:
        print(f"     - {a['id']}: {a['name']} [{a.get('status', 'Active')}] (Pc: {a.get('pc', 0.90)})")

    # 3. Seed Maintenance Documents
    print(f"\n[OK] Ingested {len(knowledge_index.documents)} Verified & Synthetic Manuals:")
    for d in knowledge_index.documents:
        print(f"     - {d['id']}: {d['title']} ({d['page_count']} pages, Status: {d.get('quality_status', 'Ready')})")

    # 4. Chunks summary
    print(f"\n[OK] Ingested Evidence Chunks: {len(knowledge_index.chunks)} verified chunks across SKF, AI4I, Factory & Hydraulic domains.")
    print("\n[SUCCESS] Seed execution complete. System ready for localhost deployment.")

if __name__ == "__main__":
    seed()
