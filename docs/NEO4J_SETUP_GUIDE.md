# ARCHON 2.0 — Neo4j Setup Guide (Windows, Docker, AuraDB)
### HackFront India 2026 | Priority: Neo4j Track

ARCHON 2.0 uses Neo4j as an empirical knowledge graph. It runs safely in **resilient offline mode** by default, but connecting to a live Neo4j instance enables real-time Cypher graph traversals and live React Flow graph synchronization.

---

## Option 1: Docker (Recommended for Windows)

If you have Docker Desktop installed on Windows:

```powershell
docker run -d `
  --name archon-neo4j `
  -p 7474:7474 -p 7687:7687 `
  -e NEO4J_AUTH=neo4j/password `
  -e NEO4J_PLUGINS='["apoc"]' `
  neo4j:5.20-community
```

- **Neo4j Browser**: Open [http://localhost:7474](http://localhost:7474) (Username: `neo4j`, Password: `password`).
- **Bolt Port**: `bolt://localhost:7687`.
- Default environment variables in ARCHON automatically connect to this port!

---

## Option 2: Neo4j Desktop (GUI for Windows)

1. Download **Neo4j Desktop** from [https://neo4j.com/download/](https://neo4j.com/download/).
2. Run the Windows installer and create a new Project named `ARCHON`.
3. Click **Add Local DBMS** (Version 5.x).
4. Set Password to `password` (or set custom password in `.env`).
5. Click **Start**.

---

## Option 3: Neo4j AuraDB (Free Managed Cloud Instance)

1. Sign up for a free Neo4j AuraDB instance at [https://neo4j.com/cloud/platform/aura-graph-database/](https://neo4j.com/cloud/platform/aura-graph-database/).
2. Create a free instance and download your credentials text file.
3. Set your environment variables in PowerShell:
   ```powershell
   $env:NEO4J_URI="neo4j+s://<your-instance-id>.databases.neo4j.io"
   $env:NEO4J_USER="neo4j"
   $env:NEO4J_PASSWORD="<your-generated-password>"
   ```
4. Restart the Django backend server:
   ```powershell
   .\.venv\Scripts\python.exe manage.py runserver 8000
   ```

---

## Verifying the Neo4j Graph in ARCHON

1. Open **[http://localhost:3000](http://localhost:3000)**.
2. In the sidebar, the Neo4j indicator will change from `OFFLINE FALLBACK` to `CONNECTED (GREEN)`.
3. In the Command Center, enter `C:\Users\mustafa\Desktop\BAHub` and click **Index into Graph**.
4. ARCHON executes parameterized `MERGE` queries idempotently creating `Repository`, `File`, `Symbol`, `Commit`, and `Test` nodes.
5. In the **Architecture Graph** tab, the canvas will render live nodes and directed edges!
