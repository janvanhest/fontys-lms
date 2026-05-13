# End-to-end PoC: hybride RAG + function calling

Een chatbot die HBO-i competentiedefinities (vector DB) en persoonlijke studentdata (relationele DB) kan combineren in een enkel antwoord. Claude beslist zelf welk patroon hij wanneer aanroept.

## Stack

NestJS + PostgreSQL met pgvector + Ollama (nomic-embed-text, lokaal) + Anthropic Claude Sonnet 4.5. Frontend in vanilla HTML/JS. Alles in Docker Compose, behalve Ollama (op de host).

## Snelstart

```powershell
copy .env.example .env
notepad .env                          # ANTHROPIC_API_KEY invullen
ollama pull nomic-embed-text          # eenmalig
docker compose up --build
```

- Chat UI: http://localhost:3000/
- Swagger UI: http://localhost:3000/api/docs

## Documentatie

- **[INSTALL.md](./INSTALL.md)**: complete installatie met troubleshooting.
- **[TECHNICAL.md](./TECHNICAL.md)**: architectuur, modules, schema, API, patronen.
- **Info tab** in de draaiende UI: live stack info, system prompt en tool-definities.

## Mappenstructuur (kort)

```
end-to-end-poc/
+-- docker-compose.yml             postgres + backend
+-- .env.example
+-- postgres/init/01-init.sql      schema + pgvector
+-- seed/                          HBO-i markdown + students JSON
+-- backend/
    +-- public/                    chat UI (HTML + JS)
    +-- src/                       NestJS modules
```
