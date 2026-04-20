# Iteratie 2 - Conclusie

**Sprint 2 | Infrastructure (Infrastructure) - Realise, Analyse & Advise - Niveau 1**
**Datum:** april 2026
**Auteur:** Tijn Knapen

## Terugblik op de onderzoeksvraag

> Kan een PostgreSQL database de mock JSON vervangen als context-bron voor een student-sessie, zonder dat de kwaliteit van de chatbot-antwoorden terugvalt?

**Antwoord: ja.**

De overstap van een bestandsgebaseerde context (`student.json` uit iteratie 1) naar een PostgreSQL database levert geen kwaliteitsverlies op. De chatbot geeft op dezelfde drie testscenario's vergelijkbare antwoorden als in iteratie 1, en het nieuwe scenario dat alleen in een echte database te testen is (activiteiten afgerond in de afgelopen week) werkt grotendeels naar verwachting. De belangrijkste observatie is dat regressies uitbleven: de extra laag tussen de data en het model heeft geen negatief effect gehad op hoe Qwen 2.5 14B met de context omgaat.

## Deelvraag 1 - Schemaontwerp

Het uiteindelijke schema bevat vier tabellen:

- **student** (id, naam, opleiding, semester, project)
- **competentie** (id, code, naam, laag, definities JSONB)
- **student_competentie_voortgang** (student_id, competentie_id, niveau_behaald, niveau_bezig, status, toelichting)
- **activiteit** (id, student_id, titel, type, datum, afgerond, beschrijving)

Het onderzoeksdocument (iteratie2-1) had oorspronkelijk een nog minimaler schema in gedachten: alleen de basisvelden, zonder `toelichting` op voortgang en zonder `project` op student. Tijdens het bouwen bleek dat ontoereikend om de context uit iteratie 1 volledig te reproduceren. De `toelichting` per voortgang-item en een `project`-veld op de student waren nodig om scenario 3 en de detailvragen uit scenario 1 goed te ondersteunen.

Dit is een klein voorbeeld van een punt dat in deze iteratie heel letterlijk werd: welke data je wel en niet opneemt, stuurt direct de kwaliteit van de antwoorden. Een strakker schema betekent niet per definitie een beter schema.

**Competenties in de database**

Elke combinatie van laag en activiteit is opgeslagen als een aparte rij met een code (bijvoorbeeld `UI-De` voor User Interaction Design), de laag, de activiteit en de drie niveau-definities in een JSONB-veld. Dat maakt 25 competentie-activiteit combinaties bij 5 lagen × 5 activiteiten. De voortgang per student refereert naar deze codes via een foreign key.

Deze opzet maakt het schema compact en query-baar, maar in iteratie 2 wordt de competentiedata zelf niet uit de database gelezen. De chatbot gebruikt nog steeds `competenties.json` uit iteratie 1 direct, omdat de statische framework-context niet per sessie ververst hoeft te worden. De database-variant is voorbereid voor het moment dat function calling het model gericht laat zoeken in die data (iteratie 3).

## Deelvraag 2 - Uitvoeringsomgeving

PostgreSQL draait in een Docker-container, opgestart via een `docker-compose.yml`. De keuze voor Docker is in het onderzoeksdocument onderbouwd op drie punten: reproduceerbaarheid, schoon weggooien en de nabijheid tot een productie-setup. In de praktijk werkten al die drie punten uit zoals verwacht.

- Reproduceerbaarheid is bewezen doordat dezelfde compose-opzet werkte op de ontwikkelmachine zonder extra installatiestappen voor PostgreSQL zelf.
- Schoon weggooien is meerdere keren gebruikt tijdens het ontwikkelen: het schema is twee keer aangepast (toevoeging van `toelichting`, `semester` en `project`), en elke keer was een `docker compose down -v` gevolgd door `up -d` en `python seed.py` voldoende om met een schone stand verder te gaan.
- De nabijheid tot productie is minder direct merkbaar in een PoC, maar de opzet waarin de database een losse container is met vaste credentials en poortmapping, is dezelfde vorm als een productiedeployment met een managed database.

Python verbindt via `psycopg` v3 zonder ORM. Dat voelde onder deze omstandigheden prettig: de queries zijn klein, er zijn er weinig, en je ziet direct wat er over de lijn gaat. Een ORM had in deze fase meer overhead toegevoegd dan weggenomen.

## Deelvraag 3 - Loader

De loader (`loader.py`) heeft een simpele publieke functie: `laad_student_context(student_id)` geeft een dict terug die qua structuur lijkt op de `student.json` uit iteratie 1. Intern gebeurt dit met drie queries:

1. Studentgegevens (inclusief semester en project)
2. Voortgang met een join op de competentie-tabel, zodat de laag- en activiteit-namen meekomen
3. Activiteiten gefilterd op `student_id`, gesorteerd op datum

