## Inleiding

Voor dit project werk ik samen met mijn groep aan het verbeteren van de digitale leeromgeving binnen Fontys. De huidige omgeving draait om Canvas als learning management systeem, aangevuld met een ecosysteem van losse tools (FeedPulse, portfolio, Fontys Links, Studycoach). De stakeholder voor dit project is Eric Slaats, betrokken bij de ontwikkeling van de opleiding Digital Transformer.

In eerdere semesters heb ik mij vooral gericht op de software-laag (architectuur en realisatie). Dit semester wil ik dat voortzetten op niveau 3, waarbij ik werk binnen een context van bestaande systemen. Daarnaast richt ik mij op de architectuurlagen Infrastructuur en/of User Interaction op niveau 2.

## Aanleiding

Canvas is ingericht rondom modules en cursussen, terwijl het onderwijs binnen Fontys steeds meer richting vraaggestuurd werken beweegt. Studenten werken niet lineair door één module, maar schakelen tussen leeractiviteiten, feedbackmomenten en persoonlijke leerdoelen. Dit geldt niet alleen voor HBO-ICT open learning, maar ook voor nieuwere opleidingen zoals de Digital Transformer — waar ICT gecombineerd wordt met andere domeinen en challenges variëren van drie weken tot drie jaar.

Studenten kunnen niet altijd vinden wat ze nodig hebben: de zoekfunctie hapert, informatie is verspreid over meerdere systemen, en de manier waarop content wordt aangeboden (overwegend tekst) sluit niet aan bij hoe studenten informatie consumeren. Het gevolg is dat studenten vragen stellen over zaken die al ergens in een course staan.

## Context

De kernvraag is:

> _Hoe verbeter je de leerervaring binnen Canvas zodat niet de module maar de student en diens activiteiten centraal staan, en vraaggestuurd onderwijs ondersteund wordt met zo weinig mogelijk frictie?_

Canvas blijft daarbij de basis - een nieuw LMS bouwen is niet de bedoeling. Canvas heeft een open API en via LTI kunnen externe tools in de omgeving geïntegreerd worden.

De requirements zijn nog niet gedefinieerd. Dit project begint met een ideation-fase: breed ideeën ophalen bij studenten (avond en dag), coaches en docenten, en die scoren op criteria als haalbaarheid en stakeholderwaarde. Mijn analyse- en advieswerk vormt hiervoor de eerste basis. Paper prototypes en snelle validatie met echte gebruikers zijn belangrijker dan een uitgewerkt eindproduct.

## Procesbeschrijving

Dit document beschrijft per sprint de werkwijze, resultaten en conclusies van het project. De gedetailleerde uitwerkingen van alle analyses en deliverables zijn terug te vinden in de bijbehorende portfolio-inzendingen. Welke competenties waar worden aangetoond staat beschreven in het @Semesterplan .

## Sprint 1: Analyseren (t/m 17 maart 2026)

### Werkwijze & methoden

Het doel van sprint 1 was het kernprobleem helder krijgen voordat er ook maar een oplossingsrichting gekozen werd. Eric Slaats benadrukte dit bij het eerste stakeholder gesprek expliciet: begin niet met _"dit gaan we bouwen"_**, maar verken **eerst breed**. Dat principe heeft voor mij de werkwijze van deze sprint bepaald.

De sprint startte met het scherp stellen van de challenge. De oorspronkelijke challengeomschrijving was op onderdelen onduidelijk; ik heb het initiatief genomen om deze te herschrijven zodat het team een gedeeld en helder vertrekpunt had.

Vervolgens is de probleemanalyse uitgewerkt via een 5W+1H-analyse en een Ishikawa-diagram (6M-methode). De 5W+1H bracht de situatiecontext in kaart; het Ishikawa-diagram ging dieper op de onderliggende oorzaken. Samen maken ze zichtbaar dat het probleem zich op meerdere niveaus afspeelt (technisch, didactisch en gedragsmatig) en dat de kern niet één ding is maar een samenspel van factoren. Beide zijn samengevat in de probleemanalyse, inclusief een geformuleerd kernprobleem als vertrekpunt voor sprint 2.

