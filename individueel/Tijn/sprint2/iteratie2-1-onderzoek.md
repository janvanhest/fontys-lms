# Iteratie 2 - Onderzoek

**Sprint 2 | Infrastructure (Infrastructure) - Analyse & Advise & Design - Niveau 1**
**Datum:** april 2026
**Auteur:** Tijn Knapen

## Aanleiding

Iteratie 1 heeft aangetoond dat een lokaal taalmodel (Qwen 2.5 14B via Ollama) betrouwbaar antwoord geeft als de context als JSON in de system prompt wordt meegegeven. In die iteratie kwam de context uit een statisch bestand (`student.json`). Dat was prima om de modelkeuze en de promptopzet te valideren, maar het is geen realistische situatie. In het uiteindelijke systeem moet de studentdata uit een database komen, per student opnieuw opgehaald bij het openen van een sessie.

Iteratie 2 zet die stap. De mock JSON wordt vervangen door een echte PostgreSQL database, en de chatbot haalt de context op via een loader-module in plaats van een bestand in te lezen. Dit is een belangrijke stap richting het productiesysteem, en tegelijk een test of de kwaliteit van de antwoorden overeind blijft als de data dynamisch wordt opgehaald.

De kern van deze iteratie:

- PostgreSQL opzetten als database voor studentdata
- Docker gebruiken als uitvoeringsomgeving zodat de opzet reproduceerbaar is
- Een schema ontwerpen dat aansluit bij de entiteiten uit de chatbot-scope
- Een Python-loader schrijven die bij sessie-start de context opbouwt
- Dezelfde testscenario's uit iteratie 1 herhalen om te valideren dat er geen regressie is

## Onderzoeksvraag

> Kan een PostgreSQL database de mock JSON vervangen als context-bron voor een student-sessie, zonder dat de kwaliteit van de chatbot-antwoorden terugvalt?

### Deelvragen

1. Hoe ziet een minimaal databaseschema eruit dat de huidige use cases ondersteunt en tegelijk ruimte laat voor uitbreiding (course, project, event)?
2. Welke technische setup is geschikt voor een reproduceerbare PostgreSQL-omgeving op een ontwikkelmachine?
3. Hoe bouw je de eager loader zo op dat de output 1-op-1 overeenkomt met de JSON-structuur die in iteratie 1 werkte?
4. Leveren de testscenario's uit iteratie 1 dezelfde kwaliteit op als de context uit de database wordt gehaald in plaats van uit een bestand?

## Technische keuzes

### Database: PostgreSQL

Deze keuze is al in iteratie 1 onderbouwd en wordt hier bevestigd. De twee belangrijkste redenen:

- **JSONB** voor flexibele velden zoals feedbackobjecten en competentiedata, zonder dat het schema rigide wordt
- **pgvector** als latere uitbreiding voor RAG over ongestructureerde Canvas-content, zonder dat er een aparte vector-database nodig is

In iteratie 2 zelf worden JSONB en pgvector nog niet actief gebruikt. Het zijn toekomstige voordelen die de keuze rechtvaardigen ten opzichte van bijvoorbeeld SQLite of MySQL.

### Uitvoeringsomgeving: Docker

PostgreSQL kan op twee manieren draaien: via een directe installatie op Windows of via Docker. Voor dit project is gekozen voor Docker, om drie redenen:

1. **Reproduceerbaarheid**: de complete database-setup staat als code in het project (in een `docker-compose.yml`). Iedereen in de groep kan met één commando dezelfde omgeving starten, zonder installatiegedoe of verschillen in Windows-versies.
2. **Schoon weggooien**: de database leeft in een container. Als er iets kapot gaat of het schema verandert, kan de container in enkele seconden opnieuw worden opgebouwd zonder iets achter te laten op het systeem.
3. **Dichter bij productie**: in een echt deployment draait de database hoogstwaarschijnlijk ook in een container. De setup die hier wordt geleerd, is direct bruikbaar in latere sprints.

Docker wordt in dit project voor het eerst gebruikt. Voor de PoC is alleen basale kennis nodig: een container starten, stoppen en de logs bekijken. Dat wordt in de prototype-fase (iteratie 2-2) beschreven met concrete commando's.

### Toegang vanuit Python: `psycopg` v3

Er is bewust gekozen om geen ORM (zoals SQLAlchemy) te gebruiken. Een ORM voegt voor een PoC met een handvol tabellen meer overhead toe dan het oplevert: je moet een model-laag onderhouden, mappings definieren, en je verliest zicht op de werkelijke query's die worden uitgevoerd. Met `psycopg` schrijf je SQL direct en heb je volledige controle.

Voor de iteraties die later komen (function calling, schrijfacties) blijft deze keuze houdbaar: de query's zijn nog steeds beperkt in aantal en complexiteit.