De dict wordt in `chatbot.py` omgezet naar JSON en in de system prompt gestopt op exact dezelfde plek waar in iteratie 1 `student.json` stond. Hierdoor hoefde de prompt-opbouw en de chatbot-logica nauwelijks te veranderen.

Een kleine bijstelling tijdens het testen: aanvankelijk gaf de loader de primary key `id` van elke activiteit mee. Dat leidde ertoe dat Qwen die interne id (bijvoorbeeld "12") letterlijk citeerde in zijn antwoorden ("zie activiteit 12"). Dat is een DB-intern detail dat niets betekent voor de gebruiker. De `id` is uit de loader-output gehaald. Dit is een klein maar principieel punt: zorg dat de data die naar het model gaat alleen informatie bevat die in de domeinbetekenis iets toevoegt, geen technische artefacten.

## Deelvraag 4 - Dezelfde kwaliteit als iteratie 1?

Getest is met één student (Jana de Wit, id 2). Dat was een bewuste keuze: het hele punt van iteratie 2 is dat de chatbot per sessie een specifieke student selecteert en diens data ophaalt. Drie studenten achter elkaar testen zou alleen hetzelfde drie keer bewijzen. Waar we het bewijs uit halen, is dat het voor iedere student correct gebeurt op basis van zijn eigen voortgang en activiteiten, en dat de per-student testvragen tot relevante antwoorden leiden.

De vier scenario's voor Jana leverden het volgende op:

**Scenario 1 (Design niveau 2)**: antwoord is uitgebreid en gekoppeld aan haar echte activiteiten (interviews, wireframes, nudging prototype, usability test, UX-adviesnotitie). Er is scope drift: de vraag ging over Design niveau 2, het model behandelt ook Analyse niveau 2 en Advise niveau 2. Dat is enerzijds verdedigbaar omdat voor het behalen van een niveau meerdere facetten nodig zijn, maar strikt gelezen niet wat gevraagd is. Het model haalt daarbij soms eigen kennis binnen, zoals "ethiek en duurzaamheid" onder Advise, die eerder bij PS-2 thuishoort dan bij User Interaction Advise niveau 2. Dit is geen hard foutief gedrag maar wel een signaal dat de prompt strakker kan.

**Scenario 2 (Planning)**: netjes, zonder problemen. Twee toekomstige activiteiten genoemd met correcte datums, de projectnaam wordt herkend, geen bleed met data van andere studenten, geen verzonnen weekindeling. Dit is direct vergelijkbaar met wat iteratie 1 opleverde, maar nu gevoed vanuit de database.

**Scenario 3 (Welk document)**: de eerste versie van deze vraag ("Welk document kan ik schrijven om ... aan te tonen in mijn project?") leverde in een tussentest een compleet uitgewerkt document op met verzonnen bevindingen. De formulering zette Qwen op het verkeerde spoor: hij las "welk document" als "schrijf het document". Na herformulering naar "Welk type document past het beste om ... aan te tonen in mijn huidige project? Geef alleen een korte aanbeveling met motivatie, geen uitgewerkt document" kwam het gewenste gedrag: een alinea met aanbeveling en korte motivatie, gekoppeld aan de voortgang van de student. Dit laat zien dat expliciete afbakening van de gewenste vorm van een antwoord meer uitmaakt dan de kwaliteit van het model zelf.

**Scenario 4 (Afgelopen week)**: het nieuwe scenario dat alleen met een echte database te testen is. Het model noemt drie activiteiten die als "afgerond" gemarkeerd staan, waarvan twee binnen de afgelopen zeven dagen vallen (15 en 18 april, bij vandaag 20 april). De derde (11 april) valt daarbuiten. Het model interpreteert "afgelopen week" hier ruimer dan letterlijk zeven dagen. Dat is geen pure hallucinatie (de datum klopt en de activiteit is echt afgerond), maar wel een boundary-probleem.

De cosmetische observatie bij dit scenario: omdat één activiteit geen `beschrijving` heeft, citeert het model de string `null` letterlijk ("Geen beschrijving beschikbaar (null)"). Dat is het gevolg van hoe JSON-serialisatie werkt: een Python `None` wordt in JSON een `null`, en het model pakt die waarde op. Oplosbaar door in de loader de velden met `None` gewoon weg te laten, zodat het model ze niet ziet.

## Wat werkt en wat niet

**Wat werkt**

