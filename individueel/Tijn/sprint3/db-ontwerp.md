# Databaseontwerp - Eindbeeld LMS chatbot

**Sprint 3 | Infrastructure (Infrastructure) - Design - Niveau 1**
**Datum:** april 2026
**Auteur:** Tijn Knapen

## Waarom dit document

De backend-teamgenoten maken het uiteindelijke databaseontwerp dat in productie gebruikt gaat worden. Dit document is mijn eigen voorstel, vanuit het perspectief van de chatbot en de bredere systeemvisie. Doel is dubbel:

1. Een aantoonbaar eigen ontwerp neerleggen voor de Infrastructure Design competentie
2. Een concreet aanknopingspunt leveren voor het overleg met de backend-teamgenoten over welke velden en relaties de chatbot nodig heeft

De iteraties in sprint 2 hebben geleerd welke data de chatbot daadwerkelijk gebruikt, welke entiteiten ontbraken toen we strakker wilden beginnen, en welke beperkingen function calling in iteratie 3 en 4 gaat adresseren. Dit ontwerp is daarop gebaseerd.

## Scope

Dit is geen minimaal schema voor een PoC, maar een ontwerp dat het **volledige eindbeeld** dekt: student-sessies, docent-sessies via function calling, schrijfacties vanuit de chatbot, nudging en LTI-integratie met Canvas. Hardware-vereisten en deployment-architectuur vallen buiten deze scope.

## Kernontwerpkeuzes

**PostgreSQL.** Dezelfde argumenten als in iteratie 2: JSONB voor flexibele velden, pgvector voor latere RAG over Canvas-content, volwassen tooling. Voor dit eindbeeld speelt pgvector een duidelijkere rol omdat chat-geschiedenis en Canvas-materiaal semantisch doorzoekbaar moeten zijn.

**Eén `user` tabel voor studenten en docenten.** Een `rol` kolom onderscheidt beide groepen. De chatbot werkt fundamenteel anders per rol (student = eager loading, docent = function calling), maar dat is een applicatie-laag verschil, geen data-laag verschil. Een gescheiden schema zou dubbele code veroorzaken voor gedeelde velden (naam, email, Canvas-id).

**Canvas als bron, lokale tabellen als cache.** Voor cursussen, enrollments en events wordt Canvas de leidende bron via de Canvas API. Lokale tabellen spiegelen deze data zodat de chatbot niet bij elke vraag Canvas hoeft te raadplegen. Een synchronisatieproces (buiten dit ontwerp) houdt ze actueel.

**Chat-historie wordt per sessie als JSONB opgeslagen.** Eén rij per chatsessie, met alle berichten als JSONB-lijst in één kolom. Dat scheelt een aparte tabel met duizenden kleine rijen, en een complete sessie komt in één query binnen. Redenen om de historie überhaupt op te slaan: compliance (nalezen wat de assistent adviseerde) en context-continuïteit (bij een volgende sessie kan de chatbot terugverwijzen). Per-bericht embedding voor semantisch zoeken valt buiten dit ontwerp - als RAG over chat-historie later nodig blijkt, wordt dat alsnog een aparte tabel met een pgvector-index.

**Competenties als referentie-tabel.** Eén rij per combinatie van laag en activiteit (zoals in iteratie 2), met definities in JSONB. De voortgang verwijst hier met een foreign key naar toe.

**Harde foreign keys, geen soft deletes.** Een cascade-delete op een student verwijdert ook diens voortgang en chatgeschiedenis. In een onderwijsomgeving is hard verwijderen relatief zeldzaam, en soft-delete voegt complexiteit toe in elke query. Als archivering nodig blijkt, kan dat later in een aparte audit-tabel komen.

## Tabellen

### `user`

Één tabel voor studenten en docenten.

| Kolom         | Type          | Opmerking                               |
|---------------|---------------|-----------------------------------------|
| id            | SERIAL PK     | Interne id                              |
| canvas_id     | TEXT UNIQUE   | Canvas user id, voor LTI-koppeling      |
| naam          | TEXT          |                                         |
| email         | TEXT UNIQUE   |                                         |
| rol           | TEXT          | `student` of `docent`                   |
| opleiding     | TEXT          | Alleen relevant voor studenten          |
| semester      | INTEGER       | Alleen voor studenten                   |
| aangemaakt_op | TIMESTAMPTZ   | Automatisch bij insert                  |

### `course`

*Voorstel/assumptie - Canvas-gedreven, valt onder het backend-ontwerp.*

