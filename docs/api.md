# API Documentation

Base URL: `http://localhost:8000/api/v1`

## 1. Document Upload
Uploads a document for multimodal parsing and indexing.
- **Endpoint**: `/documents/upload`
- **Method**: `POST`
- **Request Body**: `multipart/form-data` containing `file`
- **Response**:
```json
{
  "document_id": "12345",
  "status": "processing"
}
```

## 2. Chat Query
Queries the RAG system.
- **Endpoint**: `/chat`
- **Method**: `POST`
- **Request Body**:
```json
{
  "query": "How do I lubricate Motor M-102?",
  "session_id": "abc-123"
}
```
- **Response**:
```json
{
  "answer": "To lubricate Motor M-102, apply synthetic grease to the primary bearing...",
  "sources": ["Motor_M-102_Manual.pdf (Page 4)", "Graph: M-102 -> Bearing"]
}
```

## 3. Knowledge Graph Entity
Retrieves node data from Neo4j.
- **Endpoint**: `/graph/entity/{entity_id}`
- **Method**: `GET`
- **Response**:
```json
{
  "id": "M-102",
  "type": "Motor",
  "properties": {"status": "Active"},
  "relationships": [{"type": "HAS_PART", "target": "Bearing-01"}]
}
```