- De database-architectuur met vier tabellen dekt de huidige testscenario's en laat ruimte voor uitbreiding (course, project-entiteit, event) zonder dat de bestaande structuur op de schop moet.
- Docker als uitvoeringsomgeving werkt zonder problemen. De compose-opzet heeft zich bewezen door meerdere schemawijzigingen heen.
- `psycopg` zonder ORM is voor deze schaal een goede keuze. Geen verborgen magie, geen extra abstractielaag.
- De eager loader produceert een datastructuur die vrijwel identiek is aan de `student.json` uit iteratie 1, waardoor de chatbot-code nauwelijks aangepast hoefde te worden. Dat is precies de bedoeling: de data-laag is vervangbaar zonder dat de gebruikende code verandert.
- Per-student testvragen leiden tot betere, gerichtere antwoorden. Een UX-student krijgt UX-vragen, een backend-student krijgt software-vragen. Dit is een eenvoudige scheiding die in test-setups snel vergeten wordt maar significant verschil maakt.
- Scenario 3 is met promptaanscherping onder controle gebracht.

**Wat aandacht nodig heeft**

- Scope drift bij complexe vragen (scenario 1) blijft bestaan. Een strakkere prompt of een expliciete instructie als "focus alleen op de gevraagde activiteit" kan helpen, maar vermindert ook de rijkheid van het antwoord. Dit is een ontwerpafweging, niet een bug.
- Tijd-gebaseerde vragen (scenario 4) worden niet letterlijk genomen. "Afgelopen week" is voor het model ambigu. De oplossingsrichting is function calling (iteratie 3): het model vraagt een datumrange op, de code past de filter toe, het model interpreteert geen datums meer.
- Cosmetisch: `null`-waarden kunnen uit de loader-output worden weggelaten zodat het model ze niet ziet.

## Aanbevelingen voor iteratie 3

Iteratie 3 richt zich op **function calling**. Na iteratie 2 ligt er een werkende database-laag met een loader die complete studentcontext ophaalt. Dit is adequaat voor een student-sessie waarin alles relevant is, maar het lost twee dingen niet op:

1. **Een docent-sessie**. Zodra een docent de chatbot gebruikt voor meerdere studenten, past niet alle data in het context window. Eager loading van alle studentdata schaalt niet.
2. **Schrijfacties**. De chatbot kan nu alleen lezen. "Ik heb opdracht X afgerond" moet de database bijwerken, en dat gaat niet met eager loading.

Bij function calling krijgt het model een lijst van functies aangeboden en roept het die aan wanneer het data nodig heeft of iets wil veranderen. Dat lost de twee bovenstaande punten op, en maakt als bijvangst het tijd-boundary probleem van scenario 4 kleiner: het model hoeft "afgelopen week" niet meer te interpreteren, het geeft gewoon twee datums door aan een functie die de juiste filter uitvoert.

Het schema uit iteratie 2 wordt in iteratie 3 uitgebreid met de entiteiten die eerder bewust zijn uitgesteld: course, project als eigen tabel in plaats van een TEXT-veld, en event. Die zijn nodig om realistische function calling-scenario's te bouwen (docent vraagt naar voortgang van student X in cursus Y).

## Vooruitblik: Modal.com

In Bijlage E van het adviesrapport staat al beschreven dat de modelkeuze (Qwen 2.5 14B) een gevolg is van de beschikbare hardware (RTX 3080), niet van een inhoudelijke voorkeur. In een later stadium wordt onderzocht of Modal.com als cloud-uitvoeringsomgeving kan dienen voor zwaardere modellen zoals Qwen 2.5 72B. De architectuur uit iteratie 2 is daarvoor klaar: de chatbot communiceert met het model via een HTTP-call, ongeacht waar dat model draait. Database, loader en testopzet kunnen ongemoeid blijven.

---

## Competentieverantwoording

**Infrastructure (Infrastructure) - Realise - Niveau 1**

Ik heb het ontwerp uit iteratie 2-1 gebouwd: PostgreSQL-container in Docker, schema met vier tabellen, seed-script vanuit JSON en een loader-module die per sessie studentcontext ophaalt. De chatbot uit iteratie 1 is aangepast zodat hij de database gebruikt in plaats van een bestand, en getest met vier scenario's.

**Infrastructure (Infrastructure) - Analyse - Niveau 1**

Op basis van de testresultaten heb ik vastgesteld waar de grenzen van de huidige opzet liggen. De data-laag werkt zonder regressie, maar er blijven twee beperkingen: scope drift bij complexe vragen en ambigue boundaries bij tijd-gebonden vragen. Beide zijn model- en promptgerelateerd, niet data-gerelateerd.

**Infrastructure (Infrastructure) - Advise - Niveau 1**

Op basis van die analyse heb ik geadviseerd hoe iteratie 3 eruit moet zien: function calling als architectuurkeuze om de beperkingen op te lossen, uitbreiding van het schema met course, project en event, en Modal.com als vervolgonderzoek voor zwaardere modellen. Dit is concrete richting voor de volgende infrastructuur-stap binnen een voorspelbare context.
