# Semesterplan

**Challenge:** Studentgericht leerplatform voor vraaggestuurd onderwijs
**Student:** Jan van Hest | Semester 6 | HBO-ICT Open Learning, Fontys
**Stakeholder:** Eric Slaats (Digital Transformer)
**Coaches:** Lennart, Robin, Coen

---

**Activiteit:** Manage & Control
**Professional Skill:** Persoonlijk Leiderschap | Procesmanagement

**Omschrijving:**
Dit semesterplan beschrijft de competenties die ik dit semester wil aantonen, waarom die keuzes passend zijn bij het project, en hoe ik dat per sprint aanpak. Het is opgesteld voor mijzelf en mijn coaches als sturingsdocument voor het hele semester. Het leerproduct toont Manage & Control aan doordat het de activiteiten en scope per sprint plant en bewaakt in een complexe, ongestructureerde context waar de oplossingsrichting nog open is. Persoonlijk Leiderschap wordt aangetoond doordat ik mijn eigen leerontwikkeling beargumenteerd stuur, inclusief een expliciete reflectie op eerdere feedback over perfectionisme en het gebrek aan ervaring met gebruikersonderzoek.

---

## 1. Wat ga ik doen?

> _Hoe verbeter je de leerervaring binnen Canvas zodat niet de module maar de student en diens activiteiten centraal staan, en vraaggestuurd onderwijs ondersteund wordt met zo weinig mogelijk frictie?_

Canvas blijft de basis - een nieuw LMS bouwen is niet de bedoeling. Ik onderzoek hoe de bestaande omgeving via de Canvas API en LTI-koppelingen slimmer, toegankelijker en persoonlijker gemaakt kan worden. De eerste stap is het probleem helder krijgen via een ideation-fase, pas daarna volgen ontwerp- en realisatiekeuzes.

In sprint 2 is een werkende chatbot PoC gerealiseerd met een RAG-pipeline (NestJS backend, pgvector, Ollama embeddings, Anthropic API). Die PoC vormt de technische basis voor de verdere uitwerking en is het uitgangspunt voor de infrastructuurcompetentie.

**Competenties:**

| Architectuurlaag   | Niveau | Activiteiten                                                   |
| ------------------ | ------ | -------------------------------------------------------------- |
| Software (primair) | 3      | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |
| Infrastructuur     | 1      | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |
| User Interaction   | 2      | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |

> **Toelichting niveau Infrastructuur:** Op basis van een coachgesprek (sprint 2) is de ambitie voor Infrastructuur bijgesteld van niveau 2 naar niveau 1 (Taakgericht). Niveau 1 is realistisch aantoonbaar met de bestaande PoC en levert concrete, afvinkbare deliverables op. Als er tijd over is in sprint 3-4 wordt één activiteit - bij voorkeur Adviseren - naar niveau 2 (Probleemgericht) gepusht via een vergelijkende benchmark met een extra DOT-methode.

De verhouding tussen Infrastructuur en User Interaction hangt af van wat uit de analyse naar voren komt.

**Professional skills (niveau 3):** Methodische probleemaanpak, Onderzoek, Oplossing, Procesmanagement, Communicatie, Persoonlijke ontwikkeling.

---

## 2. Waarom is dit relevant?

Software niveau 3 is passend omdat het systeem functioneert binnen een context van bestaande systemen (Canvas, M365, FeedPulse). De problemen zijn vaag gedefinieerd, de oplossingsruimte is open, en ik moet zelfstandig bepalen welke richting het project opgaat. De architectuur moet rekening houden met uitbreidbaarheid voor toekomstige teams en kwaliteitseisen als schaalbaarheid en security.

Analyseren en adviseren als eerste stap is cruciaal omdat de challenge een denkrichting beschrijft, maar of die aansluit bij wat studenten, coaches en docenten nodig hebben moet eerst onderzocht worden. Eric benadrukte: begin niet met "dit gaan we bouwen" maar verken eerst breed.

