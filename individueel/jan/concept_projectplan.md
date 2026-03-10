# Projectplan - Studentgericht leerplatform voor vraaggestuurd onderwijs

**Projectgroep:** Jan van Hest, Tamara Lemmens, Burak Ergin, Wares Helmand, Karin van Gompel, Tijn Knapen. 
**Stakeholder:** Eric Slaats (Digital Transformer, Fontys)
**Coaches:** Lennart, Robin, Coen
**Periode:** Februari - Juli 2026 (16-18 weken)

---

## 1. Aanleiding en context

Studenten binnen Fontys werken dagelijks met Canvas als learning management systeem. Daaromheen hangt een ecosysteem van losgekoppelde tools: portfolio (Portflow), FeedPulse voor feedback, Fontys Links als startpagina, en Studycoach voor coachoverdracht. Elk lost een deelprobleem op, maar samen zorgen ze voor versnippering.

Het kernprobleem is tweeledig. Ten eerste kunnen studenten niet vinden wat ze nodig hebben - de zoekfunctie hapert, informatie is verspreid, en content is overwegend tekst-gebaseerd terwijl studenten steeds slechter lezen. Ten tweede is Canvas ingericht rondom modules en cursussen, terwijl het onderwijs steeds meer richting vraaggestuurd werken beweegt. Dit geldt voor HBO-ICT open learning, maar ook voor de opleiding Digital Transformer waar ICT gecombineerd wordt met andere domeinen en challenges varieren van drie weken tot drie jaar.

De stakeholder Eric Slaats bevestigt dit beeld vanuit zijn ervaring met de Digital Transformer. Hij ziet dat studenten de docent vragen in plaats van het systeem te gebruiken, dat workshops slecht bezocht worden (juist door wie het nodig heeft), en dat de huidige LMS-inrichting niet aansluit bij vraaggestuurd onderwijs.

## 2. Kernvraag

> _Hoe verbeter je de leerervaring binnen Canvas zodat niet de module maar de student en diens activiteiten centraal staan, en vraaggestuurd onderwijs ondersteund wordt met zo weinig mogelijk frictie?_

Canvas blijft de basis - een nieuw LMS bouwen is niet de bedoeling. Canvas heeft een open API en via LTI (Learning Tools Interoperability) kunnen externe tools naadloos geintegreerd worden. De technologische context omvat web-technologie, Canvas API-integratie, LTI-koppelingen en de mogelijke toepassing van AI.

## 3. Doelstelling

Aan het einde van het semester staat er een gevalideerd proof of concept dat aantoont hoe de Canvas-ervaring verbeterd kan worden voor studenten en coaches binnen vraaggestuurd onderwijs. Het PoC hoeft niet productierijp te zijn - het gaat om het aantonen dat een concept werkt. Analyse, documentatie en architectuurbeslissingen worden zo opgezet dat toekomstige teams het project kunnen overnemen en voortzetten.

## 4. Scope

### Binnen scope

