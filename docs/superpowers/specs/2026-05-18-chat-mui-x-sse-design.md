# Design — Chat met MUI X ChatProvider + NestJS SSE

**Project:** Activity First LMS  
**Sprint:** 3  
**Datum:** 2026-05-18  
**FR's:** FR-04, FR-08, FR-13, FR-14

---

## Scope

Realiseer een werkende chatbot-tab waarbij:

- Een student een vraag stelt en het antwoord gestreamd ziet binnenkomen.
- Eerdere gesprekken per student bewaard blijven en via de bestaande `Sidebar` bereikbaar zijn.
- De chatbot zowel cursusinhoud (RAG) als dynamische studentdata (tool use) combineert in één antwoord.
- De drie-kolom layout (`Sidebar` | `ChatTab` | `SidePanel`) ongewijzigd blijft.

Buiten scope: coach view, LTI-auth, nudges, beroepstaaksuggestie vanuit chat.

---

## Architectuur

### Drie-kolom layout (bestaand, geen wijzigingen)

```
┌──────────────┬────────────────────────┬──────────────┐
│  Sidebar     │  ChatTab               │  SidePanel   │
│  (links)     │  (midden)              │  (rechts)    │
│              │                        │              │
│  Gesprekken  │  Chatvenster           │  Activiteiten│
│  + Nieuw     │  + MessageList         │  tijdlijn    │
│    gesprek   │  + InputBar            │              │
└──────────────┴────────────────────────┴──────────────┘
```

`sidebarOpen` en `sidePanelOpen` worden al beheerd via `useLayout()` context.

---

## Backend

### Module: `ChatModule`

Locatie: `backend/src/chat/`

**Entities:**

```
GesprekEntity
  id: uuid (PK)
  studentId: string
  aangemaaktOp: DateTime

BerichtEntity
  id: uuid (PK)
  gesprekId: uuid (FK → Gesprek)
  rol: 'student' | 'assistent'
  inhoud: string
  timestamp: DateTime
```

**Services:**

`GesprekService`
- `maakNieuwGesprek(studentId)` → `GesprekEntity`
- `vindGesprekkenVanStudent(studentId)` → `GesprekEntity[]`
- `vindGesprekMetBerichten(gesprekId)` → `GesprekEntity` met berichten
- `voegBerichtToe(gesprekId, rol, inhoud)` → `BerichtEntity`

`ChatService`
- `streamAntwoord(gesprekId, vraag, studentId)` → `Observable<string>` (SSE tokens)
- Interne iteratieve lus (max 6 iteraties):
  1. Stuur vraag + berichthistorie + tools naar Anthropic SDK
  2. Voer tool calls uit (`StudentContextTool`, `RagTool`)
  3. Voeg tool results toe aan context
  4. Herhaal totdat model stopt of max iteraties bereikt
- Persisteert studentvraag en assistent-antwoord via `GesprekService`

**Tools (injecteerbare services):**

`StudentContextTool`
- Haalt actieve challenge + recente activiteiten + gekoppelde beroepstaken op via bestaande TypeORM repositories
- Input: `{ studentId: string }`
- Output: JSON-string met challenge en activiteiten

`RagTool`
- Zoekt relevante chunks via bestaande `EmbeddingService.findSimilar()`
- Input: `{ query: string }`
- Output: geconcentreerde tekst van top-k chunks

**Controller:**

```
POST /chat/stream
  Body: { vraag: string, gesprekId?: string }
  Response: text/event-stream

  Events:
    event: status   → data: "Zoeken in cursusinhoud..."
    event: tool_call → data: { name, input }
    event: tool_result → data: { name, result }
    event: final    → data: <volledig antwoord>
    event: error    → data: <foutmelding>

GET /gesprekken
  Response: GesprekEntity[] (voor ingelogde student)

GET /gesprekken/:id
  Response: GesprekEntity met berichten
```

**Dependencies (toe te voegen):**
- `@anthropic-ai/sdk` — officiële Anthropic client voor streaming + tool use

**Authenticatie:** MockAuthGuard injecteert hardcoded studentId (bestaand patroon, FR-05a).

---

## Frontend

### `ChatTab.tsx` — volledige rewrite

Gebruik `ChatProvider` van `@mui/x-chat` als state container. Eigen subcomponenten:

**`MessageList`** — toont berichten als balonnetjes (student rechts, assistent links). Toont een typing-indicator tijdens streaming. Scrollt automatisch naar beneden.

**`InputBar`** — tekstveld + verzendknop. Disabled tijdens streaming. `Enter` verstuurt, `Shift+Enter` nieuwe regel.

**SSE-koppeling:**

```typescript
async function sendMessage(vraag: string) {
  const response = await fetch('/chat/stream', {
    method: 'POST',
    body: JSON.stringify({ vraag, gesprekId }),
    headers: { 'Content-Type': 'application/json' },
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  // Parse SSE events, append tokens to streaming message
  // On 'final' event: replace streaming message with complete answer
  // On 'error' event: show error state
}
```

### `Sidebar.tsx` — koppelen aan API

Vervangt de huidige hardcoded `conversations` array door:
- `GET /gesprekken` ophalen bij mount
- Geselecteerd gesprek tracken via lokale state
- "New chat" knop roept `POST /gesprekken` aan en selecteert het nieuwe gesprek

---

## Datafluent

```
Student typt vraag
  → ChatTab.InputBar.onSubmit
  → fetch POST /chat/stream (SSE)
  → NestJS ChatController
  → ChatService.streamAntwoord()
      → GesprekService.voegBerichtToe(gesprekId, 'student', vraag)
      → Iteratieve lus:
          → Anthropic API (streaming)
          → tool_call? → StudentContextTool of RagTool uitvoeren
          → SSE: status/tool_call/tool_result events naar frontend
      → GesprekService.voegBerichtToe(gesprekId, 'assistent', volledigAntwoord)
      → SSE: final event
  → ChatTab: streaming bericht wordt definitief
```

---

## Foutafhandeling

- Anthropic API niet bereikbaar → `error` SSE event → foutmelding in chat UI
- Ollama niet bereikbaar (RAG) → tool geeft lege resultaten, chat gaat door zonder RAG
- Max iteraties bereikt → fallback-antwoord: "Ik kon je vraag niet volledig beantwoorden"
- Gesprek niet gevonden → 404, frontend start nieuw gesprek

---

## Testen

- `GesprekService`: unit tests voor CRUD (jest + TypeORM in-memory mock)
- `ChatService`: unit tests met gemockte Anthropic client en tool services
- `StudentContextTool` + `RagTool`: unit tests met gemockte repositories
- Frontend: Storybook stories voor `MessageList`, `InputBar`, `ChatTab` (lege staat, streaming staat, fout staat)

---

## Implementatievolgorde

1. Backend: `GesprekEntity` + `BerichtEntity` + `GesprekService`
2. Backend: `StudentContextTool` + `RagTool`
3. Backend: `ChatService` met iteratieve lus + SSE
4. Backend: `ChatController` met `POST /chat/stream` + `GET /gesprekken`
5. Frontend: `MessageList` + `InputBar` componenten
6. Frontend: `ChatTab` rewrite met ChatProvider + SSE-koppeling
7. Frontend: `Sidebar` koppelen aan API
