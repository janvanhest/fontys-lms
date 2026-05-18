# E-01 — Mock Auth + Student Profile Design

**Date:** 2026-05-18  
**Epic:** E-01 — Toegang via mock-authenticatie (PoC)  
**FR's:** FR-05a  
**Dependencies:** geen

---

## Scope

Implementeer een `MockAuthGuard` die bij elke request een hardcoded student upsert in de database en beschikbaar stelt via `request.user`. Voeg een `GET /student/me` endpoint toe. Vervang de "Coach workspace" chip in de Topbar door een MUI Avatar + Menu die de studentdata toont via een fetch naar dat endpoint.

Buiten scope: LTI 1.3 authenticatie, echte Canvas-koppeling, uitlogfunctionaliteit, coach-rol.

---

## Architectuur

```
AuthModule
├── IAuthenticatedUser          (interface — gedeeld contract tussen guards en controllers)
├── @Public()                   (SetMetadata decorator — bypass guard)
├── @CurrentStudent()           (createParamDecorator — type-safe toegang tot request.user)
└── MockAuthGuard               (globaal via APP_GUARD)

StudentModule
├── Student entity              (TypeORM)
├── StudentService              (findOrCreate)
└── StudentController           (GET /student/me)

Frontend
└── Topbar.tsx
    ├── useStudentProfile hook  (fetch GET /student/me bij mount)
    ├── Avatar (MUI)
    └── Menu (MUI)
```

**Request flow:**
```
Inkomende request
  → MockAuthGuard
    → StudentService.findOrCreate(MOCK_STUDENT)
    → request.user = Student entity
  → Controller
    → @CurrentStudent() student: Student
    → response
```

**Frontend flow:**
```
App mount → useStudentProfile → GET /student/me → { id, displayName, avatarUrl, email }
         → Topbar: Avatar src=avatarUrl, fallback=initialen
         → Menu: displayName + email
```

---

## Backend — AuthModule

### IAuthenticatedUser

```ts
export interface IAuthenticatedUser {
  id: string;
  canvasUserId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}
```

Beide guards (Mock en later Lti) implementeren deze interface. Controllers en decorators typen altijd op deze interface, nooit op een concrete guard.

### @Public() decorator

```ts
export const Public = () => SetMetadata('isPublic', true);
```

`MockAuthGuard` checkt via `Reflector` of de route `isPublic` is. Zo ja: guard slaat over en laat de request door. Toepassen op `/health` en `/info`.

### @CurrentStudent() decorator

```ts
export const CurrentStudent = createParamDecorator(
  (_data, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
```

Gebruik in controllers: `@CurrentStudent() student: Student`. Type-safe, geen `req.user` casting nodig.

### MockAuthGuard

- Implementeert `CanActivate`
- Hardcoded mock-data:
  ```ts
  const MOCK_STUDENT = {
    canvasUserId: '31474',
    displayName: 'Hest, Jan J.H. van',
    email: 'jan.vanhest@student.fontys.nl',
    avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
  };
  ```
- Roept `StudentService.findOrCreate(MOCK_STUDENT)` aan
- Zet `request.user = student`
- Geregistreerd via `{ provide: APP_GUARD, useClass: MockAuthGuard }` in `AuthModule`

---

## Backend — StudentModule

### Student entity

| Kolom | Type | Constraint |
|---|---|---|
| id | uuid | PK, auto-generated |
| canvasUserId | varchar | UNIQUE, NOT NULL |
| displayName | varchar | NOT NULL |
| email | varchar | NOT NULL |
| avatarUrl | varchar | nullable |
| createdAt | timestamp | auto |

`synchronize: true` (non-production) — geen expliciete migratie nodig voor PoC.

### StudentService

```ts
findOrCreate(dto: { canvasUserId, displayName, email, avatarUrl }): Promise<Student>
```

- Zoekt op `canvasUserId`
- Maakt aan als niet bestaat
- Geen update bij bestaand record (display name verandert zelden; LtiAuthGuard kan dit later verfijnen)

### StudentController

```
GET /student/me
```

- Beveiligd door `MockAuthGuard` (geen `@Public()`)
- Returnt de `Student` entity van `request.user`
- Guard heeft record al aangemaakt — service wordt hier niet opnieuw aangeroepen

---

## Frontend — Topbar

### useStudentProfile hook

- Fetcht `GET /student/me` bij mount via `useEffect`
- Geeft `{ student, loading, error }` terug
- Fout-state: Avatar toont initialen als fallback

### Topbar wijzigingen

- `Coach workspace` Chip verwijderen
- MUI `Avatar` toevoegen:
  - `src={student?.avatarUrl}`
  - `alt={student?.displayName}`
  - Fallback: eerste letters van naam (`HJ` voor "Hest, Jan")
- MUI `Menu` bij click op Avatar:
  - `displayName` als header
  - `email` als subtext
  - Placeholder "Uitloggen" menu-item (disabled voor PoC)

---

## Testbaarheid

- `StudentService.findOrCreate` unit-testbaar met een in-memory repository mock
- `MockAuthGuard` injecteerbaar als testdouble in e2e-tests voor volgende epics
- `GET /student/me` e2e-test: request zonder guard → 403, met guard → 200 + correct profiel

---

## Storybook

`Topbar.stories.tsx` updaten met drie nieuwe stories. De `useStudentProfile` hook wordt gemockt via een wrapper die de hook-return waarde injecteert (geen echte fetch in stories).

| Story | Beschrijving |
|---|---|
| `WithProfile` | Avatar met echte profieldata: avatarUrl + naam in menu |
| `LoadingProfile` | Avatar toont initialen als fallback terwijl data laadt |
| `MenuOpen` | Avatar geklikt — menu zichtbaar met naam, email, "Uitloggen" |

Aanpak voor mocken: `useStudentProfile` accepteert een optionele `overrideForStorybook`-prop, of de hook wordt geëxporteerd met een context-provider zodat stories de state kunnen injecteren zonder MSW.

---

## Buiten scope

- LTI 1.3 authenticatie (FR-05b — Won't voor PoC)
- Echte Canvas-koppeling
- Werkende uitlogfunctionaliteit
- Coach-rol
- Profielpagina (apart scherm)