### Migraties: plat SQL-bestand

Een tool als Alembic is overkill voor deze fase. Het schema staat in een enkel `schema.sql` bestand dat bij het opstarten van de container wordt uitgevoerd. Als het schema verandert, wordt de container opnieuw opgebouwd. Simpel en passend bij de PoC-schaal.

## Aanpak

### Databaseschema

Het schema blijft minimaal in deze iteratie. Doel: de huidige drie testscenario's ondersteunen en voorbereiden op uitbreiding.

Entiteiten in iteratie 2:

- **student**: basisgegevens van de student (id, naam, opleiding)
- **competentie**: de HBO-i competenties met per niveau een definitie (gevuld vanuit de competenties.json uit iteratie 1)
- **student_competentie_voortgang**: koppelt student aan competentie, met status (bezig, behaald) en niveau
- **activiteit**: geplande of afgeronde activiteiten van een student, met datum en type

Entiteiten als `course`, `project` en `event` worden in deze iteratie nog niet toegevoegd. De scenario's hebben ze niet nodig, en de scope van iteratie 2 is de overstap naar een database, niet het uitbouwen van een volledig datamodel. Die uitbreiding komt in iteratie 3 of later, gedreven door de use cases van function calling.

### Seed-data

Een Python scriptje (`seed.py`) vult de database met dezelfde inhoud als de `student.json` en `competenties.json` uit iteratie 1. Hierdoor is de output van de chatbot direct vergelijkbaar tussen beide iteraties. Als een scenario in iteratie 1 slaagde, moet het in iteratie 2 ook slagen, mits de loader de data correct ophaalt en samenstelt.

Er worden minimaal drie studenten geseed: de bestaande fictieve student uit iteratie 1, plus twee varianten met andere voortgang, zodat later ook scenario's met meerdere studenten getest kunnen worden.

### Eager loader

De loader is een Python-module (`loader.py`) met een functie `laad_student_context(student_id)`. Die functie:

1. Maakt verbinding met PostgreSQL via `psycopg`
2. Haalt de studentgegevens, de competentievoortgang en de activiteiten op
3. Zet die samen in een Python-dict die qua structuur gelijk is aan de `student.json` uit iteratie 1
4. Geeft de dict terug

De output van de loader wordt in de chatbot omgezet naar JSON en in de system prompt gezet, net zoals in iteratie 1. Hierdoor hoeft de rest van de chatbot-code vrijwel niet te veranderen.

### Chatbot aanpassen

In `chatbot.py` wordt de regel die `student.json` leest vervangen door een aanroep naar `laad_student_context()`. De student-id wordt als command-line argument meegegeven, zodat je eenvoudig kan wisselen tussen studenten tijdens het testen.

De system prompt, de modelkeuze (Qwen 2.5 14B) en de manier van context aanbieden blijven ongewijzigd. Dat is bewust: als er een verschil in kwaliteit optreedt, moet dat komen door de data-laag, niet door andere variabelen.

## Testscenario's

Per student worden vier scenario's gedraaid. Twee daarvan (planning en afgelopen week) zijn generiek en voor iedere student hetzelfde. Twee zijn afgestemd op de focus-laag van de betreffende student, zodat de vragen aansluiten op diens voortgang en activiteiten.

De vier categorieen:

1. **Voortgang en advies over een specifieke competentie** (competentie-specifiek per student)
2. **Planning opvragen** (generiek)
3. **Koppeling competentie aan project** (competentie-specifiek per student)
4. **Reflectie op recent afgerond werk** (generiek, nieuw in iteratie 2)

### Per-student invulling

Sam (Infrastructure focus):

- "Ik wil Infrastructure Analyse niveau 2 behalen. Wat moet ik daarvoor doen?"
- "Wat staat er de komende dagen op mijn planning?"
- "Welk type document past het beste om Infrastructure Advise aan te tonen in mijn huidige project? Geef alleen een korte aanbeveling met motivatie, geen uitgewerkt document."
- "Welke activiteiten heb ik de afgelopen week afgerond?"

Jana (User Interaction focus):

- "Ik wil User Interaction Design niveau 2 behalen. Wat moet ik daarvoor doen?"
- "Wat staat er de komende dagen op mijn planning?"
- "Welk type document past het beste om User Interaction Advise aan te tonen in mijn huidige project? Geef alleen een korte aanbeveling met motivatie, geen uitgewerkt document."
- "Welke activiteiten heb ik de afgelopen week afgerond?"

Omar (Software focus):

- "Ik wil Software Realise niveau 2 behalen. Wat moet ik daarvoor doen?"
- "Wat staat er de komende dagen op mijn planning?"
- "Welk type document past het beste om Software Design aan te tonen in mijn huidige project? Geef alleen een korte aanbeveling met motivatie, geen uitgewerkt document."
- "Welke activiteiten heb ik de afgelopen week afgerond?"

