# Feedback-log

**Project:** Bouw je eigen Learning Management System (LMS)
**Auteur:** Tijn Knapen
**Bijgehouden vanaf:** Sprint 1 (maart 2026)

## Inleiding

Dit document houdt bij welke feedback ik heb gevraagd en ontvangen, en wat ik daarmee heb gedaan. Het doel is om aan te tonen dat ik feedback actief opzoek, verwerk en er concreet iets van leer. Per feedbackmoment noteer ik: van wie ik feedback vroeg, wat de feedback inhield, en wat ik er vervolgens mee heb gedaan.

---

## Sprint 1 - Analyseren (maart 2026)

### Semesterplan - 17 maart 2026

**Van:** Coach

**Feedback:** Architectuurlaag "Design" moet "User Interaction" zijn, keuze infrastructuur was onduidelijk, vroeg realiseren beter benadrukken.

**Verwerkt:** Terminologie aangepast, motivatie herschreven, vroeg prototypen toegevoegd aan sprint 1 en 2.

### Challenge voorstel - maart 2026

**Van:** Coach

**Feedback:** Begin en einde van het document sluiten niet goed op elkaar aan. Eigen observaties nog niet gevalideerd bij stakeholders - inzichten uit de twee stakeholdergesprekken moeten erin verwerkt worden. Onduidelijk of het een individueel of groepsdocument is. Technische scope is te vroeg, eerst probleemstelling scherper krijgen.

**Verwerkt:** Grading bottleneck verwijderd als hoofdfocus, "nieuw LMS vanaf nul bouwen" vervangen door LTI-prototype richting, stakeholderinzichten van Eric Slaats en Manon Blom verwerkt, kernvraag bijgewerkt, technische scope eerlijker gemaakt (richting, geen definitieve keuzes), duidelijk gemaakt dat het een individueel voorstel is.

---

## Sprint 2 - Adviseren + start Ontwerpen (april 2026)

### Strategie chatbot - maart 2026

**Van:** Lennart (begeleider)

**Feedback:** Vraag 1 mixt twee soorten keuzes: lokaal vs cloud (architectuur) staat als derde optie naast direct API en framework (implementatie). Die horen op een ander niveau. Vraag 2 is grotendeels goed, maar function calling staat verkeerd gepositioneerd naast prompt en RAG - het is een orkestratie-strategie, niet een context-strategie. Verder: de verkenning is nog te breed, scope vanuit de use cases.

**Verwerkt:** Vraag 1 geherstructureerd via een component-model (input, context, orchestratie, LLM, output). Lokaal vs cloud staat nu als aparte LLM-keuze, direct API vs framework als aparte orchestratie-keuze. In Vraag 2 een expliciete splitsing toegevoegd tussen context-strategieen (prompt, RAG) en orkestratie-strategie (function calling). Werkwijze aangevuld met het plan: eerst een apart onderzoeksdocument om een richting te kiezen, dan iteratie 1 starten, dan evalueren of de aanpak werkt of niet.

### Feedpulse checkpoint 2 wk08 - 7 april 2026

**Van:** Coach Coen

**Feedback:** Houd me aan het onderzoek en geef een duidelijke aanleiding door de gekozen modellen expliciet te motiveren en uit te leggen waarom ik juist die modellen test. Daarnaast: vergelijk de output van mijn chatbot met de GPT-versie van Fontys ICT (de HBO-i Outcomes Example Generator).

**Verwerkt:** Modelkeuze expliciet onderbouwd in iteratie 1: Llama 3.1 8B getest, afgekeurd op hallucinaties, overgestapt naar Qwen 2.5 14B met onderbouwing op instructieopvolging en Nederlands (sprint2/iteratie1-1-onderzoek.md en iteratie1-3-conclusie.md). De GPT-vergelijking heb ik niet als losse test uitgevoerd, maar de HBO-i Outcomes Example Generator is wel meegenomen in sprint2/advies.md als Concept A, met een onderbouwing waarom een tekstgenerator alleen het kernprobleem (systeem kent de student niet) niet oplost.