Parallel daaraan heb ik een technische verkenning uitgevoerd van de Canvas API en LTI. Canvas biedt een uitgebreide REST API en ondersteuning voor LTI 1.3, wat betekent dat externe tools diep kunnen integreren in de Canvas-omgeving zonder een apart platform te bouwen. Tijdens deze verkenning heb ik ook de bestaande AI-tool voor competentiemapping binnen Fontys nader bekeken. Dit bleek een Custom GPT te zijn: een wrapper om ChatGPT heen met het competentieraamwerk als context, gebouwd via het platform van OpenAI zonder eigen code. Dat maakt koppeling met Canvas en LTI lastig - een Custom GPT draait volledig buiten de Fontys-infrastructuur en biedt geen API of integratiemogelijkheden. Een eigen chatbot lijkt daarom een realistischere richting. Om cursusinhoud uit Canvas te kunnen ontsluiten via zo'n chatbot, heb ik de mogelijkheden van RAG (Retrieval Augmented Generation) verkend als alternatief voor het fine-tunen van een model. RAG lijkt op het eerste gezicht praktischer en kostenefficiënter, maar dit vraagt om verdere validatie met een expert en afstemming met Eric Slaats. Dit is relevant voor de oplossingsruimte die in sprint 2 wordt verkend.

Om in sprint 2 gericht gebruikersonderzoek te kunnen doen, zijn in sprint 1 twee instrumenten voorbereid: een enquête voor studenten en een enquête voor coaches en docenten, gericht op het valideren van de aannames uit de probleemanalyse. Daarnaast zijn twee interviewguides opgesteld (voor studenten en voor coaches/docenten) als semigestructureerd instrument voor de kwalitatieve verdieping in sprint 2. De enquêtes worden deze sprint uitgezet; de interviews volgen na verwerking van de resultaten.

Het projectplan is deze sprint grotendeels afgerond, inclusief een vraagstelling met hoofdvraag en zeven deelvragen die de activiteiten voor het hele semester aansturen. De DOT-methodes per deelvraag zijn expliciet benoemd zodat de methodische onderbouwing inzichtelijk is.

Op advies van de docent heb ik aan het einde van sprint 1 ook alvast een interactief lo-fi prototype gebouwd. De intentie was aanvankelijk een papieren prototype, maar omdat het met de beschikbare tooling verrassend snel ging, is er direct een werkende React-applicatie van gemaakt. Het prototype heeft een thema-toggle waarmee je live kunt schakelen tussen een wireframe-weergave en een Material UI-weergave. Het dient als gespreksinstrument voor het tweede stakeholdergesprek met Eric Slaats, zodat ik met een concreet en klikbaar prototype aan tafel zitten in plaats van alleen een beschrijving van een idee.

**Gebruikte methoden:**

- Problem analysis: 5W+1H (DOT: Field)
- Root cause analysis: Ishikawa 6M (DOT: Workshop)
- Document analysis: Canvas API documentatie, LTI 1.3 specificaties (DOT: Library)
- Survey design: enquêtes studenten en coaches/docenten (DOT: Field)
- Interview design: semigestructureerde interviewguides (DOT: Field)
- Prototyping: interactief lo-fi prototype met thema-toggle (DOT: Workshop)

### Resultaten

**Challenge beschrijving**

De oorspronkelijke challengeomschrijving was op onderdelen onduidelijk. Ik heb het initiatief genomen om een nieuwe versie te schrijven die de probleemruimte open laat en het team een gedeeld vertrekpunt geeft voor de ideation-fase.

@Voorstel Challenge beschrijving / casus - Activity first LMS

**Semesterplan**

Het semesterplan beschrijft wat ik dit semester wil bereiken, welke competenties ik wil aantonen, waarom die keuzes passend zijn bij dit project, en hoe ik dat per sprint ga aanpakken. Het bevat ook een persoonlijk ontwikkelpunt rond perfectionisme en gebruikersonderzoek als nieuwe vaardigheid.

@Semesterplan

**Achtergrond Design Thinking**