### Waarom deze opzet

- **Per student afstemmen op focus**: een UX-vraag aan de backend-student levert niks bruikbaars, dus elke student krijgt vragen die passen bij diens voortgang.
- **Scenario 3 expliciet afbakenen**: een eerdere versie ("Welk document kan ik schrijven om...") leidde ertoe dat Qwen een volledig document genereerde met verzonnen inhoud. De herformulering ("Welk type document past het beste... geef alleen een korte aanbeveling") dwingt een antwoord op het juiste abstractieniveau.
- **Scenario 4 leunt op een datumfilter**: in iteratie 1 was dit niet realistisch te testen omdat alle activiteiten statisch in een JSON stonden. Nu wel, en het laat zien of de loader de juiste subset van data doorgeeft.

De testvragen zijn per student opgenomen in `students.json`, zodat ze data-driven blijven en een nieuwe student eenvoudig toe te voegen is met eigen vragen.

## Criteria voor succes

Iteratie 2 is geslaagd als:

- De database start schoon op via Docker met één commando en de seed-data is volledig geladen
- De eager loader haalt voor een gegeven student-id dezelfde context op als de `student.json` uit iteratie 1
- Scenario's 1 tot en met 3 geven dezelfde kwaliteit output als in iteratie 1 (geen regressie)
- Scenario 4 levert een concreet antwoord met alleen de activiteiten uit de laatste zeven dagen

Iteratie 2 is mislukt als:

- De loader onvolledige of verkeerde data oplevert waardoor de chatbot regressie vertoont op de eerste drie scenario's
- De Docker-setup te veel wrijving oplevert om reproduceerbaar te draaien op de ontwikkelmachines in de groep
- Het schema te beperkt blijkt om scenario 4 goed te ondersteunen

## Vooruitblik

Als deze iteratie slaagt, is de basis gelegd voor iteratie 3: function calling. In die iteratie haalt het model data pas op als de vraag daarom vraagt, in plaats van alles vooraf in te laden. Het schema uit deze iteratie wordt dan uitgebreid met course, project en event, omdat function calling-scenario's die entiteiten nodig hebben (bijvoorbeeld: docent vraagt naar voortgang van student X in cursus Y).

De loader die in iteratie 2 wordt gebouwd, verandert in iteratie 3 van rol: in plaats van een vaste eager-load functie wordt het een verzameling kleinere functies die stuk voor stuk als tool aan het model worden aangeboden.

## Conclusie

*Wordt ingevuld na het bouwen en testen van het prototype (zie iteratie2-2-prototype).*

---

## Competentieverantwoording

**Infrastructure (Infrastructure) - Analyse - Niveau 1**

In dit document analyseer ik de overstap van een bestandsgebaseerde context-bron naar een PostgreSQL database voor de chatbot. Ik evalueer de mogelijke uitvoeringsomgevingen (directe installatie versus Docker), de databasekeuze (PostgreSQL versus MySQL of SQLite), en de manier waarop de bestaande eager loading vertaald moet worden naar een query-gebaseerde loader. De analyse is gebaseerd op concrete kwaliteitscriteria (reproduceerbaarheid, geen regressie, minimaal schema) en sluit aan bij de use cases die al in iteratie 1 zijn vastgesteld. Dit is een analyse van een eenvoudige infrastructuur in een voorspelbare context.

**Infrastructure (Infrastructure) - Advise - Niveau 1**

Op basis van die analyse adviseer ik in dit document een concrete technische inrichting voor iteratie 2: PostgreSQL in een Docker-container, `psycopg` v3 als Python-driver zonder ORM, een plat `schema.sql` voor migraties, en een minimaal schema met vier tabellen dat ruimte laat voor uitbreiding. Ook beargumenteer ik waarom de bestaande modelkeuze (Qwen 2.5 14B) en promptopzet bewust ongewijzigd blijven, zodat kwaliteitsverschillen eenduidig te herleiden zijn naar de data-laag. Dit advies wordt gegeven binnen een voorspelbare projectcontext en past bij de eisen van een proof-of-concept.

**Infrastructure (Infrastructure) - Design - Niveau 1**

In dit document ontwerp ik de infrastructuur voor iteratie 2 op hoofdlijnen: de opbouw van de database-omgeving via Docker, de vier tabellen in het schema, de rol van de eager loader in de chatbot-flow, en de testopzet met de drie bestaande scenario's plus een vierde database-specifiek scenario. Het ontwerp volgt bestaande richtlijnen voor hardware- en software-infrastructuur (containerisatie, direct SQL, reproduceerbare opzet) en past binnen een gestructureerde en voorspelbare context.
