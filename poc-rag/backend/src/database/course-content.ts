export interface SeedChunk {
  title: string;
  source: string;
  content: string;
}

function canvasSource(title: string): string {
  return `Canvas - ${title}`;
}

export const seedChunks: SeedChunk[] = [
  {
    source: canvasSource('Stappenplan: alles wat je nodig hebt dit semester'),
    title: 'Stappenplan: alles wat je nodig hebt dit semester',
    content: `Vier stappen om je semester te starten in Pro Open Learning.

In Pro Open Learning bepaal jij zelf wat je wilt leren en hoe je dat doet. Dit stappenplan helpt je om gestructureerd te starten. Volg de stappen in je eigen tempo, maar vergeet niet: planning en begeleiding zijn essentieel voor succes.

Stap 1: Wat zijn je doelen dit semester?
Begin met het bepalen waar je aan wilt werken. Welke HBO-i competenties wil je ontwikkelen? Welke leeruitkomsten passen bij jouw ambities? Verken de mogelijkheden en kies je focus voor dit semester.

Stap 2: Wat heb je daarvoor nodig?
Kies een passend project of challenge die aansluit bij jouw leeruitkomsten. Je kunt kiezen tussen een groepschallenge of individueel project.
- Groepschallenge: werk samen met medestudenten aan een realistische opdracht van een externe opdrachtgever.
- Individueel project: werk zelfstandig aan een eigen project dat past bij jouw ambities.

Stap 3: Hoe ga je dat dan doen?
Splits je project op in hanteerbare leeractiviteiten en zorg dat de complexiteit past bij je niveau. Dit zijn cruciale stappen voor succesvolle uitvoering.
- Challenge opsplitsen in leeractiviteiten: leer hoe je een groot project opdeelt in concrete, uitvoerbare stappen.
- De juiste complexiteit borgen: zorg dat je werk uitdagend is, maar niet overweldigend.

Stap 4: Hoe maak je alles inzichtelijk voor het semester?
Maak je plannen concreet en zorg voor goede documentatie. Deze tools en methoden helpen je om overzicht te houden en vooruitgang te meten.
- Agile werken: leer werken in sprints, met korte cyclussen van planning, uitvoering en reflectie.
- Leeruitkomsten in Pro Open Learning: begrijp hoe leeruitkomsten werken en hoe je deze gebruikt om je voortgang te documenteren.
- Portflow bij Fontys ICT: documenteer je werk en bewijs je competenties via het digitale portfolio.
- Reflectievragen voor Documentatie: kritisch kijken naar wat je documenteert en waarom.
- Persoonlijk Semesterplan: maak een concreet plan voor het hele semester met deadlines en mijlpalen.

Tip: Start nu
Wacht niet tot je alles perfect hebt uitgedacht. Begin met stap 1, maak keuzes, en verfijn onderweg. Gebruik je coach om feedback te krijgen en bij te sturen waar nodig.`,
  },
  {
    source: canvasSource('Waar ga je aan werken?'),
    title: 'Waar ga je aan werken?',
    content: `Bepaal je eigen focus voor dit semester.

Voordat een semester begint, vragen we je na te denken over hoe en op welk gebied je jezelf wilt ontwikkelen. Daaraan kun je voor jezelf leervragen en leerdoelen stellen.

Een leervraag kan ontstaan vanuit verschillende invalshoeken:

Technology
Dit is een vaak gebruikt startpunt. Als je iets wilt leren over een specifieke technologie zoals Docker, Blockchain of Neural Networking, dan geeft dit een specifieke richting voor een challenge. Dit startpunt kan ook breder zijn, zoals "ik wil programmeervaardigheden of UI-vaardigheden ontwikkelen".

Context
Aangezien de meeste challenges meerdere technologische ingangspunten hebben, kan het een goed idee zijn om te beginnen vanuit een context die voor jou heel betekenisvol is. Contexten zoals onderwijs, robotica, kunst of gezondheidszorg kunnen heel stimulerend zijn en bieden ook een filter voor mogelijke challenges.

Doel
Misschien heb je de perfecte challenge al in gedachten. Als die bestaat, prima. Zo niet, dan kun je ook je eigen challenge definiëren. Daar zijn wel regels aan verbonden:
- De beschrijving moet worden goedgekeurd
- Er moet een belanghebbende uit het werkveld zijn
- Je moet de challenge voorleggen aan andere studenten

Hulp nodig bij je keuze?
Gebruik de Challenge Tool om beschikbare challenges te verkennen, of neem contact op met je coach voor persoonlijk advies.`,
  },
  {
    source: canvasSource('Groepschallenge'),
    title: 'Groepschallenge',
    content: `Werk samen aan echte vraagstukken uit de praktijk.

Wat is een challenge?
Wanneer je weet welke leervraag je hebt of wat je in een semester graag zou willen ontwikkelen, laat je dit terugkomen in een challenge. Een challenge is een vraagstuk uit de beroepspraktijk waarbij de oplossing nog niet gedefinieerd is. Deze challenge moet open zijn om aan te sluiten bij de leerdoelen van studenten.

Een challenge bevat altijd:
- Een probleem dat moet worden opgelost of innovatievraag
- Onderzoek is nodig om de beste oplossing te kiezen
- Een context waarin het probleem leeft, bijvoorbeeld gezondheidszorg of kunst
- Een technologische context, bijvoorbeeld AI, Blockchain of Web-tech

Een eigen challenge inbrengen
De beste challenges zijn challenges die studenten zelf inbrengen. Een challenge die je zelf inbrengt voer je uit in een groep van 3 tot 6 studenten.

Richtlijnen
- Studenten vormen groepen op basis van gemeenschappelijke interesses, onafhankelijk van studierichting
- Spreek- en schrijftaal binnen de challenge is Nederlands of Engels
- De challenge wordt uitgevoerd door een projectgroep van 3 tot 6 studenten
- Studenten werken gedurende 16 tot 18 weken aan de opdracht
- Studenten werken op dinsdagavond op locatie in Strijp TQ
- Bij de zelf ingebrachte challenge is altijd een stakeholder betrokken
- Studenten hebben regelmatig contact met de stakeholder
- De stakeholder is minimaal aanwezig bij de challengemarkt`,
  },
  {
    source: canvasSource('Individueel project'),
    title: 'Individueel project',
    content: `Verdiep je in je eigen interessegebied.

Naast het groepsproject kun je ook een individueel project opzetten. De verhouding tussen het groepswerk en individuele gedeelte kan maximaal 80/20 zijn.

Eisen aan individueel project
- Maximaal 20% van je tijd: het groepsproject blijft de hoofdfocus, individueel werk is aanvullend
- Authentiek bewijsmateriaal: alle bewijsstukken moeten authentiek en traceerbaar zijn in je portfolio
- Expert of coach betrokken: gedurende de periode moet een expert of coach betrokken zijn voor begeleiding
- Proces inzichtelijk: tussenliggende stappen moeten zichtbaar zijn, niet alleen het eindresultaat
- Werkgerelateerd mogelijk: projecten van je werk kunnen meetellen als ze aan de eisen voldoen
- Eigen keuze onderwerp: je bepaalt zelf waarin je je wilt verdiepen binnen het HBO-i framework

Belangrijk
Wil je gebruik maken van een individueel project? Bespreek dit altijd eerst met je coach. Zij helpen je om een goed plan op te stellen en zorgen ervoor dat je individuele project goed aansluit bij je leerdoelen.`,
  },
  {
    source: canvasSource('Challenge opsplitsen in leeractiviteiten'),
    title: 'Challenge opsplitsen in leeractiviteiten',
    content: `Van groot geheel naar concrete, behapbare stappen.

Grote taken worden opgesplitst in behapbare en overzichtelijke taken. Daarmee wordt de voortgang inzichtelijker. Bepaal per taak het eindniveau: wanneer is het klaar en kan de volgende taak beginnen.

Alles wat je voor de challenge doet kun je zien als deliverables. Je deliverables worden uiteindelijk gebruikt om je werk te beoordelen op basis van de competenties.

De basisstructuur van een challenge
In de meest elementaire vorm zal een challenge of leeractiviteit een onderzoek of Analyse kennen, op basis waarvan een Advies wordt gegeven, dat de basis vormt voor een Ontwerp, dat zal worden Gerealiseerd en Onderhouden.

Tips voor het opsplitsen
- Koppel aan sprint demo's: zorg dat elke taak eindigt met iets demonstreerbaars tijdens een sprint demo
- Bepaal Definition of Done: wanneer is een taak echt klaar? Maak dit vooraf concreet
- Neem op in portfolio: alle deliverables documenteer je in je portfolio voor assessment en feedback
- Stel feedbackvragen: vraag gerichte feedback aan coaches, niet "is dit goed?"

Waarom gefaseerd werken?
Als je gewoon ergens begint of blind begint te coderen, dan schiet je met hagel in het donker. De kans dat je van je gewenste oplossingsrichting afgaat is hiermee groter dan wanneer je het gefaseerd aanpakt.`,
  },
  {
    source: canvasSource('De juiste complexiteit borgen'),
    title: 'De juiste complexiteit borgen',
    content: `Zorg dat je challenge het juiste niveau heeft.

Open Learning geeft veel vrijheid. Het eigenaarschap om te borgen dat de gekozen challenge de ruimte geeft om het juiste niveau aan te tonen ligt bij jou.

Ontwikkeling per semester
Vanaf semester 3: Onderzoeksvaardigheden
Je gaat aantonen dat je onderzoeksvaardigheden kunt ontwikkelen. Start met het werken met onderzoeksvragen en het DOT framework, om zo door te groeien naar de inzet van research patterns om complexiteit en betrouwbaarheid van je oplossing te borgen.

Vanaf semester 6: Niveau 3 competenties
Je gaat de competenties in de architectuurlaag van jouw voorkeur aantonen op niveau 3. Zorg dat je challenge voldoende complexiteit biedt om dit niveau te kunnen demonstreren.

Hoe borg je het juiste niveau?
1. Raadpleeg een expert: vraag een expert van de betreffende architectuurlaag om kort met jou door te nemen of je challenge aansluit op het gewenste niveau
2. Bereid je voor: bereid het gesprek voor in de vorm van een onderzoeksinstrument, bijvoorbeeld een expertinterview
3. Leg feedback vast: leg de feedback vast in Feedpulse zodat het voor alle coaches inzichtelijk is`,
  },
  {
    source: canvasSource('Agile werken'),
    title: 'Agile werken',
    content: `Flexibel en wendbaar werken in zelfsturende teams.

Wat is Agile werken?
Agile werken is een populaire manier van projectmatig werken. Agile betekent lenig of wendbaar. Dit doe je met zelfsturende, multidisciplinaire teams in korte projectcycli genaamd sprints. Het voordeel: je kunt flexibel reageren op veranderende eisen en wensen vanuit de klant.

Agile en Scrum
Agile wordt vaak een projectmanagement filosofie genoemd en Scrum is daar één van de praktische toepassingen van. In de groepstaak werken we met elementen uit het Scrum-proces.

Belangrijkste Scrum-elementen
- Werken in sprints, korte cycli
- Zelfsturende teams
- Multidisciplinaire samenwerking
- Flexibel inspelen op veranderingen
- Regelmatige sprint demo's
- Continue verbetering via retrospectives

Theorie leren
De theorie achter Scrum is eenvoudig te leren. We verwachten van je dat je de theorie zelf eigen maakt.

Praktijk toepassen
Scrum in de praktijk brengen wordt vaak als lastiger ervaren. Daarom is er gedurende het semester een Scrum coach aanwezig die je kan helpen bij de praktische implementatie.`,
  },
  {
    source: canvasSource('Portflow bij Fontys ICT'),
    title: 'Portflow bij Fontys ICT',
    content: `Je portfolio tool voor het verzamelen en delen van je leerproducten.

Tijdens dit semester maak je gebruik van de portfolio tool Portflow. In Portflow kun je je voortgang van je project of projecten zichtbaar maken door producten te verzamelen en feedback te vragen aan docenten, medestudenten, experts en anderen.

Portfolio aanmaken
Je vindt het portfolio in het linkermenu van Canvas. Gebruik de OvP-template met code SSRXOKE om de structuur snel op te zetten.

Structuur van je portfolio
Intropagina: het eerste wat de lezer ziet. Neem op: profielschets met foto, naam, motto, onderwijsachtergrond, werkervaring en motivatie.

Secties: helpen overzicht te krijgen tussen verschillende semesters. Maak een sectie per semester.

Collecties: structureer je portfolio met collecties per project. Maak een collectie voor je groepsproject en eventueel je individuele project.

Doelen: breng structuur aan binnen een collectie per leeruitkomst, zoals Analyse, Advies, Ontwerp, Realisatie, Manage Control, Professional Standard en Personal Leadership.

Collection description: geeft de lezer context. Neem op: project- en onderzoekscontext, doorlopen proces, positionering van de evidence en persoonlijke reflectie.

Leerproducten
Voorbeelden zijn gemaakte beroepsproducten, opdrachten, presentaties, verslagen en performance assessments. Maximum van 500MB per bestand.

Voorzie elk leerproduct altijd van een evidence description: wat het is, wat het doel is en waarom het bijdraagt aan de leeruitkomst.

Portfolio inleveren
Maak eerst een snapshot, een bevroren versie, via Create a snapshot. Selecteer de collecties en bewijsmaterialen die je wilt opnemen. Lever het snapshot in via de opdracht in Canvas.`,
  },
  {
    source: canvasSource('Reflectievragen voor Documentatie'),
    title: 'Reflectievragen voor Documentatie',
    content: `Kritisch kijken naar wat je documenteert en waarom.

Deze vragen helpen je bepalen of je document waarde toevoegt aan je portfolio en project. Het gaat niet om het afvinken van een checklist, maar om kritisch nadenken over wat je vastlegt en waarom.

De kernvragen
1. Wat is het probleem of de vraag die je oplost?
Wat is de concrete vraag of het probleem? Geen vage beschrijvingen, wees specifiek.

2. Waarom is dit een relevant probleem of vraag?
Waarom maakt dit uit? Voor wie maakt dit uit? Relevantie moet je kunnen onderbouwen vanuit context, stakeholders of impact.

3. Hoe ga je dit oplossen?
Wat is je aanpak? Welke methoden, frameworks of strategieën ga je gebruiken? Je moet kunnen uitleggen waarom je voor deze aanpak kiest en niet voor een andere.

4. Wat zijn de resultaten?
Concrete resultaten, niet wat je hoopte te bereiken. Eerlijkheid over failures is vaak waardevoller dan neppe successen.

5. Wat is de kwaliteit van het resultaat?
Vergelijk met je initiële doelen, met eisen van stakeholders of met industry standards.

6. Hoe heb je de kwaliteit gevalideerd?
Heb je het getest, feedback gevraagd, gemeten of vergeleken met alternatieven? Validatie zonder bewijs is speculatie.

7. Wat zijn je volgende stappen?
Maak een bewuste keuze op basis van wat je tot nu toe hebt ontdekt.

Relatie met HBO-i Competenties
- Analyseren: het formuleren van het probleem en bepalen van relevantie
- Adviseren: je aanpak onderbouwen en alternatieven overwegen
- Ontwerpen en Realiseren: concrete resultaten tonen en valideren
- Manage en Control: kwaliteit beoordelen en next steps bepalen
- Professionele ontwikkeling: reflectie op je eigen werk en leerproces`,
  },
  {
    source: canvasSource('Persoonlijk Semesterplan'),
    title: 'Persoonlijk Semesterplan',
    content: `Een flexibel hulpmiddel om richting te geven aan je semester, inhoudelijk en persoonlijk.

Elke semester verwachten wij dat je begint met het maken van een plan. Dit plan geeft richting aan je semester en vormt de basis voor je coachinggesprekken. Het is kort, bondig en flexibel: een hulpmiddel, geen vaststaand document.

Inhoud en PO: twee kanten van hetzelfde verhaal
Een competentie aantonen is meer dan een goed product opleveren. Het gaat om hoe je werkt: hoe je communiceert, samenwerkt, feedback verwerkt en verantwoordelijkheid neemt. Pas als inhoud en houding samen zichtbaar zijn, toon je aan dat je een competentie beheerst.

Kernvragen
Wat ga je doen?
Beschrijf kort je activiteit of product. Koppel dit aan de voor jou relevante competenties.

Waarom is dit relevant?
Licht toe waarom dit bijdraagt aan het aantonen van de gekozen competenties. Leg uit waarom dit belangrijk is binnen de challenge.

Hoe ga je dat doen?
Beschrijf in hoofdlijnen je aanpak, stappen en middelen.

Welke expertise heb je nodig?
Geef aan bij welke expertises je feedback, validatie of kennis gaat ophalen, bijvoorbeeld via experttafels.

Persoonlijke ontwikkeling
Overweeg dit op te nemen als je vorig semester feedback hebt ontvangen op houding, communicatie of samenwerking, of als je zelf merkt dat bepaalde vaardigheden je belemmeren.

Wanneer is PO een verplicht onderdeel?
Heb je vorig semester feedback gekregen op niet-inhoudelijke zaken zoals communicatie, aanwezigheid, feedback geven of ontvangen, samenwerking of professioneel gedrag? Dan verwachten we dat je dit opneemt als expliciet aandachtspunt in je semesterplan.

Gebruik per sprint
- Controleer of het plan nog relevant is
- Vul aan of pas aan waar nodig
- Gebruik het plan in coachinggesprekken om voortgang te bespreken
- Eindreflectie: beschrijf hoe het plan richting heeft gegeven en hoe het veranderd is

Coachingsmomenten
- Week 2 of 3: eerste bespreking met je coach
- Minimaal 2 keer vervolggesprekken: plan gebruiken en bijstellen
- Eindreflectie: hoe gaf het plan richting en welke aanpassingen heb je gedaan?

Richtlijnen
- Kort en bondig, streven is ongeveer 1 tot 2 A4
- Richtinggevend, niet dogmatisch
- Actief gebruiken in gesprekken
- Helpt bij het maken van keuzes en benutten van expertise
- Neem PO op als je vorig semester feedback hebt gekregen op gedrag, communicatie of samenwerking`,
  },
];
