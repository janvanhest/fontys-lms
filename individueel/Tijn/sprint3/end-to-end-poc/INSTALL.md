# Installatie

Stappenplan om de end-to-end PoC vanaf scratch werkend te krijgen op Windows met Docker Desktop.

## Vereisten

- **Docker Desktop** (Windows 10 of 11). Minimaal versie 4.x met WSL2 backend. Download van [docker.com](https://www.docker.com/products/docker-desktop/).
- **Ollama** geinstalleerd op de host. Download van [ollama.com](https://ollama.com).
- **Anthropic API key** voor Claude. Aanvragen via [console.anthropic.com](https://console.anthropic.com) of via je Fontys-groepsaccount.
- **PowerShell** (komt standaard mee met Windows). Bash via WSL werkt ook.

Geen Node.js, pnpm of TypeScript nodig op de host. Alles draait in Docker.

## Stappen

### 1. Naar de projectmap

```powershell
cd C:\Users\Hoeje\Documents\GitHub\fontys-lms\individueel\Tijn\sprint3\end-to-end-poc
```

### 2. Ollama klaarzetten

Pull het embedding-model:

```powershell
ollama pull nomic-embed-text
```

Verifieer dat Ollama luistert op de standaardpoort:

```powershell
curl.exe http://localhost:11434/api/tags
```

Output moet ergens `"name":"nomic-embed-text:latest"` bevatten.

Als Ollama niet als achtergrondservice draait, start hem in een aparte terminal:

```powershell
ollama serve
```

Die terminal moet open blijven tijdens de PoC.

### 3. .env aanmaken

```powershell
copy .env.example .env
notepad .env
```

Vul `ANTHROPIC_API_KEY` in met je Claude API key. De rest mag default blijven:

```
POSTGRES_DB=lmsdb
POSTGRES_USER=lmsuser
POSTGRES_PASSWORD=lmspass

DATABASE_URL=postgresql://lmsuser:lmspass@localhost:5432/lmsdb
DOCKER_DATABASE_URL=postgresql://lmsuser:lmspass@postgres:5432/lmsdb

ANTHROPIC_API_KEY=sk-ant-vul-hier-in
OLLAMA_URL=http://host.docker.internal:11434

PORT=3000
```

### 4. Stack starten

```powershell
docker compose up --build
```

Eerste build duurt 2 tot 3 minuten door `pnpm install` in de container. Daarna is alles gecached en start het binnen 10 seconden.

### 5. Verifieren dat alles draait

Let in de logs op deze regels in volgorde:

```
postgres-1  | database system is ready to accept connections
backend-1   | [PgService] Postgres bereikbaar
backend-1   | [SeedService] Studenten geseed: 3
backend-1   | [SeedService] HBO chunks tabel geleegd (index ook gedropt), opnieuw seeden
backend-1   | [SeedService] HBO chunks gevonden: 15, embeddings ophalen...
backend-1   | [SeedService] HBO chunks geseed: 15
backend-1   | [NestApplication] Nest application successfully started
backend-1   | [Bootstrap] Backend draait op http://localhost:3000
backend-1   | [Bootstrap] Swagger UI op http://localhost:3000/api/docs
backend-1   | [Bootstrap] Chat UI op http://localhost:3000/
```

Tussen `embeddings ophalen` en `geseed: 15` zit ongeveer 5 tot 10 seconden waarin Ollama de chunks embed.

### 6. Eerste test

Open in je browser:

| URL | Wat het is |
|---|---|
| http://localhost:3000/ | Chat UI met 4 tabs |
| http://localhost:3000/api/docs | Swagger UI voor handmatig endpoint testen |

In de chat UI:

1. Klik bovenaan op tab **Info**, scroll door de live status om te zien dat alles geseed is (3 studenten, 15 HBO-i chunks).
2. Klik op tab **Chat**, klik op **Scenario C "Hybride (beide)"**, druk Verstuur.
3. Je ziet in de status-bar live tool-calls verschijnen (search_hbo_competentie + get_student_voortgang).
4. Het uiteindelijke antwoord verschijnt in markdown geformatteerd.
5. Klik onder het antwoord op de tool-call regels om de raw data uit te klappen.

Als dit allemaal werkt, is de installatie geslaagd.

## Troubleshooting

### Ollama niet bereikbaar

Symptoom in logs:
```
[SeedService] Ollama embedding mislukt: ECONNREFUSED
```

Stappen:
1. Check op de host: `curl.exe http://localhost:11434/api/tags`. Geen response: start Ollama (`ollama serve` in aparte terminal).
2. Wel response op host maar container faalt nog: test vanuit container:
   ```powershell
   docker compose exec backend wget -qO- http://host.docker.internal:11434/api/tags
   ```
3. Faalt dit: `host.docker.internal` werkt niet op alle Docker setups. Pas `OLLAMA_URL` in `.env` aan naar bijvoorbeeld `http://172.17.0.1:11434` (Docker bridge gateway) en doe `docker compose restart backend`.

### Anthropic geeft 401

`ANTHROPIC_API_KEY` in `.env` is fout of leeg. Check op typo's, spaties of quotes eromheen. Restart backend na aanpassen:

```powershell
docker compose restart backend
```

### Vector DB tab toont 0 chunks

Backend heeft de seed niet voltooid. Restart:

```powershell
docker compose restart backend
```

Check de logs op `[SeedService] HBO chunks geseed: 15`. Zie je daarvoor een Ollama-fout, zie het Ollama-troubleshooting blok hierboven.

### Postgres connection refused tijdens opstart

PgService heeft retry-logic die 20 keer probeert met 1 seconde tussenpoos. Wacht 10 a 20 seconden. Als het echt faalt:

```powershell
docker compose down
docker compose up --build
```

### Chat UI laadt wel maar antwoord blijft hangen

Check de backend-logs in je terminal. Vaak is dit een tool die niet returnt (Ollama hangt) of Claude die te lang doet over een complexe vraag. Status-bar in de UI toont meestal waar het stokt.

## Reset-procedures

### Alleen de HBO-i chunks resetten (snel)

```powershell
docker compose restart backend
```

De seed wist en herseed de `hbo_chunk` tabel bij elke restart. Andere tabellen blijven staan.

### Volledige reset (alles weg)

```powershell
docker compose down -v
docker compose up --build
```

`-v` verwijdert het Postgres-volume. Alle data weg, schema wordt opnieuw aangemaakt door `postgres/init/01-init.sql`, seed draait opnieuw.

## Stoppen

```powershell
docker compose down
```

Of `Ctrl-C` in de terminal waar `docker compose up` draait.

## Updaten van code tijdens dev

De backend gebruikt `nest start --watch` met een volume-mount op `./backend/src`. Wijzigingen in de TypeScript-code worden direct opgepikt en de server herstart automatisch.

Statische frontend (HTML/JS) zit gemount op `./backend/public`. Wijzigingen daar werken na een F5 in de browser, geen restart nodig.

Wijzigingen in `package.json` of `Dockerfile` vereisen wel een rebuild:

```powershell
docker compose up --build
```
