# Backend Concept Overview

Dit document beschrijft de huidige POC. Zie ook `docs/poc-to-product-architecture-proposal.md` voor een voorstel om dit concept naar een schonere productarchitectuur of nieuw project te vertalen.

## Voor wie is dit document?

Dit document is bedoeld voor een engineer of productbouwer die dit backendconcept wil begrijpen en de sterkste onderdelen wil meenemen naar een nieuw project. De focus ligt op betekenis, domein, verantwoordelijkheden en architectuur. Er staan bewust geen codevoorbeelden in.

## Waar gaat dit project over?

Dit project is een compacte backend voor een RAG-concept binnen het onderwijsdomein van Fontys ICT. De backend ontsluit cursus- en procesinhoud over Pro Open Learning via een chatinterface. Het systeem is dus geen volledig LMS, maar een kennislaag bovenop bestaande onderwijsinformatie.

De kernvraag die dit project oplost is: hoe kan een student of gebruiker snel begrijpelijke antwoorden krijgen op vragen over semesteropzet, leerdoelen, projecten, challenges, portfolio-opbouw en onderwijsprocessen, zonder zelf door losse Canvas-pagina's te moeten navigeren?

In de praktijk functioneert de backend als een domeinspecifieke vraag-antwoordmachine. Een gebruiker stelt een vraag, de backend zoekt relevante kennisstukken in de opgeslagen onderwijscontent, en levert vervolgens een antwoord terug met bronverwijzingen.

## Publieke routes

### `POST /api/chat`

Dit is de belangrijkste route van het systeem en feitelijk het product zelf. Via deze route stuurt een client een vraag in, eventueel met gesprekshistorie. De backend gebruikt die input om:

- de vraag beter te begrijpen
- het actieve onderwerp van het gesprek vast te stellen
- relevante content te zoeken
- een antwoord te genereren
- de gebruikte bronnen terug te geven

Functioneel is dit dus niet zomaar een chat-endpoint, maar een domeingerichte retrieval- en antwoordroute voor onderwijsinhoud.

### `GET /api/health`

Dit is een technische ondersteuningsroute. De route geeft een eenvoudige status terug waarmee gecontroleerd kan worden of de backend draait. Dit is nuttig voor lokale ontwikkeling, deploy-checks, monitoring en integratie met infrastructuur.

## Controllers

### ChatController

De `ChatController` is bewust dun gehouden. De controller doet zelf geen inhoudelijke logica, maar vormt de API-ingang voor chatvragen. Dat is sterk, omdat de controller daardoor eenvoudig blijft en alle echte intelligentie in services zit. Voor een nieuw project is dit een goed patroon om te behouden.

### HealthController

De `HealthController` heeft alleen een technische verantwoordelijkheid: bevestigen dat de service beschikbaar is. Dit soort controller lijkt klein, maar is praktisch belangrijk voor operations en beheer.

## Volledig overzicht van controllers

### ChatController

Verwerkt binnenkomende chatvragen via de hoofdroute en zet die door naar de chatorkestratie.

### HealthController

Geeft een eenvoudige technische status terug om beschikbaarheid van de backend te controleren.

## Functionele opbouw van de backend

De backend is opgezet in vier duidelijke functionele blokken:

- chat
- search
- embedding
- database

Deze indeling maakt het concept goed overdraagbaar, omdat de verantwoordelijkheden logisch gescheiden zijn.

### Chatlaag

De chatlaag orkestreert de volledige vraag-antwoordflow. Hier wordt bepaald hoe een gebruikersvraag wordt behandeld, welke context nodig is, welke bronnen relevant zijn en hoe het uiteindelijke antwoord moet worden opgebouwd.

Belangrijkste rol binnen deze laag:

- het samenbrengen van context, retrieval, antwoordgeneratie en bronselectie

### Searchlaag

