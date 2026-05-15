export interface SeedChunk {
  title: string;
  source: string;
  content: string;
}

interface SectionSeed {
  title: string;
  content: string;
}

interface PageSeed {
  source: string;
  sections: SectionSeed[];
}

function canvasSource(title: string): string {
  return `Canvas - ${title}`;
}

const pages: PageSeed[] = [
  {
    source: canvasSource('Stappenplan: alles wat je nodig hebt dit semester'),
    sections: [
      {
        title: 'Introductie Stappenplan',
        content: `Vier stappen om je semester te starten in Pro Open Learning.

In Pro Open Learning bepaal jij zelf wat je wilt leren en hoe je dat doet. Dit stappenplan helpt je om gestructureerd te starten. Volg de stappen in je eigen tempo, maar vergeet niet: planning en begeleiding zijn essentieel voor succes.`,
      },
      {
        title: 'Stap 1: Wat zijn je doelen dit semester?',
        content: `Begin met het bepalen waar je aan wilt werken. Welke HBO-i competenties wil je ontwikkelen? Welke leeruitkomsten passen bij jouw ambities? Verken de mogelijkheden en kies je focus voor dit semester.`,
      },
      {
        title: 'Stap 2: Wat heb je daarvoor nodig?',
        content: `Kies een passend project of challenge die aansluit bij jouw leeruitkomsten. Je kunt kiezen tussen een groepschallenge of individueel project.

Groepschallenge: werk samen met medestudenten aan een realistische opdracht van een externe opdrachtgever.
Individueel project: werk zelfstandig aan een eigen project dat past bij jouw ambities.`,
      },
      {
        title: 'Stap 3: Hoe ga je dat dan doen?',
        content: `Splits je project op in hanteerbare leeractiviteiten en zorg dat de complexiteit past bij je niveau. Dit zijn cruciale stappen voor succesvolle uitvoering.

Challenge opsplitsen in leeractiviteiten: leer hoe je een groot project opdeelt in concrete, uitvoerbare stappen.
De juiste complexiteit borgen: zorg dat je werk uitdagend is, maar niet overweldigend.`,
      },
      {
        title: 'Stap 4: Hoe maak je alles inzichtelijk voor het semester?',
        content: `Maak je plannen concreet en zorg voor goede documentatie. Deze tools en methoden helpen je om overzicht te houden en vooruitgang te meten.`,
      },
      {
        title: 'Stap 4: Agile werken',
        content: `Agile werken: leer werken in sprints, met korte cyclussen van planning, uitvoering en reflectie.`,
      },
      {
        title: 'Stap 4: Leeruitkomsten in Pro Open Learning',
        content: `Leeruitkomsten in Pro Open Learning: begrijp hoe leeruitkomsten werken en hoe je deze gebruikt om je voortgang te documenteren.`,
      },
      {
        title: 'Stap 4: Portflow bij Fontys ICT',
        content: `Portflow bij Fontys ICT: documenteer je werk en bewijs je competenties via het digitale portfolio.`,
      },
      {
        title: 'Stap 4: Reflectievragen voor Documentatie',
        content: `Reflectievragen voor Documentatie: kritisch kijken naar wat je documenteert en waarom.`,
      },
      {
        title: 'Stap 4: Persoonlijk Semesterplan',
        content: `Persoonlijk Semesterplan: maak een concreet plan voor het hele semester met deadlines en mijlpalen.`,
      },
      {
        title: 'Tip: Start nu',
        content: `Wacht niet tot je alles perfect hebt uitgedacht. Begin met stap 1, maak keuzes, en verfijn onderweg. Gebruik je coach om feedback te krijgen en bij te sturen waar nodig.`,
      },
    ],
  },
  {
    source: canvasSource('Waar ga je aan werken?'),
    sections: [
      {
        title: 'Introductie Focus Kiezen',
        content: `Bepaal je eigen focus voor dit semester.

Voordat een semester begint, vragen we je na te denken over hoe en op welk gebied je jezelf wilt ontwikkelen. Daaraan kun je voor jezelf leervragen en leerdoelen stellen.

Een leervraag kan ontstaan vanuit verschillende invalshoeken.`,
      },
      {
        title: 'Focus via Technology',
        content: `Technology is een vaak gebruikt startpunt. Als je iets wilt leren over een specifieke technologie zoals Docker, Blockchain of Neural Networking, dan geeft dit een specifieke richting voor een challenge. Dit startpunt kan ook breder zijn, zoals programmeervaardigheden of UI-vaardigheden ontwikkelen.`,
      },
      {
        title: 'Focus via Context',
        content: `Omdat de meeste challenges meerdere technologische ingangspunten hebben, kan het een goed idee zijn om te beginnen vanuit een context die voor jou betekenisvol is. Contexten zoals onderwijs, robotica, kunst of gezondheidszorg kunnen heel stimulerend zijn en bieden ook een filter voor mogelijke challenges.`,
      },
      {
        title: 'Focus via Doel',
        content: `Misschien heb je de perfecte challenge al in gedachten. Zo niet, dan kun je ook je eigen challenge definiëren. Daar zijn regels aan verbonden: de beschrijving moet worden goedgekeurd, er moet een belanghebbende uit het werkveld zijn en je moet de challenge voorleggen aan andere studenten.`,
      },
      {
        title: 'Hulp nodig bij je keuze?',
        content: `Gebruik de Challenge Tool om beschikbare challenges te verkennen, of neem contact op met je coach voor persoonlijk advies.`,
      },
    ],
  },
  {
    source: canvasSource('Groepschallenge'),
    sections: [
      {
        title: 'Introductie Groepschallenge',
        content: `Werk samen aan echte vraagstukken uit de praktijk.`,
      },
      {
        title: 'Wat is een challenge?',
        content: `Wanneer je weet welke leervraag je hebt of wat je in een semester graag zou willen ontwikkelen, laat je dit terugkomen in een challenge. Een challenge is een vraagstuk uit de beroepspraktijk waarbij de oplossing nog niet gedefinieerd is. Deze challenge moet open zijn om aan te sluiten bij de leerdoelen van studenten.`,
      },
      {
        title: 'Elementen van een challenge',
        content: `Een challenge bevat altijd een probleem dat moet worden opgelost of innovatievraag, onderzoek om de beste oplossing te kiezen, een context waarin het probleem leeft en een technologische context, bijvoorbeeld AI, Blockchain of Web-tech.`,
      },
      {
        title: 'Een eigen challenge inbrengen',
        content: `De beste challenges zijn challenges die studenten zelf inbrengen. Een challenge die je zelf inbrengt voer je uit in een groep van 3 tot 6 studenten.`,
      },
      {
        title: 'Richtlijnen groepschallenge',
        content: `Studenten vormen groepen op basis van gemeenschappelijke interesses, onafhankelijk van studierichting. Spreek- en schrijftaal binnen de challenge is Nederlands of Engels. Studenten werken gedurende 16 tot 18 weken aan de opdracht, op dinsdagavond in Strijp TQ, met een betrokken stakeholder die regelmatig contact heeft met de groep en minimaal aanwezig is bij de challengemarkt.`,
      },
    ],
  },
  {
    source: canvasSource('Individueel project'),
    sections: [
      {
        title: 'Introductie Individueel project',
        content: `Verdiep je in je eigen interessegebied.

Naast het groepsproject kun je ook een individueel project opzetten. De verhouding tussen het groepswerk en individuele gedeelte kan maximaal 80/20 zijn.`,
      },
      {
        title: 'Eisen aan individueel project',
        content: `Een individueel project mag maximaal 20 procent van je tijd kosten, moet authentiek en traceerbaar bewijsmateriaal opleveren, vraagt betrokkenheid van een expert of coach, en moet tussenliggende processtappen zichtbaar maken. Projecten van je werk kunnen meetellen als ze aan de eisen voldoen en je kiest zelf het onderwerp binnen het HBO-i framework.`,
      },
      {
        title: 'Belangrijk bij individueel project',
        content: `Wil je gebruik maken van een individueel project? Bespreek dit altijd eerst met je coach. Die helpt je om een goed plan op te stellen en te zorgen dat je project aansluit bij je leerdoelen.`,
      },
    ],
  },
  {
    source: canvasSource('Challenge opsplitsen in leeractiviteiten'),
    sections: [
      {
        title: 'Introductie Challenge opsplitsen',
        content: `Van groot geheel naar concrete, behapbare stappen.

Grote taken worden opgesplitst in behapbare en overzichtelijke taken. Daarmee wordt de voortgang inzichtelijker. Bepaal per taak het eindniveau: wanneer is het klaar en kan de volgende taak beginnen.`,
      },
      {
        title: 'Deliverables en beoordeling',
        content: `Alles wat je voor de challenge doet kun je zien als deliverables. Je deliverables worden uiteindelijk gebruikt om je werk te beoordelen op basis van de competenties.`,
      },
      {
        title: 'Basisstructuur van een challenge',
        content: `In de meest elementaire vorm zal een challenge of leeractiviteit een onderzoek of Analyse kennen, op basis waarvan een Advies wordt gegeven, dat de basis vormt voor een Ontwerp, dat zal worden Gerealiseerd en Onderhouden.`,
      },
      {
        title: 'Tips voor het opsplitsen',
        content: `Koppel taken aan sprint demo's, bepaal vooraf een Definition of Done, neem deliverables op in je portfolio en stel gerichte feedbackvragen aan coaches.`,
      },
      {
        title: 'Waarom gefaseerd werken?',
        content: `Als je gewoon ergens begint of blind begint te coderen, dan schiet je met hagel in het donker. De kans dat je van je gewenste oplossingsrichting afgaat is groter dan wanneer je het gefaseerd aanpakt.`,
      },
    ],
  },
  {
    source: canvasSource('De juiste complexiteit borgen'),
    sections: [
      {
        title: 'Introductie Complexiteit borgen',
        content: `Zorg dat je challenge het juiste niveau heeft.

Open Learning geeft veel vrijheid. Het eigenaarschap om te borgen dat de gekozen challenge de ruimte geeft om het juiste niveau aan te tonen ligt bij jou.`,
      },
      {
        title: 'Ontwikkeling per semester',
        content: `Vanaf semester 3 ga je onderzoeksvaardigheden aantonen. Start met onderzoeksvragen en het DOT framework om door te groeien naar research patterns. Vanaf semester 6 toon je niveau 3 competenties aan in de architectuurlaag van jouw voorkeur en moet je challenge voldoende complexiteit bieden.`,
      },
      {
        title: 'Hoe borg je het juiste niveau?',
        content: `Raadpleeg een expert van de betreffende architectuurlaag, bereid dat gesprek voor met een onderzoeksinstrument zoals een expertinterview, en leg de feedback vast in Feedpulse zodat het voor coaches inzichtelijk is.`,
      },
    ],
  },
  {
    source: canvasSource('Agile werken'),
    sections: [
      {
        title: 'Wat is Agile werken?',
        content: `Agile werken is een populaire manier van projectmatig werken. Agile betekent lenig of wendbaar. Dit doe je met zelfsturende, multidisciplinaire teams in korte projectcycli genaamd sprints. Het voordeel is dat je flexibel kunt reageren op veranderende eisen en wensen vanuit de klant.`,
      },
      {
        title: 'Agile en Scrum',
        content: `Agile wordt vaak een projectmanagementfilosofie genoemd en Scrum is daar een praktische toepassing van. In de groepstaak werken we met elementen uit het Scrum-proces.`,
      },
      {
        title: 'Belangrijkste Scrum-elementen',
        content: `Belangrijke Scrum-elementen zijn werken in sprints, zelfsturende teams, multidisciplinaire samenwerking, flexibel inspelen op veranderingen, regelmatige sprint demo's en continue verbetering via retrospectives.`,
      },
      {
        title: 'Theorie leren',
        content: `De theorie achter Scrum is eenvoudig te leren. We verwachten van je dat je de theorie zelf eigen maakt.`,
      },
      {
        title: 'Praktijk toepassen',
        content: `Scrum in de praktijk brengen wordt vaak als lastiger ervaren. Daarom is er gedurende het semester een Scrum coach aanwezig die je kan helpen bij de praktische implementatie.`,
      },
    ],
  },
  {
    source: canvasSource('Portflow bij Fontys ICT'),
    sections: [
      {
        title: 'Introductie Portflow',
        content: `Je portfolio tool voor het verzamelen en delen van je leerproducten.

Tijdens dit semester maak je gebruik van de portfolio tool Portflow. In Portflow kun je je voortgang van je project of projecten zichtbaar maken door producten te verzamelen en feedback te vragen aan docenten, medestudenten, experts en anderen.`,
      },
      {
        title: 'Portfolio aanmaken',
        content: `Je vindt het portfolio in het linkermenu van Canvas. Gebruik de OvP-template met code SSRXOKE om de structuur snel op te zetten.`,
      },
      {
        title: 'Structuur van je portfolio',
        content: `Je portfolio bestaat uit een intropagina, secties per semester, collecties per project, doelen per leeruitkomst en een collection description die context geeft over project, proces, evidence en persoonlijke reflectie.`,
      },
      {
        title: 'Leerproducten',
        content: `Leerproducten kunnen beroepsproducten, opdrachten, presentaties, verslagen en performance assessments zijn. Maximum per bestand is 500MB. Voorzie elk leerproduct van een evidence description: wat het is, wat het doel is en waarom het bijdraagt aan de leeruitkomst.`,
      },
      {
        title: 'Portfolio inleveren',
        content: `Maak eerst een snapshot, een bevroren versie, via Create a snapshot. Selecteer de collecties en bewijsmaterialen die je wilt opnemen en lever het snapshot in via de opdracht in Canvas.`,
      },
    ],
  },
  {
    source: canvasSource('Reflectievragen voor Documentatie'),
    sections: [
      {
        title: 'Introductie Reflectievragen',
        content: `Kritisch kijken naar wat je documenteert en waarom.

Deze vragen helpen je bepalen of je document waarde toevoegt aan je portfolio en project. Het gaat niet om het afvinken van een checklist, maar om kritisch nadenken over wat je vastlegt en waarom.`,
      },
      {
        title: 'Kernvraag 1 en 2: probleem en relevantie',
        content: `Formuleer het probleem of de vraag concreet en leg uit waarom dit relevant is. Relevantie moet je kunnen onderbouwen vanuit context, stakeholders of impact.`,
      },
      {
        title: 'Kernvraag 3 en 4: aanpak en resultaten',
        content: `Beschrijf je aanpak, de gebruikte methoden of strategieën en leg uit waarom je daarvoor kiest. Toon daarna concrete resultaten in plaats van alleen wat je hoopte te bereiken.`,
      },
      {
        title: 'Kernvraag 5 en 6: kwaliteit en validatie',
        content: `Beoordeel de kwaliteit van het resultaat ten opzichte van doelen, eisen van stakeholders of industry standards. Laat ook zien hoe je de kwaliteit hebt gevalideerd, bijvoorbeeld via testen, feedback, metingen of vergelijking met alternatieven.`,
      },
      {
        title: 'Kernvraag 7: volgende stappen',
        content: `Maak een bewuste keuze voor je volgende stappen op basis van wat je tot nu toe hebt ontdekt.`,
      },
      {
        title: 'Relatie met HBO-i Competenties',
        content: `De reflectievragen raken aan analyseren, adviseren, ontwerpen en realiseren, manage en control, en professionele ontwikkeling.`,
      },
    ],
  },
  {
    source: canvasSource('Persoonlijk Semesterplan'),
    sections: [
      {
        title: 'Introductie Persoonlijk Semesterplan',
        content: `Een flexibel hulpmiddel om richting te geven aan je semester, inhoudelijk en persoonlijk.

Elke semester verwachten wij dat je begint met het maken van een plan. Dit plan geeft richting aan je semester en vormt de basis voor je coachinggesprekken. Het is kort, bondig en flexibel: een hulpmiddel, geen vaststaand document.`,
      },
      {
        title: 'Inhoud en PO: twee kanten van hetzelfde verhaal',
        content: `Een competentie aantonen is meer dan een goed product opleveren. Het gaat om hoe je werkt: hoe je communiceert, samenwerkt, feedback verwerkt en verantwoordelijkheid neemt. Pas als inhoud en houding samen zichtbaar zijn, toon je aan dat je een competentie beheerst.`,
      },
      {
        title: 'Kernvragen Semesterplan',
        content: `Beschrijf wat je gaat doen, waarom dit relevant is, hoe je dat gaat doen, welke expertise je nodig hebt en welke persoonlijke ontwikkeling je meeneemt uit eerdere feedback of eigen observaties.`,
      },
      {
        title: 'Wanneer is PO verplicht?',
        content: `Heb je vorig semester feedback gekregen op niet-inhoudelijke zaken zoals communicatie, aanwezigheid, feedback geven of ontvangen, samenwerking of professioneel gedrag? Dan verwachten we dat je dit opneemt als expliciet aandachtspunt in je semesterplan.`,
      },
      {
        title: 'Gebruik per sprint',
        content: `Controleer of het plan nog relevant is, vul het aan of pas het aan waar nodig, gebruik het in coachinggesprekken en beschrijf in de eindreflectie hoe het plan richting gaf en hoe het veranderde.`,
      },
      {
        title: 'Coachingsmomenten',
        content: `Week 2 of 3 is de eerste bespreking met je coach. Daarna volgen minimaal twee vervolggesprekken waarin je het plan gebruikt en bijstelt. In de eindreflectie beschrijf je hoe het plan richting gaf en welke aanpassingen je deed.`,
      },
      {
        title: 'Richtlijnen Semesterplan',
        content: `Houd het semesterplan kort en bondig, ongeveer 1 tot 2 A4. Het plan is richtinggevend, niet dogmatisch, moet actief gebruikt worden in gesprekken en helpt bij het maken van keuzes en benutten van expertise.`,
      },
    ],
  },
];

export const seedChunks: SeedChunk[] = pages.flatMap((page) =>
  page.sections.map((section) => ({
    source: page.source,
    title: section.title,
    content: section.content,
  })),
);