### Portflow feedback request iteratie 1 - 8 april 2026

**Van:** Coach Coen, via Portflow

**Feedback:** Op 8 april heb ik via Portflow een feedback request ingediend bij Coen op de bestanden Iteratie 1-2 Prototype en Iteratie 1-3 Conclusie, zodat hij na ons gesprek schriftelijk kon reageren op de prototype-output en de conclusies. Coen heeft pas op 21 april gereageerd en gaf aan dat hij niet eerder aan de request was toegekomen en niet meer wist welke vragen we besproken hadden of welke feedback hij had gegeven. Inhoudelijke feedback op de bestanden is via dit kanaal dus uitgebleven.

**Verwerkt:** Geen inhoudelijke feedback ontvangen op deze request, dus niets concreet te verwerken vanuit dit kanaal. De inhoudelijke richting van iteratie 1 is wel mondeling besproken in feedpulse checkpoint 2 (7 april), en de feedback daaruit is hierboven al verwerkt. Deze entry staat hier om aan te tonen dat ik actief schriftelijke feedback heb opgevraagd via Portflow, ook al is daar in dit geval geen inhoudelijke reactie op gekomen.

### Feedpulse checkpoint 3 - 21 april 2026

**Van:** Marc Jonkers (Infrastructure-assessor)

**Feedback:** Per HBO-i activiteit voor Infra niveau 1 concreet maken wat het bewijsstuk moet zijn. Analyseren: behoefteanalyse uitwerken voor de chatbot-serveromgeving, met conclusie en advies, plus Docker analyseren en onderbouwen waarom dit passend is. Ontwerpen: zowel een high-level als een low-level diagram opstellen van de infrastructuur. Realiseren: de server daadwerkelijk bouwen. Manage & Control: installatiehandleiding en stappenplan voor beheer opleveren. Aandachtspunt: analyse-, ontwerp- en installatieartefacten nog expliciet documenteren naast de werkende chatbotomgeving die al draait.

**Verwerkt:** Sprint 3 volledig op basis van deze checklist ingericht. Per activiteit een bewijsstuk opgeleverd in individueel/Tijn/sprint3/end-to-end-poc/: infrastructuuranalyse-poc.md (per-component analyse + Docker-onderbouwing + 7 conclusies), infrastructuuradvies-poc.md (advies dat volgt uit de analyse), infrastructuurontwerp-poc.md (5 diagrammen volgens het C4-model: context, containers, components, ER en sequence), werkende code in end-to-end-poc/ als realisatie en INSTALL.md voor Manage & Control. De vijf bewijsstukken zijn 20-21 mei via Portflow naar Marc gestuurd als feedback requests.

---

## Sprint 3 - Ontwerpen + Realiseren (mei 2026)

### Feedpulse checkpoint 4 wk12 - 12 mei 2026

**Van:** Coach Coen

**Feedback:** Sprint 2 besproken. Ik moet actiever feedback vragen en duidelijker laten zien wat ik gemaakt heb. De feedback-log was op zich goed, maar moet uitgebreid worden en bovenaan de leeswijzer staan zodat hij makkelijk te vinden is. In de log horen alle vormen van feedback thuis: groupfeedback, PR reviews en feedback uit de kanbanborden.