De searchlaag is de retrievalkern van het systeem. Deze laag zoekt niet alleen op basis van vectoren, maar probeert eerst te begrijpen wat voor soort vraag de gebruiker stelt. Daardoor is de zoeklogica afgestemd op het domein, niet alleen op statistische gelijkenis.

Belangrijkste rol binnen deze laag:

- intent herkennen, domeintermen uitbreiden, resultaten beoordelen en een veilige fallback bieden wanneer semantisch zoeken niet overtuigend genoeg is

### Embeddinglaag

De embeddinglaag verzorgt de omzetting van tekst naar vectorrepresentaties via Ollama. Daardoor kan het systeem semantisch zoeken in de opgeslagen content.

Belangrijkste rol binnen deze laag:

- de koppeling met een lokaal embeddingmodel verzorgen zonder die afhankelijkheid door de rest van het systeem heen te laten lekken

### Datalaag

De datalaag slaat de kennisbasis op waaruit het systeem antwoordt. In dit concept bestaat die kennisbasis uit gechunkte cursusinhoud met metadata en optionele embeddings.

Belangrijkste rol binnen deze laag:

- onderwijscontent opslaan, voorzien van metadata en beschikbaar maken voor retrieval

## Belangrijkste services en hun verantwoordelijkheid

### ChatService

De `ChatService` is de centrale orkestrator van het product. Hier komt alles samen. Deze service ontvangt de gebruikersvraag, verrijkt die met gesprekscontext, laat retrieval uitvoeren, kiest de meest bruikbare bronnen en laat een antwoord genereren.

Voor overdracht is dit een van de belangrijkste bouwstenen, omdat hier het systeemgedrag zichtbaar wordt als samenhangende flow in plaats van losse technische onderdelen.

### ConversationContextService

De `ConversationContextService` is een inhoudelijk sterke laag in dit concept. Deze service probeert te begrijpen waar het gesprek al over ging en herkent vervolgvragen zoals korte verwijzingen of impliciete vragen.

Dat is belangrijk omdat gebruikers zelden steeds volledig expliciete vragen stellen. In plaats van alleen de laatste zin te behandelen, maakt deze service het gesprek bruikbaar als contextueel proces.

Voor een nieuw project is dit een sterk idee om te behouden: niet alleen zoeken op de letterlijke vraag, maar ook op de bedoelde vraag binnen het lopende gesprek.

### SearchService

De `SearchService` is inhoudelijk gezien de slimste retrievallaag van dit project. Deze service doet meerdere dingen:

- analyseren wat voor type vraag gesteld wordt
- herkennen welke domeinbegrippen in de vraag voorkomen
- semantisch zoeken via embeddings
- terugvallen op keyword-zoeklogica als vector search onvoldoende betrouwbaar is
- controleren of de gevonden resultaten inhoudelijk sterk genoeg zijn

Het sterke punt hier is dat retrieval niet blind op vector similarity vertrouwt. De service gebruikt domeinkennis en confidence-regels om te voorkomen dat er op zwakke matches wordt geantwoord.

### AnswerGenerationService

De `AnswerGenerationService` zet gevonden kennis om naar een leesbaar antwoord. Primair gebeurt dat via Anthropic, maar als die route niet beschikbaar is, blijft het systeem toch bruikbaar door lokale fallback-antwoorden op basis van samenvatting en structurering van gevonden chunks.

Dat maakt dit concept robuuster dan een pure LLM-afhankelijkheid. Het systeem degradeert gecontroleerd in plaats van volledig uit te vallen.

### EmbeddingService

De `EmbeddingService` kapselt de integratie met Ollama af. Hierdoor blijft de rest van de backend relatief onafhankelijk van de gekozen embeddingprovider. In een migratie naar een nieuw project kan deze service relatief eenvoudig worden vervangen door een andere provider of cloudoplossing.

### DatabaseSeederService