Cursussen die uit Canvas komen.

| Kolom             | Type        | Opmerking                  |
|-------------------|-------------|----------------------------|
| id                | SERIAL PK   |                            |
| canvas_course_id  | TEXT UNIQUE | Bron-id uit Canvas         |
| naam              | TEXT        |                            |
| beschrijving      | TEXT        |                            |
| periode           | TEXT        | Bijv. "Sep 2026 - Jan 2027"|
| laatste_sync      | TIMESTAMPTZ | Voor cache-beheer          |

### `enrollment`

*Voorstel/assumptie - Canvas-gedreven, valt onder het backend-ontwerp.*

Koppelt gebruikers aan cursussen.

| Kolom         | Type          | Opmerking                     |
|---------------|---------------|-------------------------------|
| id            | SERIAL PK     |                               |
| user_id       | FK user       |                               |
| course_id     | FK course     |                               |
| rol_in_course | TEXT          | `student`, `docent`, `coach`  |

Uniek op (user_id, course_id).

### `competentie`

HBO-i framework als referentie-data. Eén rij per laag-activiteit combinatie.

| Kolom      | Type        | Opmerking                                |
|------------|-------------|------------------------------------------|
| id         | SERIAL PK   |                                          |
| code       | TEXT UNIQUE | Bijv. `INF-An`                           |
| laag       | TEXT        | Infrastructure, Software, UI, enz.       |
| activiteit | TEXT        | Analyse, Advise, Design, Realise, M&C    |
| definities | JSONB       | `{niveau_1, niveau_2, niveau_3}` teksten |

### `student_competentie_voortgang`

Per student zijn voortgang op elke competentie.

| Kolom          | Type             |
|----------------|------------------|
| id             | SERIAL PK        |
| student_id     | FK user          |
| competentie_id | FK competentie   |
| niveau_behaald | INTEGER NULLABLE |
| niveau_bezig   | INTEGER NULLABLE |
| status         | TEXT             |
| toelichting    | TEXT             |
| laatste_update | TIMESTAMPTZ      |

Uniek op (student_id, competentie_id).

### `project`

*Voorstel/assumptie - valt buiten mijn scope, backend-team bepaalt.*

Semester- of cursusprojecten.

| Kolom        | Type        |
|--------------|-------------|
| id           | SERIAL PK   |
| course_id    | FK course   |
| naam         | TEXT        |
| beschrijving | TEXT        |
| start_datum  | DATE        |
| eind_datum   | DATE        |

### `project_lid`

*Voorstel/assumptie - valt buiten mijn scope, backend-team bepaalt.*

Welke studenten (en eventueel docenten) zitten in welk project.

| Kolom      | Type      | Opmerking                         |
|------------|-----------|-----------------------------------|
| id         | SERIAL PK |                                   |
| project_id | FK project|                                   |
| user_id    | FK user   |                                   |
| rol        | TEXT      | Bijv. "Infrastructure engineer"   |

Uniek op (project_id, user_id).

### `activiteit`

*Voorstel/assumptie - valt buiten mijn scope, backend-team bepaalt.*

Taken, opdrachten, deliverables en geplande momenten. In dit voorstel zijn activiteit en event samengevoegd omdat ze functioneel overlappen: beide hebben een titel, datum, beschrijving en gebruikers-koppeling. Het onderscheid zit in de velden die wel of niet gevuld zijn (een meeting heeft begin- en eind_tijd en locatie, een deliverable alleen een datum).

| Kolom          | Type           | Opmerking                                          |
|----------------|----------------|----------------------------------------------------|
| id             | SERIAL PK      |                                                    |
| eigenaar_id    | FK user        | Nullable voor groeps-events                        |
| project_id     | FK project     | Nullable voor losse activiteiten                   |
| course_id      | FK course      | Nullable, voor cursus-gebonden events              |
| competentie_id | FK competentie | Nullable, optionele koppeling                      |
| titel          | TEXT           |                                                    |
| type           | TEXT           | deliverable, meeting, deadline, presentatie, onderzoek |
| datum          | DATE           | Voor deliverables                                  |
| begin_tijd     | TIMESTAMPTZ    | Nullable, voor geplande momenten                   |
| eind_tijd      | TIMESTAMPTZ    | Nullable                                           |
| locatie        | TEXT           | Nullable                                           |
| afgerond       | BOOLEAN        |                                                    |
| beschrijving   | TEXT           |                                                    |
| bron           | TEXT           | `zelf` of `canvas`                                 |

