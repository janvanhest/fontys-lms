# Semesterplan

**Challenge:** Studentgericht leerplatform voor vraaggestuurd onderwijs **Student:** Jan van Hest | Semester 6 | HBO-ICT Open Learning, Fontys **Stakeholder:** Eric Slaats (Digital Transformer) **Coaches:** Lennart, Robin, Coen

---

## 1. Wat ga ik doen?

> _Hoe verbeter je de leerervaring binnen Canvas zodat niet de module maar de student en diens activiteiten centraal staan, en vraaggestuurd onderwijs ondersteund wordt met zo weinig mogelijk frictie?_

Canvas blijft de basis - een nieuw LMS bouwen is niet de bedoeling. Ik onderzoek hoe de bestaande omgeving via de Canvas API en LTI-koppelingen slimmer, toegankelijker en persoonlijker gemaakt kan worden. De eerste stap is het probleem helder krijgen via een ideation-fase, pas daarna volgen ontwerp- en realisatiekeuzes.

**Competenties:**

|                    |        |                                                                |
| ------------------ | ------ | -------------------------------------------------------------- |
| Architectuurlaag   | Niveau | Activiteiten                                                   |
| Software (primair) | 3      | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |
| Infrastructuur     | 2      | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |
| User Interaction   | 2      | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |

De verhouding tussen Infrastructuur en User Interaction hangt af van wat uit de analyse naar voren komt.

**Professional skills (niveau 3):** Methodische probleemaanpak, Onderzoek, Oplossing, Procesmanagement, Communicatie, Persoonlijke ontwikkeling.

## 2. Waarom is dit relevant?

**Software niveau 3** is passend omdat het systeem functioneert binnen een context van bestaande systemen (Canvas, M365, FeedPulse). De problemen zijn vaag gedefinieerd, de oplossingsruimte is open, en ik moet zelfstandig bepalen welke richting het project opgaat. De architectuur moet rekening houden met uitbreidbaarheid voor toekomstige teams en kwaliteitseisen als schaalbaarheid en security.

**Analyseren en adviseren als eerste stap** is cruciaal omdat de challenge een denkrichting beschrijft, maar of die aansluit bij wat studenten, coaches en docenten nodig hebben moet eerst onderzocht worden. Eric benadrukte: begin niet met "dit gaan we bouwen" maar verken eerst breed.

## 3. Hoe ga ik dat doen?

De HBO-i activiteiten zijn leidend maar niet strikt lineair - ze kunnen ook cyclisch doorlopen worden.

### Sprint 1: Analyseren (t/m 17 maart)

Het probleem en de context helder krijgen.

- **Stakeholderanalyse** - behoeften en pijnpunten inventariseren bij studenten (dag + avond), coaches en docenten. Enquete als breed startpunt, aangevuld met paper prototypes om behoeften concreet te maken.
- **Analyse huidig ecosysteem** - Canvas, FeedPulse, M365 en overige tools analyseren op functionaliteit, beperkingen en koppelmogelijkheden (API, LTI, OAuth).
- **Benchmarkonderzoek** - vergelijkbare platformen onderzoeken: hoe pakken anderen studentgericht leren aan?
- **Start requirementsanalyse** - eerste functionele en niet-functionele eisen opstellen.

### Sprint 2: Analyseren afronden + Adviseren + start Ontwerpen (t/m 19 april)

De eerste helft rondt de analyse af. De tweede helft vertaalt bevindingen naar keuzes.

- **Requirementsanalyse afronden** - eisen aanscherpen, acceptatiecriteria formuleren, prioriteren.
- **Technologieadvies** - adviseren over geschikte technologieen, frameworks en koppelingen. Vastleggen in ADR's.
- **Bouw-vs-koop-advies** - wat bouw ik zelf, waar sluit ik aan op bestaande systemen, wat laat ik buiten scope?
- **Advies aan stakeholder** - terugkoppeling naar Eric over wat haalbaar en wenselijk is.
- **Paper prototyping** - meerdere ontwerprichtingen verkennen op papier voordat keuzes worden vastgelegd.
- **Eerste architectuurschets** - C4-diagrammen (level 1-2), eerste wireframes.

### Sprint 3: Ontwerpen + Realiseren (t/m 24 mei)

Van ontwerp naar een werkend proof of concept.

- Softwarearchitectuur uitwerken (C4 level 2-3, ADR's aanscherpen)
- Interactieontwerp en wireframes verfijnen
- Database-ontwerp en infrastructuurontwerp
- Kernflow implementeren als PoC, aansluitend op Canvas via API/LTI
- Eerste usability-tests met echte gebruikers

### Sprint 4: Realiseren + Manage & Control (t/m 23 juni)

Afronding, kwaliteitsborging en overdracht. Posterpresentatie op 16 juni.

- PoC uitbreiden en bijsturen op basis van testresultaten
- CI/CD-pipeline inrichten
- Kwaliteitsborging (integration tests, code reviews)
- Documentatie en overdracht via [git.fhict.nl](http://git.fhict.nl/)
- Portfolio en reflecties afronden

Beoordeling: 3 juli.

## 4. Welke expertise heb ik nodig?

|                           |                                                                |                                          |
| ------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| Expertisegebied           | Waarvoor                                                       | Hoe                                      |
| Software-architectuur     | C4-modellen, ADR's, koppelingen Canvas API/LTI                 | Experttafel, peerfeedback                |
| UX / Gebruikersonderzoek  | Validatie enquete-aanpak en paper prototypes                   | Experttafel, feedback docent             |
| Infrastructuur & DevOps   | Container-opzet en CI/CD-pipeline                              | Experttafel, peers                       |
| Domeinexpertise onderwijs | Valideren of het platform aansluit bij vraaggestuurd onderwijs | Gesprekken met Eric, docenten en coaches |

## 5. Persoonlijke ontwikkeling

In vorige semesters heb ik feedback ontvangen op perfectionisme en het geven van ruimte aan teamgenoten. Dit semester wil ik bewust werken aan:

- **Loslaten van perfectionisme** - "houtje touwtje mag" zoals Eric zegt. Het gaat om validatie, niet om een gepolijst eindproduct.
- **Gebruikersonderzoek als vaardigheid** - ik heb weinig ervaring met het ophalen van behoeften bij gebruikers en vind dat lastig. Dit semester dwing ik mezelf om dat te doen via enquetes en paper prototype-testen.

Ik bespreek dit doorlopend met mijn coach en reflecteer erop in mijn portfolio.