**Verwerkt:** Feedback-log voor sprint 3 uitgebreid met alle bronnen: individuele feedpulses (deze en alle voorgaande checkpoints), Marc-gesprek 19 mei, PR-review feedback en kanban-feedback. Twee eigen PR-reviews (pr4-mockapi-review.md en pr7-implement-ollama-review.md) worden als bewijsstuk professionele standaard ingeleverd, en de kanban-link (https://github.com/users/janvanhest/projects/3) is met onderbouwing als bewijs aangeleverd. Actief feedback gevraagd in het Marc-gesprek 19 mei en in het stakeholdergesprek over de eindrichting.

### Feedpulse checkpoint 5 wk13 - 19 mei 2026

**Van:** Marc Jonkers (Infrastructure-assessor)

**Feedback:** Twee aandachtspunten na het tonen van mijn end-to-end PoC. (1) Security en prompt injection: straks worden opdrachten van studenten uit hun portfolio in de vector-database opgeslagen en de chatbot moet die data per gebruiker ophalen. Dat geeft risico op prompt injection. Ik moet de security hierop controleren en een concreet plan hebben om dit af te vangen. (2) High-level diagram: duidelijker opschrijven wat er in het diagram staat en waarom die keuzes gemaakt zijn, bijvoorbeeld waarom een 768-dimensionale vector. Ook niet alleen het huidige ontwerp tonen, maar beredeneren wat een goede architectuur zou zijn.

**Verwerkt:** Security-onderzoek staat als hoofdactiviteit op de planning voor sprint 4 (analyse + advies, geen implementatie), zodat het direct als competentiebewijs Analyse-I1 en Advise-I1 kan dienen. Voor het high-level diagram is in infrastructuuranalyse-poc.md al een disclaimer toegevoegd dat de keuzes in de analyse onderbouwd zijn; de extra uitleg over de 768-dim vector en de afweging van een ideale architectuur wordt in sprint 4 verwerkt in infrastructuurontwerp-poc.md.

### Feedpulse checkpoint 6 wk13 - 19 mei 2026

**Van:** Coach Coen

**Feedback:** Stand van zaken besproken: mijn end-to-end PoC, Jan's gedeelte van het eindproduct, en de kanban die we hebben opgezet om het werk te verdelen en overzicht te houden. Ook aangekaart dat de samenwerking met het backend/api-team op dit moment moeizaam verloopt, waardoor Jan en ik zijn overgestapt op zelf de backend bouwen met mockdata.

**Verwerkt:** De keuze om zelf de backend te bouwen met mockdata is al uitgevoerd in sprint 3: json-server (PR #4) draait als mock REST API zodat de frontend onafhankelijk kan doorbouwen, en de eigen NestJS backend (PR #5 en verder) levert de echte chat- en RAG-pipeline. Hierdoor zijn we niet meer geblokkeerd op het backend/api-team. Coen heeft op dit checkpoint nog geen schriftelijke feedback geplaatst; bij verdere reactie wordt deze entry aangevuld.

### Portflow feedback requests Infra niveau 1 - 20-21 mei 2026

**Van:** Marc Jonkers (Infrastructure-assessor), via Portflow

**Feedback:** Op 20 en 21 mei heb ik via Portflow vijf feedback requests naar Marc gestuurd, een per HBO-i activiteit voor Infrastructure niveau 1: Analyse (infrastructuuranalyse-poc.md), Advise (infrastructuuradvies-poc.md), Design (infrastructuurontwerp-poc.md), Realise (end-to-end-poc-realisatie.zip) en Manage & Control (INSTALL.md). Bij elk bewijsstuk gericht om beoordeling en gerichte feedback gevraagd, met expliciete verwijzing naar de eisen uit het Marc-gesprek van 21 april (zie feedpulse checkpoint 3). Op het moment van schrijven (24 mei) zijn de reacties nog niet binnen.

**Verwerkt:** Ik had de feedback van Marc graag al meegenomen in deze sprint, maar hij heeft nog geen tijd gehad om op de requests te reageren. Deze entries staan hier alvast om aan te tonen dat ik actief feedback heb opgevraagd voor alle vijf activiteiten en niet enkel gewacht heb op een mondelinge beoordeling. Zodra Marc per request reageert, wordt per bewijsstuk een eigen vervolg-entry toegevoegd met de ontvangen feedback en wat ik ermee gedaan heb.

---

## Sprint 4 - Realiseren + Manage & Control (juni 2026)



---

## Groepsfeedback (Feedpulse groep)

Naast mijn individuele feedpulses zijn er per overleg ook groepsfeedpulses ingevuld. Hieronder per checkpoint een korte samenvatting van wat besproken is en wat de groep eruit meenam.

### Checkpoint 1 wk07 - Coen - 31 maart 2026
**Door:** Jan van Hest
Rolverdeling werd onduidelijk, iedereen werkt op een eigen eilandje. Stakeholder verwacht meerdere prototypes vergeleken en een onderbouwd advies, niet 1 oplossing volledig uitgewerkt. Tijn (ziek) en Karin afwezig. Afspraken: korte standup dinsdagavond, donderdag 20 minuten samenkomst, Jan start met advies.

### Checkpoint 2 wk08 - Coen - 7 april 2026
**Door:** Burak Ergin
Mockups en enquêteresultaten besproken. Informatievindbaarheid is hoofdpijnpunt voor avondstudenten (~50% ervaart het als moeilijk). Canvas API: eigen studentdata mogelijk, geen sandbox, beschikbare course-omgeving reset elke 24u. Vervolgacties: enquête onder voltijdstudenten, API-tokens regelen, adviesdocument opstellen.

### Checkpoint 3 wk08 - donderdag teammeeting - 13 april 2026
**Door:** Tijn Knapen (zelf geschreven)
Catch-up waarbij iedereen zijn mockup/prototype heeft laten zien, beoordeeld op 7 criteria (vindbaarheid, competentiekoppeling, alternatieve modaliteit, activiteitenoverzicht, minder versnippering, technische haalbaarheid, gedeelde context). Conclusie: groep werkt te individueel, nog geen afstemming met stakeholder, nog geen retrospect. Openstaande taken: bijdragen aan adviesrapport, voorbereiden stakeholder-presentatie 14 april.

### Checkpoint 4 wk09 - Eric & Lennart/Coen - 15 april 2026
**Door:** Burak Ergin
Sprint 2 oplevering met Eric + feedbacksessie met Lennart en Coen. Inzicht: studenten zien competenties als doel om "te halen" terwijl ze didactisch holistisch bedoeld zijn. Probleem: studenten weten niet welke activiteiten ze moeten doen en hoe die bijdragen aan competenties. Richting: activiteitenflow met centrale plek voor stappen, chatbot ondersteunt met planning en koppeling competentie aan werk.

### Checkpoint 5 wk10 - groep - 21 april 2026
**Door:** Tamara Lemmens
Unaniem gekozen om de mockup van Jan (React + TypeScript + Material UI) als uitgangspunt te nemen voor verdere uitwerking. Chatbot krijgt een eigen pagina. Beperkingen: FeedPulse en competentietool hebben geen API en moeten gemockt, Portflow-toegang onzeker. Focus komende periode: technisch concreet maken hoe de onderdelen samenkomen.

### Checkpoint 6 wk12 - groep met Coen - 12 mei 2026
**Door:** Wares Helmand
Voortgang besproken. Wares en Tamara: backend met Azure (Docker als optie). Jan en Tijn: chatbot met Docker Compose. Burak: nudging. Behoefte aan een document of diagram dat de interface tussen de onderdelen beschrijft. Coachgesprekken in vervolg in een vast tijdsblok plannen. Stakeholdergesprek ingepland voor 26 mei 2026.

---

## Competentieverantwoording

**PS-2**

In dit document toon ik aan dat ik feedback professioneel verwerk als onderdeel van mijn werkwijze. Ik zoek actief feedback op bij docenten, coaches en teamgenoten, verwerk wat ik ontvang en koppel terug wat ik ermee heb gedaan. Dit past bij de professionele aanpak die PS-2 vraagt: doelgericht werken, stakeholders betrekken en continu verbeteren op basis van input uit de omgeving.
