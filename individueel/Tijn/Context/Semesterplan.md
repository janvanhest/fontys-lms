# Semesterplan

*Project: Bouw je eigen Learning Management System (LMS)*
*Auteur: Tijn Knapen | semester 4*
*Datum: Maart 2026*
*Stakeholder: Eric Slaats*
*Coaches: Lennart, Coen, Robin*

## Versiebeheer

| Versie | Datum | Auteur | Wijzigingen |
| ----: | :---- | :---- | :---- |
| 1 | 10-03-2026 | Tijn Knapen | Semesterplan |
| 2 | 17-03-2026 | Tijn Knapen | Feedback verwerkt: User Interaction als architectuurlaag, keuze infrastructuur verduidelijkt, vroeg realiseren benadrukt |

## 1. Wat ga ik doen?

*Hoe maak je de leerervaring in Canvas beter door de focus te verleggen van modules naar de student en zijn activiteiten, zodat vraaggestuurd onderwijs soepel loopt met minimale hindernissen?*

We bouwen geen compleet nieuw LMS vanaf nul, maar focussen op een werkend prototype als aanvulling of verbetering via Canvas API en LTI-koppelingen. Eerst doen we onderzoek en ideation om pijnpunten scherp te krijgen bij echte gebruikers (studenten en docenten), daarna komen ontwerp en bouw. Dit past bij de challenge-omschrijving: een realistisch alternatief of aanvulling op Canvas bouwen, met focus op schaalbaarheid, veiligheid en gebruiksgemak.

### 1.1 Competenties:

| Architectuurlaag | Niveau | Activiteiten |
| :---- | :---- | :---- |
| User Interaction (secundair) | 1 | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |
| Infrastructuur (Primair) | 1 | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |
| Software | 2 | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |

Ik kies primair voor Infrastructuur niveau 1, omdat infra goed past bij de leervraag: we bouwen een prototype dat draait op een eigen server, koppelt met Canvas via LTI en de REST API, en schaalbaar en veilig moet zijn. User Interaction is een secundaire keuze die aansluit op de UX-kant van het prototype.

**Professional skills**: Ik werk aan Persoonlijk leiderschap en Professionele standaard, gericht op de groei van niveau 2 naar niveau 3.

## 2. Waarom is dit relevant?

**User Interaction niveau 1** is passend, omdat de challenge breed en open is: individuele problemen onder docenten en studenten met slechte UX in Portflow zijn echt. Ik moet zelf uitzoeken wat gebruikers nodig hebben via analyseren. Een verbeterde UX moet de leerervaring binnen Canvas verbeteren.

**Infrastructuur niveau 1** is ook relevant, omdat een LMS veel technische basis vraagt die betrouwbaar en schaalbaar moet zijn. Denk aan veilige opslag en toegang tot leerdata voor veel gebruikers tegelijk, goede koppelingen met bestaande systemen zoals Canvas via API of LTI, beheer van rollen en rechten, en misschien basis monitoring of deployment om het prototype stabiel te houden.

## 3. Hoe ga ik dat doen?

### 3.1 Sprint 1: Analyseren (tot 17 maart)

Het probleem en de technische context in kaart brengen.

* **Infrastructuur analyse:** Uitzoeken hoe de huidige LTI-koppelingen en API's van Canvas werken. Ik verdiep me in hoe we data uit verschillende systemen veilig en betrouwbaar kunnen koppelen, zodat we het persoonlijke leerproces van de student beter centraal kunnen stellen.
* **Benchmarkonderzoek:** Kijken naar andere leerplatforms en tools. Ik wil uitzoeken hoe zij studentgericht leren aanpakken en wat we van hun gebruiksvriendelijkheid kunnen afkijken.
* **Eisen opstellen (Requirements):** Een eerste lijst maken van wat ons prototype minimaal moet kunnen. Hierin neem ik zowel de wensen voor de interface (User Interaction) als de technische randvoorwaarden zoals veiligheid en schaalbaarheid (Infrastructuur) mee.
* **Eerste prototype-stappen:** Al in sprint 1 start ik met een eerste technische opzet, zodat er vroeg iets werkends is om op voort te bouwen. Dit maakt de analyses concreter en geeft het team eerder iets om op te reageren.

### 3.2 Sprint 2: Analyseren afronden, Adviseren en Ontwerpen (tot 19 april)

Mijn onderzoek vertalen naar concrete keuzes en eerste schetsen.