- Gebruikersonderzoek bij studenten (dag + avond), coaches en docenten
- Ideation-fase: breed ideeen ophalen, scoren op criteria, richting kiezen
- Proof of concept dat aansluit op Canvas via API en/of LTI
- Architectuurdocumentatie (C4-diagrammen, ADR's) gericht op overdraagbaarheid
- Validatie met echte gebruikers

### Buiten scope

- Een compleet nieuw LMS bouwen
- Productierijpe software voor alle gebruikersrollen
- Migratie van bestaande tools (FeedPulse, Portflow) naar een nieuw systeem
- Beheer en hosting na het semester

## 5. Aanpak

### Procesmodel: Design Thinking

We gebruiken Design Thinking als procesmodel. Dit sluit aan bij wat Eric vraagt (ideation, prototypen, testen met gebruikers) en mapt op de HBO-i activiteiten:

| Design Thinking | HBO-i activiteit       | Sprint                    |
| --------------- | ---------------------- | ------------------------- |
| Empathize       | Analyseren             | Sprint 1                  |
| Define          | Analyseren             | Sprint 1 + begin sprint 2 |
| Ideate          | Adviseren              | Sprint 2                  |
| Prototype       | Ontwerpen              | Sprint 2 + sprint 3       |
| Test            | Realiseren / Evalueren | Sprint 3 + sprint 4       |
| _Doorlopend_    | Manage & Control       | Alle sprints              |

**Belangrijk:** we waken ervoor niet te lang in de analysefase te blijven hangen. Het doel is zo snel mogelijk naar iets tastbaars - een prototype dat we kunnen testen. Analyse is een middel, geen doel.

### Hypothese

Studenten gebruiken Canvas vooral voor inleveren en informatie zoeken, maar ervaren frictie doordat:

- informatie versnipperd is over meerdere tools
- content overwegend tekst-gebaseerd is
- activiteiten niet centraal staan in de navigatie

Deze hypothese sturen we bij op basis van enqueteresultaten en gesprekken met gebruikers.

### Onderzoeksmethoden

| Type           | Methode                                                              |
| -------------- | -------------------------------------------------------------------- |
| Kwalitatief    | Interviews studenten, interviews coaches, observaties Canvas-gebruik |
| Kwantitatief   | Enquete studenten, enquete docenten/coaches                          |
| Systeemanalyse | Canvas structuur en API, LMS-concurrenten, bestaande LTI-tools       |

### Sprint 1: Empathize + Define (t/m 17 maart)

**Doel:** Gebruikers begrijpen, probleem scherp krijgen.

**Activiteiten:**

- Enquetes uitzetten bij studenten (dag + avond) en coaches/docenten
- Canvas-omgeving analyseren op structuur, beperkingen en API-mogelijkheden
- Benchmarkonderzoek - vergelijkbare platformen en tools verkennen
- Paper prototypes inzetten bij gesprekken om behoeften concreet te maken
- Briefing terugsturen naar Eric ter validatie
- Probleemstelling en user needs formuleren

**Deliverables:**

- Enqueteresultaten met analyse
- Ecosysteemanalyse
- Benchmarkrapport
- Probleemstelling en eerste user needs

**Sprintdemo:** 17 maart

### Sprint 2: Define afronden + Ideate + Prototype (t/m 19 april)

**Doel:** Probleemstelling definitief maken, ideeen genereren en scoren, eerste prototype bouwen.

**Activiteiten:**

- Probleemstelling en requirements definitief maken, prioriteren
- Ideation-workshop - breed ideeen ophalen, scoren op criteria (haalbaarheid, stakeholderwaarde, impact, complexiteit, uitrolbaarheid, overdraagbaarheid, innovatie)
- Richting kiezen op basis van scorematrix
- Technologieadvies vastleggen in ADR's
- Paper prototypes maken en testen met gebruikers
- Eerste architectuurschets - C4-diagrammen (level 1-2)
- Eerste werkend prototype (sprint 0 van het PoC)

**Deliverables:**

- Geprioriteerde requirementslijst
- Ideation-scorematrix met gekozen richting
- ADR's voor technologiekeuzes
- Geteste paper prototypes
- C4 level 1-2 diagrammen
- Eerste werkend prototype

**Sprintdemo:** 19 april

### Sprint 3: Prototype + Test (t/m 24 mei)

**Doel:** Prototype uitbouwen en valideren met echte gebruikers.

**Activiteiten:**

- Softwarearchitectuur uitwerken (C4 level 2-3, ADR's aanscherpen)
- Interactieontwerp en wireframes verfijnen
- Database-ontwerp en infrastructuurontwerp
- PoC uitbouwen: kernflow implementeren aansluitend op Canvas via API/LTI
- Usability-tests uitvoeren met minimaal 2 gebruikerstypen (student + coach)
- Infrastructuur opzetten (containers, deployment)

**Deliverables:**

- Uitgewerkte softwarearchitectuur (C4, ADR's)
- Werkend PoC met kernflow
- Testresultaten usability-tests
- Infrastructuurdocumentatie

**Sprintdemo:** 24 mei

### Sprint 4: Test + Opleveren (t/m 23 juni)

**Doel:** PoC afronden op basis van testfeedback, kwaliteit borgen, overdraagbaar opleveren.

**Activiteiten:**

- PoC bijsturen en uitbreiden op basis van testresultaten
- CI/CD-pipeline inrichten
- Kwaliteitsborging (integration tests, code reviews)
- Documentatie en overdracht via git.fhict.nl
- Architectuurdocumentatie finaliseren
- Portfolio en reflecties afronden

**Deliverables:**

- Afgerond PoC
- CI/CD-pipeline
- Overdrachtsdocumentatie op git.fhict.nl
- Individuele portfolio's

**Posterpresentatie:** 16 juni
**Sprintdemo:** 23 juni
**Beoordeling:** 3 juli

### Fasebewaking

Tijdens elk overleg checken we:

1. Waar zitten we nu in het Design Thinking proces?
2. Welke fase hoort hierbij?
3. Wat moeten we opleveren?
4. Welke onderzoeksmethode gebruiken we?

## 6. Mogelijke denkrichtingen

Op basis van het stakeholdergesprek en eerste verkenningen zijn de volgende thema's naar voren gekomen als mogelijke oplossingsrichtingen. De uiteindelijke keuze wordt gemaakt in de ideation-fase (sprint 2) op basis van de scorecriteria.

- **Zelfhulpzaamheid vergroten** - betere ontsluiting van course-inhoud, slimmer zoeken, informatie aanbieden op het moment dat het relevant is
- **Activiteiten centraal** - in plaats van modules als navigatiestructuur, de student en diens weekactiviteiten centraal zetten
- **Multimodale content** - dezelfde informatie aanbieden als tekst, video, audio, interactief voorbeeld of AI-dialoog
- **Nudging** - gewenst gedrag stimuleren zonder dwang (voortgangsindicatoren, tijdige suggesties, sociale vergelijking)
- **AI-ondersteuning** - chatbot voor course-navigatie, competentiemapping, gepersonaliseerde aanbevelingen
- **Personalisatie** - ervaring afstemmen op leerstijl, sturingsbehoefte en domein van de student

## 7. Risico's

| Risico                                          | Impact                                          | Kans   | Maatregel                                                                                             |
| ----------------------------------------------- | ----------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| Enquetes leveren te weinig respons op           | Onvoldoende data voor analyse                   | Middel | Enquetes kort houden, verspreiden via meerdere kanalen, Eric vragen om dagschoolstudenten te bereiken |
| Canvas API biedt onvoldoende mogelijkheden      | Gekozen richting technisch niet haalbaar        | Middel | API-documentatie vroeg verkennen, fallback via LTI                                                    |
| Scope te breed - te veel willen in een semester | Niets wordt af                                  | Hoog   | Ideation-scorematrix gebruiken om scherp te kiezen, MoSCoW-prioritering                               |
| Groepsleden hebben verschillende ambitieniveaus | Ongelijke voortgang, frictie                    | Middel | Heldere taakverdeling, regelmatige afstemming, coach betrekken                                        |
| Stakeholder niet beschikbaar voor feedback      | Keuzes niet gevalideerd                         | Laag   | Eric staat open voor contact, Teams-kanaal ingericht                                                  |
| Technologiekeuzes te vroeg vastleggen           | Richting gebaseerd op aannames i.p.v. onderzoek | Middel | Ideation-fase respecteren, geen technologie kiezen voor analyse af is                                 |

## 8. Communicatie en werkwijze

**Intern:**

- Groepscommunicatie via Microsoft Teams (kanaal ingericht)
- Wekelijkse afstemming op dinsdagavond (schoolavond)
- Documenten en code op git.fhict.nl

**Stakeholder:**

- Eric Slaats bereikbaar via Teams en e-mail
- Terugkoppeling na elke sprint via demo of document
- Eric bewust in stakeholderrol houden (niet coach)

**Coaches:**

- Lennart als primaire coach, Robin en Coen als aanvulling
- Feedbackmomenten koppelen aan sprintdemo's
- Individuele voortgang bespreken via portfolio

## 9. Definition of Done per sprint

| Sprint   | Het is klaar wanneer...                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Sprint 1 | Gebruikers zijn begrepen (enquetes geanalyseerd, ecosysteem in kaart), probleemstelling is geformuleerd, Eric heeft briefing gevalideerd |
| Sprint 2 | Er is een gekozen richting met onderbouwing (scorematrix), paper prototypes zijn getest, eerste werkend prototype draait, ADR's staan    |
| Sprint 3 | PoC demonstreert de kernflow, usability-tests zijn uitgevoerd met minimaal 2 gebruikerstypen, architectuur is uitgewerkt                 |
| Sprint 4 | PoC is afgerond en bijgestuurd op testfeedback, CI/CD draait, overdrachtsdocumentatie staat op git.fhict.nl, portfolio's zijn compleet   |