De `DatabaseSeederService` maakt het prototype direct bruikbaar door de kennisbasis automatisch te vullen wanneer de database nog leeg is. Voor een conceptfase is dit sterk, omdat de backend daarmee snel kan worden opgestart zonder apart contentbeheerproces.

## Volledig overzicht van services

### ChatService

Centrale orkestratieservice voor het volledige vraag-antwoordproces.

### ConversationContextService

Bepaalt onderwerp, subonderwerp en vervolgcontext op basis van de huidige vraag en de recente gesprekshistorie.

### AnswerGenerationService

Vormt gevonden kennis om naar een leesbaar eindantwoord, met een LLM-route en een lokale fallback-route.

### SearchService

Zoekt relevante inhoud op basis van intentie, domeintermen, vector retrieval, keyword fallback en kwaliteitscontrole op resultaten.

### EmbeddingService

Maakt vectorrepresentaties van tekst via Ollama zodat semantisch zoeken mogelijk wordt.

### DatabaseSeederService

Vult een lege database automatisch met gechunkte onderwijscontent zodat het prototype direct bruikbaar is.

## Volledig overzicht van DTO's

### ChatMessageDto

Beschrijft de input van een chatverzoek. Deze DTO bevat de gebruikersvraag en optioneel de gesprekshistorie.

### HistoryItemDto

Beschrijft één item uit de gesprekshistorie, inclusief rol en inhoud. Hiermee kan de backend onderscheid maken tussen berichten van gebruiker en assistent.

### ChatResponseDto

Beschrijft de output van de chatroute. Deze DTO bevat het uiteindelijke antwoord en de lijst met gebruikte bronnen.

### ChatSourceDto

Beschrijft één bronverwijzing in de response, inclusief titel, herkomst en relevantiescore.

## End-to-end verwerkingsflow

De hoofdflow van het systeem ziet er als volgt uit:

1. Een gebruiker stuurt een vraag naar de chatroute.
2. De backend bekijkt of er gesprekshistorie is en bepaalt het actieve onderwerp.
3. De vraag wordt geïnterpreteerd op intentie, bijvoorbeeld samenvatting, definitie, vergelijking of specifieke vraag.
4. Het systeem koppelt de vraag aan bekende domeinbegrippen zoals stappenplan, semesterplan of Portflow.
5. De retrievallaag zoekt relevante content, eerst semantisch en waar nodig via een keyword fallback.
6. De backend beoordeelt of de resultaten sterk genoeg zijn om mee te antwoorden.
7. Op basis van de gevonden kennis wordt een antwoord gegenereerd.
8. De client ontvangt zowel het antwoord als de onderliggende bronnen.

Deze flow is een van de kernsterktes van het project, omdat zij klein, begrijpelijk en doelgericht is.

## Domein en inhoudelijke focus

De backend is expliciet afgestemd op Pro Open Learning en de onderwijsstructuur daaromheen. De kennisbasis draait vooral om de volgende onderwerpen:

- stappenplan voor het semester
- persoonlijk semesterplan
- Portflow als portfolio-instrument
- groepschallenge
- individueel project
- persoonlijke ontwikkeling
- leeruitkomsten
- agile werken
- documentatie en reflectie

Dit laat zien dat het systeem niet generiek is ontworpen, maar doelbewust rond een specifiek onderwijsproces is gevormd. Juist dat maakt het concept sterk: de backend begrijpt niet alleen taal, maar ook het domein waarbinnen die taal wordt gebruikt.

## Sterke stukken om mee te nemen naar een nieuw project

### 1. Zeer kleine publieke API

Het systeem heeft slechts één echte productroute en één technische statusroute. Dat houdt de buitenkant eenvoudig en verlaagt de complexiteit voor frontend en integraties.

### 2. Heldere scheiding van verantwoordelijkheden

Controllers zijn dun, services zijn functioneel afgebakend en modules volgen de hoofdrollen van het systeem. Deze scheiding maakt het concept goed onderhoudbaar en makkelijk opnieuw op te bouwen.

