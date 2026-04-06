# Fontys Studieassistent PoC

Lokale RAG proof-of-concept voor Fontys Pro Open Learning met NestJS, Next.js, PostgreSQL + pgvector, Ollama en Docker Compose.

## Vereisten

- Docker + Docker Compose
- [Ollama](https://ollama.com) lokaal geïnstalleerd en draaiend op poort 11434
- Anthropic API key

## Starten

```bash
# Stap 1: zorg dat Ollama draait met het juiste model
ollama pull nomic-embed-text
ollama serve  # als het nog niet draait

# Stap 2: stel je Anthropic key in
cp .env.example .env
# vul ANTHROPIC_API_KEY in in .env

# Stap 3: start de applicatie
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/chat

## Architectuur

- `postgres/`: PostgreSQL 16 met pgvector-extensie (via `pgvector/pgvector:pg16` image)
- `backend/`: NestJS — seeding, Ollama-embeddings, vector search, RAG pipeline met Claude
- `frontend/`: Next.js + MUI chatinterface
- Embeddings draaien lokaal via Ollama (`nomic-embed-text`, 768 dimensies) — geen kosten

## Endpoints

- `POST /api/chat` — `{ message, history }` → `{ answer }`
- `GET /api/health`
