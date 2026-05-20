# Activities backend — design spec

**Project:** Activity First LMS  
**Datum:** 2026-05-20  
**Branch:** feat/implement-backend-activities  
**Scope:** Backend implementatie van het activities domein (POC)

---

## Context

De frontend toont per student een lijst van activiteiten, gegroepeerd op deadline (eerder / deze week / volgende week / later). Die data staat momenteel hardcoded in `frontend/src/layouts/side-panel/constants.ts`. Doel van dit spec: een backend API bouwen die die hardcoded data vervangt en mutaties (status, deadline, type) persistent maakt per student.

Activiteiten komen in productie uit Portflow (portfolio tool van Fontys). Omdat we geen API-key hebben voor de POC, beheren we alle data volledig in onze eigen database — maar met portflow-compatibele veldnamen, zodat een latere integratie alleen de service-laag raakt.

---

## Beslissingen

| Beslissing | Keuze | Reden |
|---|---|---|
| Data-eigenaarschap | Volledig lokaal | Geen Portflow API-key beschikbaar voor POC |
| Portflow-compatibiliteit | Veldnamen meespiegelen | Lage migratiekosten later |
| Activiteiten per student | Eigen set per student | Elke student heeft zijn eigen portfolio |
| Rollen & sharing | Buiten scope POC | Fundament aanwezig via `studentId` FK |
| Groepering (eerder/deze-week/etc.) | Frontend-verantwoordelijkheid | Afhankelijk van huidige datum, niet van de data |

---

## Data model

```
Activity
├── id              uuid (PK)
├── portflowId      integer | null      ← portflow's `id`, null bij lokaal aangemaakte activiteiten
├── studentId       uuid (FK → Student, NOT NULL)
├── title           string (NOT NULL)
├── description     string | null
├── position        integer (NOT NULL, default 0)   ← portflow's `position`, voor sortering
├── type            enum (NOT NULL)
├── status          enum (NOT NULL, default 'open')
├── deadline        date | null
├── competencyLabel string | null
├── createdAt       timestamp
├── updatedAt       timestamp
```

### Enums

`type` en `status` zijn enum-kolommen direct op de `Activity` tabel — geen aparte kruistabellen. Een kruistabel zou alleen nodig zijn als één activiteit meerdere types of statussen tegelijk kon hebben; dat is niet het geval.

**ActivityType** (portflow kent geen types; dit zijn onze eigen LMS-waarden):
`opdracht` | `workshop` | `competentie` | `eigen activiteit` | `challenge` | `coaching` | `sprint review` | `semesterplan` | `posterpresentatie` | `overdracht`

**ActivityStatus**:
`open` | `bezig` | `feedback` | `afgerond`

### Portflow-import en defaults

Portflow kent geen `type` of `status`. Bij een latere import van echte Portflow-activiteiten krijgen deze velden defaults:
- `status` → `'open'` (student stelt dit daarna zelf in)
- `type` → `'opdracht'` (student kan dit na import aanpassen)

De `portflowId` FK is voldoende om de koppeling naar Portflow te bewaren en duplicaten bij re-import te voorkomen.

### Toekomstige uitbreiding (niet gebouwd nu)

- Coach krijgt read-only access op activiteiten van zijn studenten via een aparte route (bijv. `GET /students/:studentId/activities`) — de `studentId` FK maakt dit mogelijk zonder schema-wijziging.
- Peer review: een expliciete sharingsrelatie tussen twee studenten op activiteitniveau.
- Portflow-import: activiteiten met `portflowId` kunnen worden gesynchroniseerd zonder duplicaten.

---

## API endpoints

Alle endpoints vereisen authenticatie. De `studentId` wordt impliciet uit de auth-context gehaald via `@CurrentStudent()` — nooit als URL-parameter voor de eigen routes.

| Method | Path | Beschrijving |
|---|---|---|
| `GET` | `/activities` | Alle activiteiten van de ingelogde student, gesorteerd op `deadline ASC NULLS LAST, position ASC` |
| `POST` | `/activities` | Nieuwe activiteit aanmaken |
| `GET` | `/activities/:id` | Één activiteit ophalen (ownership check) |
| `PATCH` | `/activities/:id` | Velden updaten: status, deadline, type, title, description, competencyLabel |
| `DELETE` | `/activities/:id` | Activiteit verwijderen (ownership check) |
| `POST` | `/activities/seed` | Mockdata laden voor de ingelogde student (dev/demo only, bewaker via NODE_ENV check) |

### Response shape (GET /activities item)

```json
{
  "id": "uuid",
  "portflowId": 7238,
  "title": "Brainstorm",
  "description": null,
  "position": 8,
  "type": "opdracht",
  "status": "open",
  "deadline": "2026-03-14",
  "competencyLabel": null,
  "createdAt": "2026-05-20T10:00:00Z",
  "updatedAt": "2026-05-20T10:00:00Z"
}
```

---

## Module structuur

Volgt het bestaande patroon (`student/`, `chat/`):

```
backend/src/activity/
├── activity.entity.ts
├── activity.module.ts
├── activity.controller.ts
├── activity.service.ts
├── activity.controller.spec.ts
├── activity.service.spec.ts
└── dto/
    ├── create-activity.dto.ts
    ├── update-activity.dto.ts
    └── activity-response.dto.ts
```

`ActivityModule` wordt geregistreerd in `app.module.ts`.

Nieuwe migratie: `backend/src/database/migrations/20260520000100-create-activities-table.ts`

---

## Seed data

De seed methode `seedForStudent(student)` in `ActivityService` laadt een hardcoded set van ~10 activiteiten die een portflow-collectie nabootsen. De data bevat portflow-velden (`portflowId`, `title`, `description`, `position`) aangevuld met LMS-velden (`type`, `status`, `deadline`). Spread over alle vier groepen zodat de UI direct een gevuld beeld toont.

Het seed endpoint (`POST /activities/seed`) is alleen beschikbaar buiten productie. Bij herhaaldelijk aanroepen worden bestaande activiteiten van de student eerst verwijderd.

---

## Error handling

- `404 Not Found` — activiteit bestaat niet of behoort niet tot de ingelogde student (ownership check in service, niet in controller)
- `400 Bad Request` — ongeldige enum-waarden, via `class-validator` op DTOs
- Geen extra fallbacks of retry-logica nodig voor POC

---

## Tests

- `activity.service.spec.ts` — unit tests met gemockte TypeORM repository:
  - CRUD operaties
  - Ownership check (student A kan activiteit van student B niet lezen/muteren)
  - Seed methode maakt verwachte activiteiten aan
- `activity.controller.spec.ts` — unit tests op controller layer (routing, DTO mapping)

Geen integratietests voor de POC.
