# DevModule voor seed endpoint — design spec

**Project:** Activity First LMS  
**Datum:** 2026-05-20  
**Branch:** feat/implement-backend-activities  
**Scope:** Refactor seed endpoint uit ActivityController naar een conditionele DevModule

---

## Context

Het `POST /activities/seed` endpoint zit momenteel in `ActivityController`. Dat voelt verkeerd: het is dev/demo tooling, geen onderdeel van de activiteiten-API. De NestJS-idiomatic aanpak is een aparte `DevModule` die alleen geladen wordt buiten productie — waardoor de route in productie letterlijk niet bestaat.

---

## Beslissingen

| Beslissing | Keuze | Reden |
|---|---|---|
| Seed endpoint locatie | `DevModule` / `DevController` | Scheiding van dev tooling en domein-API |
| Activering | Conditioneel in `AppModule` via `NODE_ENV` | NestJS module-systeem, niet via guard |
| Route | `POST /dev/seed/activities` | Duidelijk gescheiden van `/activities/*` |
| Seed logica | Blijft in `ActivityService` | Logica is correct, alleen trigger verandert |
| Auth | Behoudt `@CurrentStudent()` | Seed blijft gekoppeld aan ingelogde gebruiker |

---

## Wat verandert

### Nieuw

```
backend/src/dev/
├── dev.controller.ts
└── dev.module.ts
```

**`dev.controller.ts`** — één route: `POST /dev/seed/activities`. Injecteert `ActivityService` en roept `seed(studentId)` aan met de auth-context.

**`dev.module.ts`** — importeert `ActivityModule` (voor de geëxporteerde `ActivityService`), registreert `DevController`.

### Gewijzigd

**`activity.module.ts`** — voegt `ActivityService` toe aan `exports`, zodat `DevModule` hem kan injecteren.

**`activity.controller.ts`** — verwijdert de `seed` methode en de bijbehorende import.

**`activity.controller.spec.ts`** — verwijdert de seed test.

**`app.module.ts`** — importeert `DevModule` conditioneel:
```typescript
...(process.env.NODE_ENV !== 'production' ? [DevModule] : [])
```

### Ongewijzigd

`ActivityService.seed()` — blijft exact zoals het is.

---

## Tests

- `dev.controller.spec.ts` — unit test: seed endpoint roept `activityService.seed(studentId)` aan
- Geen integratietest nodig voor POC

---

## Gebruik (demo)

```bash
curl -X POST http://localhost:3000/dev/seed/activities \
  -H "Authorization: Bearer <token>"
```

In productie retourneert dit `404` — de route bestaat niet.
