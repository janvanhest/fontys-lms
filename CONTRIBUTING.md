> **CONCEPT** — Dit is een conceptversie van de contributing guide. Feedback is welkom.

# Bijdragen aan het project

Welkom! Dit project wordt gebouwd door een groep avondstudenten bij Fontys. Dat betekent dat iedereen het combineert met werk en andere verplichtingen. Deze guide helpt je om op een prettige manier samen te werken — ook als je maar een paar uur per week beschikbaar bent.

---

## Voor je begint

1. **Clone de repository**
   ```bash
   git clone <repo-url>
   cd fontys-lms
   ```

2. **Maak een eigen branch aan** — werk nooit direct op `main` of `dev`
   ```bash
   git checkout dev
   git checkout -b jouw-naam/wat-je-doet
   ```
   Voorbeelden: `jan/canvas-api-verkenning`, `lisa/gebruikersonderzoek`

3. **Houd `dev` up-to-date** voor je begint
   ```bash
   git pull origin dev
   ```

---

## Hoe werken we samen?

### Branches

| Branch | Waarvoor |
|--------|----------|
| `main` | Stabiele, goedgekeurde versie |
| `dev`  | Lopend werk — hier mergen we naar toe |
| `naam/onderwerp` | Jouw persoonlijke werkbranch |

### Commits

Schrijf duidelijke commit-berichten in het Nederlands of Engels. Eén commit = één logische stap.

```
Goed:   "Voeg Canvas API endpoints toe aan technische verkenning"
Slecht: "update", "fix", "asdfgh"
```

### Pull Requests

- Maak een PR aan als je iets klaar hebt om te delen
- Richt de PR altijd op `dev`, **nooit op `main`**
- Geef een korte beschrijving van wat je hebt gedaan en waarom
- Vraag minimaal één teamgenoot om een review

---

## Mappenstructuur

```
fontys-lms/
├── individueel/        # Persoonlijke documenten per student
│   └── jouw-naam/
├── groep/              # Gedeelde groepsdocumenten
└── README.md
```

Voeg je eigen werk toe onder `individueel/jouw-naam/`. Groepsdocumenten bespreek je eerst even in de groep voor je aanpast.

---

## Afspraken voor avondstudenten

We weten dat iedereen druk is. Daarom:

- **Communiceer tijdig** als je ergens niet aan toekomt — dat is prima, maar laat het weten
- **Klein en regelmatig** is beter dan grote blokken werk vlak voor de deadline
- **Documenteer wat je doet** — een volgende student (of jijzelf over drie weken) moet het kunnen begrijpen
- **Stel vragen** via de groepschat of in een issue, niet alles hoeft persoonlijk besproken te worden

---

## Documenten en bestanden

- Schrijf documentatie in **Markdown** (`.md`)
- Gebruik duidelijke bestandsnamen zonder spaties: `technische_verkenning.md`, niet `Technische Verkenning (nieuw).md`
- Voeg geen grote binaire bestanden toe (afbeeldingen > 1 MB, video's, etc.) — gebruik een externe link

---

## Issues en taken

Gebruik GitHub Issues om bij te houden wat er gedaan moet worden:

- Maak een issue aan als je een taak oppakt of een probleem signaleert
- Wijs het aan jezelf toe zodat anderen weten dat jij ermee bezig bent
- Sluit het issue als de PR gemerged is

---

## Vragen?

Kom je er niet uit? Stel je vraag in de groepschat of maak een issue aan met het label `vraag`. We helpen elkaar.