Om de ideation-fase methodisch te kunnen uitvoeren heb ik de Design Thinking-aanpak bestudeerd. Dit document beschrijft de zes fasen, het iteratieve karakter en de kernprincipes. Het dient als theoretische onderbouwing voor de werkwijze in sprint 2.

@Achtergrond informatie Design Thinking

**STARR-reflectie: gesprek met Pieter Wels**

Reflectie op een gesprek met Pieter Wels over de richting van het project en mijn eigen rol daarin. De STARR-structuur (Situatie, Taak, Actie, Resultaat, Reflectie) maakt de leerervaring en het persoonlijk groeimoment inzichtelijk.

@STARR-reflectie - gesprek met Pieter Wels

**Gespreksverslag stakeholder: Eric Slaats**

Kennismakingsgesprek met Eric Slaats op 4 maart 2026. Eric schetst de context van de Digital Transformer opleiding, de pijnpunten van het huidige Canvas-gebruik, en zijn wens voor een dialooggerichte leeromgeving. Het gesprek heeft de challengeomschrijving en het projectplan direct aangestuurd.

@Eerste Kennismaking (gespreksverslag)

**Probleemanalyse**

De 5W+1H en het Ishikawa-diagram zijn uitgewerkt in een gecombineerde probleemanalyse. Het kernprobleem is geformuleerd als: _"De leerervaring in Canvas is module-gericht en ondersteunt vraaggestuurd onderwijs niet."_ De meest impactvolle oorzaken liggen in de methode (LMS versus vraaggestuurd onderwijs), de machine (versnippering van tools), het materiaal (geen alternatieve contentvormen) en de meting (geen voortgangsinzicht).

@Probleemanalyse

**Technische verkenning: LTI, Canvas API en RAG**

Canvas biedt een gedocumenteerde REST API en ondersteuning voor LTI 1.3. Daarnaast is RAG (Retrieval Augmented Generation) verkend als technische richting voor het intelligent ontsluiten van cursusinhoud via een chatbot. De verkenning analyseert functionaliteit, interfaces en beperkingen van bestaande systemen - wat dit direct positioneert als Software-Analyseren niveau 3.

@Technische verkenning: LTI, Canvas API en RAG

**Projectplan**

Het projectplan bevat de projectinhoud, doelstelling, aanpak, vraagstelling (hoofdvraag + zeven deelvragen met DOT-methodes), planning in vier sprints, communicatieplan en risicomanagement.

@Projectplan - Studentgericht leerplatform voor vraaggestuurd onderwijs

**Gebruikersonderzoek: instrumenten sprint 1** Een enquête en een semigestructureerde interviewguide zijn opgesteld als voorbereiding op het gebruikersonderzoek in sprint 2. De enquête bevat vragen voor twee doelgroepen: studenten (17 vragen) en coaches/docenten (10 vragen), gericht op Canvas-gebruik, toolversnippering, leerervaring, planning en competentiekoppeling. De interviewguide werkt na verwerking van de enquêteresultaten dieper uit hoe beide doelgroepen bevraagd worden. Resultaten en analyses volgen in sprint 2.

@Gebruikers onderzoek: Instrumenten – Studentgericht leerplatform

**Interactief lo-fi prototype**

Op advies van de docent is aan het einde van sprint 1 een werkend prototype gebouwd als voorbereiding op het tweede stakeholdergesprek met Eric Slaats. Het prototype toont de hoofdstructuur van het platform: een chatinterface met sidebar, een activiteitenpanel met verticale tijdlijn, en een Learning-tab. Via een thema-toggle is live te schakelen tussen een wireframe-weergave en een Material UI-weergave, zodat de structuur bespreekbaar is zonder dat het al als een definitief ontwerp overkomt.

@Prototype - Studentgericht leerplatform

---

### Conclusie

**Helder vertrekpunt voor sprint 2**

Sprint 1 heeft opgeleverd wat het moest opleveren: een scherp geformuleerd kernprobleem, inzicht in de onderliggende oorzaken, en een methodisch onderbouwde aanpak voor het gebruikersonderzoek dat in sprint 2 volgt. Het projectplan geeft richting aan het hele semester zonder de oplossingsruimte prematuur te sluiten.

