# Demo Walkthrough Guide

## Preparation
1. Ensure Docker containers are running (`docker-compose up -d`).
2. Ensure backend and frontend are running.

## Step-by-Step Flow
1. **Introduction**: Open the web interface. Explain the problem (siloed docs, hard to find context).
2. **Upload**: Navigate to the "Knowledge Base" tab and upload `Motor_M-102_Manual.pdf`.
3. **Pipeline Visualization**: Point out the live processing status showing Layout Detection and OCR extracting tables.
4. **Graph Population**: Open the Neo4j browser (`http://localhost:7474`) and run `MATCH (n) RETURN n` to show how the document was parsed into components.
5. **Basic Query**: In the chat interface, ask: "What is the maintenance schedule for Motor M-102?"
6. **RAG Explanation**: Explain how Qdrant found the text chunk and the LLM summarized it.
7. **Complex Query**: Ask: "If Motor M-102 overheats, what other components should I check?"
8. **Graph Traversal**: Explain how the agent used Neo4j to find connected components (e.g., cooling pump).
9. **Sensor Data Upload**: Upload `sensor_log_M-102.csv`.
10. **Predictive Alert**: Show the system flagging an anomaly indicating a high risk of failure in 48 hours.
11. **Remediation**: Show the agent automatically pulling up the manual page for "Bearing Replacement" based on the anomaly.
12. **Conclusion**: Summarize time saved and accuracy improved.
