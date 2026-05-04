# Challenge voorstel LMS

*Project: Bouw je eigen Learning Management System (LMS)*
*Organisatie: Fontys*
*Auteur: Tijn Knapen (individueel voorstel)*
*Datum: Maart 2026*

## Versiebeheer

| Versie | Datum | Auteur | Wijzigingen |
| ----: | :---- | :---- | :---- |
| 1 | 03-03-2026 | Tijn Knapen | Challenge voorstel - LMS |
| 2 | 17-03-2026 | Tijn Knapen | Feedback verwerkt: stakeholderinzichten toegevoegd, scope aangepast naar LTI-prototype, grading bottleneck verwijderd als hoofdfocus |

## Inhoudsopgave

1. Aanleiding en probleemstelling
2. Validatie bij stakeholders
3. De Challenge
4. Oplossingsrichting
5. Technische scope
6. Iteratieve aanpak

## 1. Aanleiding en probleemstelling

Dit is mijn individuele challengevoorstel op basis van eerste observaties en de inzichten uit twee stakeholdergesprekken. Het is een startpunt voor de groepsdiscussie, geen definitief groepsdocument.

In Canvas bij Fontys ICT lopen studenten en docenten tegen een fundamenteel probleem aan: Canvas is gebouwd rond modules en vaste cursusstructuren, terwijl Fontys beweegt richting vraaggestuurd onderwijs. Challenges kunnen drie weken maar ook drie jaar duren en lopen dwars door semesters heen. De modulestructuur van Canvas ondersteunt dit niet.

Daarnaast zijn er problemen met de versnippering van tools. Studenten moeten schakelen tussen Canvas, Portflow, FeedPulse, Studycoach en M365 om een compleet beeld van hun leerproces te krijgen. Er is geen centrale plek die dit samenvoegt vanuit het perspectief van de student.

## 2. Validatie bij stakeholders

De bovenstaande observaties zijn bevestigd en aangescherpt in twee stakeholdergesprekken.

**Eric Slaats (4 maart 2026)**
Eric is de kernstakeholder van dit project. Zijn belangrijkste inzichten:

* Canvas is zwaar op tekst gebaseerd. Studenten lezen steeds minder goed grote lappen tekst en nemen informatie anders op. De interface moet visueler en simpeler.
* Challenges en projecten houden zich niet aan semestergrenzen. Fontys wil toewerken naar vloeiend onderwijs waarbij studenten dwars door semesters heen aan hun leerpad werken. Canvas modules ondersteunen dit niet.
* Beoordelen op leerwinst in plaats van eindproduct. Het gaat om hoe een student omgaat met tegenslagen, niet alleen wat hij oplevert.
* Eric staat open voor out-of-the-box oplossingen en wil geen vasthouderij aan bestaande Canvas-structuren.

**Manon Blom (5 maart 2026)**
Manon is alumni Fontys ICT en werkt bij NS. Haar inzichten bevestigen een breder patroon:

* Trainingen worden formeel afgerond maar leiden niet tot echte kennisopbouw. Gebruikers klikken snel door modules heen om een certificaat te halen, zonder de inhoud echt te begrijpen.
* Een actievere vorm van leren is wenselijk, waarbij gebruikers echt met de inhoud werken in plaats van informatie consumeren.
* De oplossing die we voor Fontys bouwen kan mogelijk ook relevant zijn voor organisaties buiten het onderwijs.

## 3. De Challenge

### Kernvraag

*Hoe maak je de leerervaring in Canvas beter door de focus te verleggen van modules naar de student en zijn activiteiten, zodat vraaggestuurd onderwijs soepel loopt met minimale hindernissen?*

### Doel van het project

We bouwen een werkend prototype dat als aanvulling op Canvas werkt, niet als vervanging. Via de Canvas API en LTI-koppelingen voegen we een studentgerichte laag toe die het persoonlijke leerpad centraal stelt. Het prototype is een proof-of-concept, geen productierijp systeem.

## 4. Oplossingsrichting

We bouwen geen nieuw LMS vanaf nul. We bouwen een LTI-tool die als tab in Canvas wordt ingeladen en vijf onderdelen biedt:

| Onderdeel | Wat het oplost |
| :---- | :---- |
| **Chat** | Studenten stellen vragen over cursusinhoud zonder zelf te zoeken in tekst |
| **Activities** | Kalenderoverzicht van activiteiten en deadlines via de Canvas API |
| **Challenge** | Overzicht van lopende challenges, ook semester-overstijgend |
| **Competenties** | Inzicht in voortgang per competentie, gekoppeld aan inleveringen |
| **Stappenplan** | Persoonlijk leerpad dat de student zelf kan volgen en aanpassen |

De exacte functies worden bepaald op basis van verder gebruikersonderzoek met studenten. Dit voorstel is een richting, geen definitief ontwerp.

## 5. Technische scope

De technische basis is de combinatie van de Canvas REST API en LTI 1.3. Dit is de richting die past bij de scope: we bouwen bovenop Canvas, we vervangen het niet.

* **Koppeling:** LTI 1.3 voor insluiting in Canvas en single sign-on. Canvas REST API voor het ophalen van studentdata.
* **Hosting:** Een publiek bereikbare server is vereist zodat Canvas de LTI-tool kan bereiken. Richting: eigen VPS of containeromgeving.
* **Technologiestack:** Nog niet bepaald. Keuze volgt in de adviesfase op basis van wat het team beheerst en wat snel tot een werkend resultaat leidt. Criterium voor een proof-of-concept is snelheid, niet perfectie.

De definitieve technologiekeuzes worden in sprint 2 vastgelegd in ADR's (Architecture Decision Records), na afstemming met het team.

## 6. Iteratieve aanpak

We doen het stap voor stap:

1. Gebruikersonderzoek met studenten om pijnpunten te valideren.
2. MVP-requirements opstellen op basis van onderzoek.
3. Architectuur ontwerpen en technologiekeuzes vastleggen.
4. Kerndeel bouwen als LTI-prototype.
5. Testen met gebruikers en aanpassen.
