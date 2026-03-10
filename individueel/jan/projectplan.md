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

We werken iteratief in vier sprints. De HBO-i activiteiten (analyseren, adviseren, ontwerpen, realiseren, manage & control) zijn leidend maar niet strikt lineair - ze kunnen cyclisch doorlopen worden. De analyse loopt tot halverwege sprint 2, waarna er ruim tweeenhalve sprint overblijft om te ontwerpen en bouwen.

### Sprint 1: Analyseren (t/m 17 maart)

**Doel:** Het probleem en de context helder krijgen.

**Activiteiten:**

- Stakeholderanalyse - behoeften en pijnpunten inventariseren bij studenten (dag + avond), coaches en docenten via enquetes en paper prototypes
- Analyse huidig ecosysteem - Canvas, FeedPulse, M365 en overige tools analyseren op functionaliteit, beperkingen en koppelmogelijkheden (API, LTI, OAuth)
- Benchmarkonderzoek - vergelijkbare platformen en tools onderzoeken (LearnWise AI, Modern Campus Involve, PREPARE-project)
- Start requirementsanalyse - eerste functionele en niet-functionele eisen opstellen
- Briefing terugsturen naar Eric ter validatie

**Deliverables:**

- Ingevulde enquetes met resultaten (studenten + coaches/docenten)
- Ecosysteemanalyse document
- Benchmarkrapport
- Eerste versie requirements

**Sprintdemo:** 17 maart

### Sprint 2: Analyseren afronden + Adviseren + start Ontwerpen (t/m 19 april)

**Doel:** Analyse afronden, onderbouwde keuzes maken, eerste ontwerp schetsen.

**Activiteiten:**

- Requirementsanalyse afronden - eisen aanscherpen, acceptatiecriteria formuleren, prioriteren
- Ideation-fase - ideeen genereren, scoren op criteria (haalbaarheid, stakeholderwaarde, impact, complexiteit, uitrolbaarheid, overdraagbaarheid, innovatie)
- Technologieadvies - adviseren over geschikte technologieen en frameworks, vastleggen in ADR's
- Bouw-vs-koop-advies - wat bouwen we zelf, waar sluiten we aan, wat is buiten scope?
- Advies aan stakeholder - terugkoppeling naar Eric over richting en haalbaarheid
- Paper prototyping - meerdere ontwerprichtingen verkennen op papier
- Eerste architectuurschets - C4-diagrammen (level 1-2), eerste wireframes

**Deliverables:**

- Geprioriteerde requirementslijst met acceptatiecriteria
- Ideation-scorematrix met gekozen richting
- Technologieadvies met ADR's
- Paper prototypes
- C4 level 1-2 diagrammen

**Sprintdemo:** 19 april

### Sprint 3: Ontwerpen + Realiseren (t/m 24 mei)

**Doel:** Van ontwerp naar een werkend proof of concept.

**Activiteiten:**

- Softwarearchitectuur uitwerken (C4 level 2-3, ADR's aanscherpen)
- Interactieontwerp en wireframes verfijnen
- Database-ontwerp en infrastructuurontwerp
- Kernflow implementeren als PoC, aansluitend op Canvas via API/LTI
- Eerste usability-tests met echte gebruikers
- Infrastructuur opzetten (containers, deployment)

**Deliverables:**

- Uitgewerkte softwarearchitectuur (C4, ADR's)
- Werkend PoC met kernflow
- Testresultaten usability-tests
- Infrastructuurdocumentatie

**Sprintdemo:** 24 mei

### Sprint 4: Realiseren + Manage & Control (t/m 23 juni)

**Doel:** PoC afronden, kwaliteit borgen, overdraagbaar opleveren.

**Activiteiten:**

- PoC uitbreiden en bijsturen op basis van testresultaten
- CI/CD-pipeline inrichten en formaliseren
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

| Sprint   | Het is klaar wanneer...                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Sprint 1 | Het probleem is helder, enqueteresultaten zijn geanalyseerd, ecosysteem is in kaart, Eric heeft de briefing gevalideerd      |
| Sprint 2 | Er is een gekozen richting met onderbouwing (scorematrix), eerste ADR's en C4-diagrammen staan, paper prototypes zijn getest |
| Sprint 3 | Er is een werkend PoC dat de kernflow demonstreert, usability-tests zijn uitgevoerd met minimaal 2 gebruikerstypen           |
| Sprint 4 | PoC is afgerond en gedocumenteerd, CI/CD draait, overdrachtsdocumentatie staat op git.fhict.nl, portfolio's zijn compleet    |