Voor events met meerdere deelnemers kan een aparte junction-tabel (`activiteit_deelnemer`) worden toegevoegd. Niet uitgewerkt omdat dit buiten mijn scope valt.

### `chat_sessie`

Eén rij per keer dat de gebruiker een chatsessie opent. Alle berichten binnen de sessie staan als JSONB-lijst in één kolom.

| Kolom         | Type         | Opmerking                                          |
|---------------|--------------|----------------------------------------------------|
| id            | UUID PK      | Door frontend gegenereerd bij sessie-start         |
| user_id       | FK user      |                                                    |
| begin_tijd    | TIMESTAMPTZ  |                                                    |
| eind_tijd     | TIMESTAMPTZ  | Nullable, tot sessie eindigt                       |
| sessie_type   | TEXT         | `student`, `docent`                                |
| context_blob  | JSONB        | Snapshot van eager-load context bij sessie-start   |
| berichten     | JSONB        | Lijst van `{rol, inhoud, tijdstip, functie_naam, functie_argumenten}` |

Elke binnenkomst van een nieuw bericht wordt geappend aan `berichten`. Dit is één UPDATE per bericht in plaats van een INSERT in een losse tabel, en bij het ophalen van een complete sessie is één SELECT voldoende.

### `feedback`

*Voorstel/assumptie - valt buiten mijn scope, backend-team bepaalt.*

Feedback op activiteiten (van docent, peer of systeem).

| Kolom         | Type           |
|---------------|----------------|
| id            | SERIAL PK      |
| activiteit_id | FK activiteit  |
| auteur_id     | FK user        |
| inhoud        | TEXT           |
| tijdstip      | TIMESTAMPTZ    |

## Indexen

Naast de automatische indexen op primary keys en unique constraints:

- `student_competentie_voortgang(student_id)` voor eager loading van studentcontext
- `chat_sessie(user_id, begin_tijd DESC)` voor het ophalen van recente sessies per gebruiker
- `activiteit(eigenaar_id, datum)` voor tijdgebonden queries (voorstel - niet mijn scope)

## Afwegingen die nog open staan

**Chat-historie retentie.** Onbeperkt bewaren is juridisch niet wenselijk, maar alles na X dagen weggooien verliest context. Voorstel: sessies ouder dan 12 maanden anonimiseren (naam vervangen door hash) of archiveren.

**Semantisch zoeken in chat-historie.** Nu staan de berichten als JSONB, niet indexeerbaar met pgvector. Als RAG over chat-historie nodig blijkt, wordt daar alsnog een aparte `chat_bericht` tabel voor toegevoegd met een embedding-kolom en HNSW-index. Voorlopig niet aangemaakt omdat het concrete nut nog niet vaststaat.

**Gedeelde chat-sessies.** Nu is een sessie strikt aan één gebruiker. Wat als een coach en student samen met de chatbot willen werken? Niet opgelost in dit ontwerp, bewust uitgesteld.

## Verhouding tot het backend-ontwerp

Dit ontwerp is een voorstel dat naast het ontwerp van de backend-teamgenoten komt te liggen. De verwachting is dat er overlap is op de kern-entiteiten (`user`, `course`, `competentie`, `activiteit`) en mogelijk verschillen in hoe function-calling artefacten en chat-historie worden opgeslagen. In een overleg met het backend-team wordt bepaald welk ontwerp of welke combinatie wordt aangehouden. Het doel van dit document is niet om hun werk te overschrijven, maar om een onderbouwd chatbot-perspectief in te brengen.

---

## Competentieverantwoording

**Infrastructure (Infrastructure) - Design - Niveau 1**

Ik heb het databaseschema ontworpen voor de delen van het systeem die onder mijn scope vallen: `user`, `competentie`, `student_competentie_voortgang` en `chat_sessie`. De overige tabellen zijn als voorstel/assumptie opgenomen zodat de samenhang zichtbaar blijft, maar vallen onder het backend-team. Relaties, kolomtypes en indexen zijn onderbouwd op basis van de use cases uit sprint 2.

**Infrastructure (Infrastructure) - Advise - Niveau 1**

Per inrichtingskeuze staat een korte onderbouwing: PostgreSQL als database, één gedeelde `user` tabel voor studenten en docenten, Canvas als leidende bron met lokale caching, chat-historie als JSONB in één rij per sessie, en harde foreign keys in plaats van soft deletes. Dit is input voor het gesprek met de backend-teamgenoten.