Infrastructuur niveau 1 is passend bij de PoC-schaal van dit project. De coach bevestigde dat taakgerichte uitwerking - requirements opstellen, een blokkendiagram maken, een ADR schrijven, een testverslag opstellen en een runbook documenteren - volledig volstaat om niveau 1 op alle vijf activiteiten aan te tonen. De focus ligt niet op enterprise-infrastructuur, maar op bewuste, onderbouwde keuzes op PoC-niveau.

---

## 3. Hoe ga ik dat doen?

De activiteiten per sprint liggen niet vast - de volgorde kan veranderen op basis van nieuwe inzichten. Waar mogelijk worden activiteiten verdeeld binnen het team. De uitkomsten van de analyse bepalen uiteindelijk of de nadruk komt te liggen op software-architectuur, infrastructuur of user interaction.

### Sprint 1: Analyseren (t/m 17 maart)

Het probleem en de context helder krijgen.

- Stakeholderanalyse - kennismakingsgesprek met Eric Slaats gevoerd (4 maart). Behoeften en pijnpunten geïnventariseerd. Enquêtes uitgezet voor studenten en coaches/docenten. Interviews volgen in sprint 2 na verwerking van enquêteresultaten.
- Analyse huidig ecosysteem - Canvas API, LTI 1.3 en RAG verkend op functionaliteit, beperkingen en koppelmogelijkheden.
- Start requirementsanalyse - kernprobleem geformuleerd via 5W+1H en Ishikawa-diagram.
- Lo-fi prototype gebouwd als gespreksinstrument voor het tweede stakeholdergesprek - React-applicatie met wireframe/MUI thema-toggle.
- Projectplan grotendeels afgerond inclusief zeven deelvragen met DOT-methodes.

### Sprint 2: Analyseren afronden + Adviseren + start Ontwerpen (t/m 19 april)

De eerste helft rondt de analyse af. De tweede helft vertaalt bevindingen naar keuzes.

- Enquêteresultaten verwerken en interviews afnemen
- Requirementsanalyse afronden - eisen aanscherpen, acceptatiecriteria formuleren, prioriteren
- Technologieadvies - adviseren over geschikte technologieën, frameworks en koppelingen. Vastleggen in ADR's
- Bouw-vs-koop-advies - wat bouw ik zelf, waar sluit ik aan op bestaande systemen?
- Advies aan stakeholder - terugkoppeling naar Eric over wat haalbaar en wenselijk is
- Eerste architectuurschets - C4-diagrammen (level 1-2), eerste wireframes
- **[Infra - Analyseren]** Requirements opstellen vanuit infra-perspectief: responsietijd (<3 sec), geheugengebruik per LLM-aanroep, AVG-impact van studentdata in de vector database, schaalbaarheid (PoC-schaal vs. theoretisch maximum van 40.000 Fontys-studenten). _(HBO-i: bt.infrastructuur.analyseren.1 — Analyseren van een eenvoudige infrastructuur volgens een standaardmethode op basis van gegeven kwaliteitseisen)_

### Sprint 3: Ontwerpen + Realiseren (t/m 24 mei)

Van ontwerp naar een werkend proof of concept.