### 3. Domeinspecifieke retrieval in plaats van alleen generieke vector search

Een van de sterkste ontwerpkeuzes is dat het systeem intenties en domeintermen herkent. Daardoor zoekt het niet alleen op tekstgelijkenis, maar ook op betekenis binnen het onderwijsproces.

### 4. Follow-up en contextbewustzijn

Het systeem houdt rekening met eerdere vragen en herformuleert impliciete vervolgvragen. Dat vergroot de bruikbaarheid van de chatervaring aanzienlijk.

### 5. Robuuste fallback-architectuur

Als embeddings falen of als een LLM niet beschikbaar is, blijft de backend nog steeds bruikbaar. Dat is een volwassen ontwerpkeuze voor een prototype, omdat het systeem niet volledig omvalt wanneer één afhankelijkheid ontbreekt.

### 6. Bronvermelding richting de client

Het teruggeven van bronnen verhoogt uitlegbaarheid en vertrouwen. Voor een onderwijscontext is dat extra belangrijk, omdat gebruikers willen weten waar informatie vandaan komt.

### 7. Seedbare kennisbasis voor snelle validatie

Voor conceptontwikkeling is het krachtig dat de inhoud direct beschikbaar wordt gemaakt via seeddata. Daardoor kun je de gebruikerservaring snel testen zonder eerst een volledig CMS of redactiestroom op te zetten.

## Beperkingen van dit concept

### Statische kennisbasis

De inhoud wordt nu vanuit seeddata gevuld. Dat is goed voor een prototype, maar niet geschikt als structurele contentstrategie voor een groter product.

### Beperkt aantal routes

De backend heeft bewust een kleine API, maar daarmee ontbreken ook beheerfuncties zoals contentbeheer, evaluatie, gebruikersbeheer of administratie van gesprekken.

### Geen authenticatie of autorisatie

Het concept gaat uit van open toegang binnen de backend zelf. Voor productiegebruik zou toegangscontrole vrijwel zeker nodig zijn.

### Prototypekarakter van de persistence-laag

De database-inrichting laat zien dat snelheid van bouwen belangrijker was dan formeel lifecyclebeheer. Dat past bij een concept, maar zou in een nieuw product strakker moeten worden ingericht.

### Sterke domeinverankering

De retrievallogica is gericht op een specifiek vocabulaire en een specifiek onderwijsmodel. Dat is nu een kracht, maar betekent ook dat hergebruik naar een ander domein alleen werkt als die domeinlaag opnieuw wordt ontworpen.

## Migratiegerichte aanbeveling

Voor een nieuw project zijn dit de onderdelen die je vrijwel direct zou moeten behouden:

- de kleine publieke API-opzet
- de scheiding tussen chat, retrieval, embeddings en opslag
- contextuele vraagverrijking
- domeinspecifieke zoekintelligentie
- bronvermelding in het antwoord
- gecontroleerde fallback bij externe AI-afhankelijkheden

Dit zijn de onderdelen die je in een nieuw project generieker zou moeten maken:

- de domeintermen en begrippenlaag
- de seedstrategie voor content
- de keuze van embedding- en generatieproviders
- de opslag- en contentbeheerlaag

Dit zijn de onderdelen die later pas enterprise-waardig hoeven te worden gemaakt:

- authenticatie en autorisatie
- beheerportalen
- contentpublicatie-workflows
- monitoring op retrievalkwaliteit
- beheer van meerdere kennisdomeinen naast elkaar

## Korte conclusie

De essentie van dit project is niet een traditionele backend met veel routes, maar een compacte, domeinspecifieke RAG-service voor onderwijsinhoud. De echte kracht zit in de combinatie van eenvoudige API-opbouw, contextbewuste chatverwerking, retrieval met domeinkennis en uitlegbare antwoorden met bronnen. Als je dit concept overhevelt naar een nieuw project, zijn dat de onderdelen met de hoogste herbruikbare waarde.