* **Eerste werkend prototype:** In Sprint 2 leveren we als groep al een eerste werkend prototype (sprint 0) op. Mijn taak is om de basisinfrastructuur vroeg in de lucht te krijgen: een eenvoudige VPS of testomgeving zodat de code van het team centraal kan draaien en getest kan worden. Door vroeg te realiseren kunnen we al resultaten laten zien en bijsturen voordat er te veel is vastgelegd.
* **Architectuurontwerp (C4 & ADR's):** Ik schrijf een technisch advies op basis van de analyse. Hierin leg ik de technologiekeuzes vast in zogeheten ADR's (Architecture Decision Records). Ook teken ik de eerste architectuurschetsen (C4-diagrammen level 1-2) om visueel in kaart te brengen hoe ons systeem veilig communiceert met de Canvas API en LTI.
* **Afstemmen met team en stakeholder:** Samen met het team bepalen we definitief wat we zelf bouwen aan de achterkant en wat we via koppelingen hergebruiken uit Canvas. Dit koppel ik ook terug aan de stakeholders.

### 3.3 Sprint 3: Ontwerpen en Realiseren (tot 24 mei)

Van ontwerp naar een werkend prototype (Proof of Concept).

* **Architectuur uitwerken (Infrastructuur):** Ik werk de gemaakte keuzes verder uit. De architectuurschetsen breid ik uit naar een dieper niveau (C4-diagrammen level 2-3) en ik scherp de eerdere ADR's verder aan.
* **Infrastructuur, Database en Deployment:** Ik ben verantwoordelijk voor het database-ontwerp en de achterliggende infrastructuur. Ik zet de daadwerkelijke hostingomgeving op (bijvoorbeeld met containers) en regel de deployment. Zo zorg ik dat de applicatie online staat en stabiel draait voor de usability tests.
* **Kerndeel koppelen (API/LTI):** Terwijl het team de interface bouwt, focus ik op de achterkant. Ik zorg ervoor dat de applicatie veilig en betrouwbaar kan communiceren met Canvas via de Canvas API en LTI-koppelingen om data op te halen en weg te schrijven.

### 3.4 Sprint 4: Realiseren + Manage & Control (tot 23 juni)

Afronden, stabiliseren en alles netjes en overdraagbaar opleveren.

* **CI/CD en Kwaliteitsborging:** Ik richt een CI/CD-pipeline in voor ons project. Hiermee zorg ik voor automatische deployment en kwaliteitsborging (zoals integratietesten), zodat ons PoC stabiel en betrouwbaar draait.
* **Stabiliteit en Veiligheid:** Ik stuur de achterkant van het PoC bij op basis van de testresultaten. Ik controleer of onze infrastructuur en de koppelingen met de Canvas API en LTI veilig en schaalbaar zijn gebleven tijdens het bouwen.
* **Documentatie en Overdracht:** Ik finaliseer de architectuurdocumentatie (zoals de C4-diagrammen en ADR's). Ik zorg ervoor dat de infrastructuur-documentatie en alle code netjes en overdraagbaar op git.fhict.nl komen te staan voor toekomstige teams.
* **Portfolio afronden:** Ik schrijf mijn eigen documenten en reflecties voor de eindbeoordeling om te bewijzen dat ik mijn persoonlijke doelen voor Infrastructuur op niveau 1 en 2 heb behaald.

## 4. Welke expertise heb ik nodig?

Om dit project te laten slagen en mijn doelen voor User Interaction en Infrastructuur te halen, moet ik me in de volgende zaken verdiepen:

| Expertisegebied | Waarvoor | Hoe |
| :---- | :---- | :---- |
| UX en Gebruikersonderzoek (User Interaction) | Het maken van paper prototypes, wireframes en het uitvoeren van usability testen om de leerervaring studentgerichter te maken. | Feedback van design docenten, experttafels. |
| Infrastructuur en Hosting | Het opzetten van een eigen VPS en een veilige database voor ons prototype. Zorgen dat de applicatie online draait en kan praten met Canvas via LTI en de API. | Experttafels, feedback van infra docenten. |
| Domeinexpertise Onderwijs | Begrijpen wat studenten precies nodig hebben om hun eigen leerpad uit te stippelen en hoe vraaggestuurd onderwijs in de praktijk werkt. | Gesprekken voeren met stakeholder Eric Slaats, onze coaches en studenten. |

## 5. Persoonlijke ontwikkeling

Voor mijn Professional skills werk ik dit semester van niveau 2 naar niveau 3. Mijn specifieke leerdoelen voor dit project zijn:

* **Werk tijdig laten zien**: Ik heb de neiging om heel zelfstandig te werken en pas iets te delen met de groep als ik denk dat het helemaal af is. Dit semester dwing ik mezelf om ruwe schetsen, vroege ontwerpen of opzetjes veel sneller te delen met mijn teamgenoten en de stakeholder.
* **Structureel feedback ophalen**: Aantoonbare feedback is een harde eis om dit semester te halen. Daarom dwing ik mezelf om regelmatig en op tijd feedback te vragen aan mijn coaches, in plaats van alles zelf te willen uitzoeken.
* **Communicatie verbeteren**: Door mijn voortgang en keuzes vaker te bespreken, voorkom ik dat ik te lang in mijn eigen bubbel blijf hangen. Zo weet ik zeker dat mijn werk voldoet aan de eisen voor de eindbeoordeling.