De technische verkenning laat zien dat de Canvas API en LTI 1.3 voldoende aanknopingspunten bieden voor een externe tool die diep integreert met de bestaande omgeving. Wat die tool precies doet, wordt bepaald door wat uit de analyse en ideation naar voren komt, niet andersom.

**Persoonlijke ontwikkeling**

Gebruikersonderzoek is nieuw terrein voor mij. In vorige semesters bouwde ik snel; dit semester dwingt de challenge me om eerst te begrijpen voordat ik ontwerp. Het opstellen van de enquêtes en interviewguides was concreet voelbaar oncomfortabel: niet weten wat de antwoorden worden, niet kunnen sturen op een richting. Dat is precies de vaardigheid die ik wil ontwikkelen.

Eric's principe "houtje touwtje mag, het gaat om validatie" helpt om los te komen van de neiging om alles eerst perfect uit te denken.

**Wat meeneemt naar sprint 2**

De enquêteresultaten en interviews sturen de ideation-fase direct aan. De zeven deelvragen uit het projectplan bepalen de volgorde: eerst valideren wat gebruikers als meest knellend ervaren (deelvragen 1-3), dan de bestaande AI-tool beoordelen (deelvraag 4), dan de technische mogelijkheden uitwerken (deelvraag 5), en pas daarna oplossingsrichtingen scoren en kiezen (deelvragen 6-7).

De verkenning van RAG als technische richting heeft een interessante maar ook uitdagende denkrichting opgeleverd. Een eigen chatbot gekoppeld aan Canvas via LTI en RAG biedt meer mogelijkheden op het gebied van software- en infrastructuurarchitectuur, past bij mijn profiel en ambities, maar is ook aanzienlijk complexer dan een eenvoudigere oplossing. Dit brengt een reëel risico op studievertraging met zich mee als de scope niet scherp bewaakt wordt. Ik wil dit in sprint 2 bespreken met mijn coach en een expert op school raadplegen over de technische haalbaarheid. Ook met Eric Slaats moet gepolst worden in hoeverre hij openstaat voor deze richting voordat er verdere keuzes worden gemaakt.

Daarnaast is aan het einde van sprint 1 een concept literature study over nudging opgesteld. Nudging - het stimuleren van gewenst gedrag via kleine, niet-dwingende aanwijzingen op het juiste moment - is een potentieel relevant ontwerpprincipe voor dit project, omdat een deel van de geïdentificeerde problemen gedragsmatig van aard is en niet puur technisch oplosbaar. De literature study is nog niet strak uitgewerkt en wordt in sprint 2 aangevuld met concrete bronnen via literatuuronderzoek. Of nudging daadwerkelijk deel uitmaakt van de gekozen oplossingsrichting wordt bepaald na de ideation-fase.

@Concept Literature study: nudging in onderwijstechnologie

---

-> template fontys voor referentie

---

- Aanleiding - Beschrijf in de collection description het probleem of de kans die aanleiding is tot de opdracht, de doelstelling en de (bedrijfs-) context.Met deze beschrijving krijgt de lezer een duidelijk beeld waar het project over gaat en wat de lezer kan verwachten.  
- Proces - Dit is de kern en beschrijft de uitvoering. Dit bouw je op aan de hand van het proces dat je doorloopt gedurende je semester. Denk bijvoorbeeld aan een indeling per onderzoeksfase, per onderzoeksvraag of per sprint. Bespreek het volgende:
  - Vanuit welk(e) probleem/onderzoeksvraag/onderzoeksfase ben je vertrokken?
  - Wat is de context/aanleiding?
  - Op welke manier ben je te werk gegaan? Denk aan: Wat voor methodes en/of strategieën heb je tijdens deze fase/vraag uitgevoerd?
  - Wat is het resultaat?
  - Wat is de conclusie?    


Tip! Maak in de tekst gebruik van verwijzingen naar bewijs. Doe dit door @'naam van het bewijsstuk' te typen