- Softwarearchitectuur uitwerken (C4 level 2-3, ADR's aanscherpen)
- Interactieontwerp en wireframes verfijnen
- Database-ontwerp en infrastructuurontwerp
- Kernflow implementeren als PoC, aansluitend op Canvas via API/LTI
- Eerste usability-tests met echte gebruikers
- **[Infra - Ontwerpen]** High-level blokkendiagram van de PoC-infrastructuur: frontend (LTI/Next.js) → backend (NestJS) → vector DB (pgvector) → Anthropic API. Per blok: lokaal of cloud, geschatte resource-behoefte. Toelichting per kwaliteitseis (security, budget, tijd, duurzaamheid). Korte "wat als 40k gebruikers?"-paragraaf als schaaladvies. _(HBO-i: bt.infrastructuur.ontwerpen.1 — Opstellen van specificaties voor een eenvoudige infrastructuur volgens een standaardmethode)_
- **[Infra - Adviseren]** Infrastructuur-ADR over hosting-keuze: lokaal draaien vs. VPS vs. managed cloud. Onderbouwd vanuit de kwaliteitseisen van de PoC. Inclusief korte "naar productie"-paragraaf. _(HBO-i: bt.infrastructuur.adviseren.1 — Aanbevelingen doen over een opzet van, of aanpassingen aan, een eenvoudige infrastructuur)_
- **[Infra - Realiseren]** Testverslag van de PoC-infra: wat getest (responsietijd, basic availability), wat bewust niet getest (load tests, security audit) en waarom. Setup-documentatie: hoe start je de PoC op, welke externe afhankelijkheden. _(HBO-i: bt.infrastructuur.realiseren.1 — Inrichten, testen en beschikbaar stellen van een proof of concept van een eenvoudige infrastructuur)_

### Sprint 4: Realiseren + Manage & Control (t/m 23 juni)

Afronding, kwaliteitsborging en overdracht. Posterpresentatie op 16 juni.

- PoC uitbreiden en bijsturen op basis van testresultaten
- CI/CD-pipeline inrichten
- Kwaliteitsborging (integration tests, code reviews)
- Documentatie en overdracht via git.fhict.nl
- Portfolio en reflecties afronden
- **[Infra - Manage & Control]** Runbook documenteren: hoe herindexeer je de vector DB bij gewijzigde Canvas-content, wat doe je bij een Anthropic API-outage, wie beheert de API-keys, hoe monitor je of de chatbot nog reageert. _(HBO-i: bt.infrastructuur.manage_control.1 — Opzetten en documenteren van standaardbeheerprocessen en werkprocedures voor beheer van een eenvoudige infrastructuur)_

---

## 4. Niveau 2 - optionele verdieping (als er tijd is)

Op basis van het coachgesprek is één route naar niveau 2 geïdentificeerd die haalbaar is zonder de scope te vergroten:

**Adviseren niveau 2** — Vergelijk twee hosting-opties met een extra DOT-methode naast library research. Concreet: benchmark de responsietijd van de chatbot lokaal vs. een VPS (bijv. Railway of Fly.io) en verwerk dat als onderbouwing in de ADR. Dat maakt het advies probleemgericht in plaats van taakgericht. _(HBO-i: bt.infrastructuur.adviseren.2 — Adviseren over inrichting en beheer van een cloudgebaseerde infrastructuur met onderbouwde keuzes vanuit kwaliteitseisen, beschikbare technologie en beheermethodes)_

Dit wordt alleen opgepakt als sprint 3 voldoende ruimte laat. Niveau 2 op andere activiteiten wordt in dit semester niet nagestreefd.

---

## 5. Welke expertise heb ik nodig?

| Expertisegebied           | Waarvoor                                                   | Hoe                                         |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| Software-architectuur     | C4-modellen, ADR's, koppelingen Canvas API/LTI             | Experttafel, peerfeedback                   |
| UX / Gebruikersonderzoek  | Validatie enquête-aanpak en prototypes                     | Experttafel, feedback docent                |
| Infrastructuur & DevOps   | Container-opzet, hosting-keuze en testverslag              | Experttafel, coachgesprek (gedaan sprint 2) |
| Domeinexpertise onderwijs | Valideren of platform aansluit bij vraaggestuurd onderwijs | Gesprekken met Eric, docenten en coaches    |

---

## 6. Persoonlijke ontwikkeling

In vorige semesters heb ik feedback ontvangen op perfectionisme en het geven van ruimte aan teamgenoten. Dit semester wil ik bewust werken aan:

- **Loslaten van perfectionisme** - "houtje touwtje mag" zoals Eric zegt. Het gaat om validatie, niet om een gepolijst eindproduct. De infra-uitwerking is hier een goed voorbeeld van: een pragmatisch testverslag met expliciete afbakening is meer waard dan een perfect gedocumenteerde setup die te laat af is.
- **Gebruikersonderzoek als vaardigheid** - ik heb weinig ervaring met het ophalen van behoeften bij gebruikers en vind dat lastig. Dit semester dwing ik mezelf om dat te doen via enquêtes en prototype-testen.

Ik bespreek dit doorlopend met mijn coach en reflecteer erop in mijn portfolio.
