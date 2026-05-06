# Technische verkenning: LTI, Canvas API en RAG

**Doel:** Verkennend onderzoek naar de technische mogelijkheden voor integratie met Canvas en het intelligent ontsluiten van cursusinhoud via een taalmodel. Dit document dient als input voor de ideation-fase en als bewijs voor Software-Analyseren (niveau 3): analyse van functionaliteit en interfaces van bestaande en nieuwe systemen in een complexe context.

**DOT-methodes:**
- **Document analysis** (Library) — Canvas API documentatie en LTI 1.3 specificaties bestudeerd
- **Available product analysis** (Library) — bestaande libraries, vector databases en taalmodellen vergeleken
- **Literature study** (Library) — RAG als techniek onderbouwd en afgewogen tegen fine-tuning

---

## 1. LTI (Learning Tools Interoperability)

### Wat is het?

LTI is een open standaard van 1EdTech (voorheen IMS Global) die het mogelijk maakt om externe tools te integreren in een learning management systeem. De huidige versie is LTI 1.3. In LTI-terminologie is Canvas het **platform** en is onze applicatie de **tool**.

Het kernidee: een student klikt op een link in Canvas, wordt veilig doorgestuurd naar de externe tool, en kan daar werken alsof het onderdeel is van Canvas. De tool ontvangt informatie over wie de gebruiker is, in welke cursus die zit, en welke rol die heeft - zonder dat de gebruiker apart hoeft in te loggen.

### Hoe werkt het technisch?

LTI 1.3 is gebaseerd op OpenID Connect en OAuth 2.0. De flow:

1. Student klikt op een LTI-link in Canvas
2. Canvas stuurt een OpenID Connect login-request naar de tool
3. De tool valideert en stuurt een authentication request terug
4. Canvas bouwt een JWT (JSON Web Token) met daarin de LTI-payload: gebruikersinfo, cursuscontext, rol
5. Canvas signeert de JWT met zijn private key en stuurt die naar de tool
6. De tool valideert de JWT met Canvas' public key en toont de juiste content

### LTI Advantage

Bovenop LTI 1.3 zijn er drie uitbreidingen die samen LTI Advantage heten:

**Assignment and Grade Services (AGS)** - de tool kan cijfers terugsturen naar het Canvas gradebook. Handig als we bijvoorbeeld een activiteitentracker bouwen die voortgang wil rapporteren.

**Names and Role Provisioning Services (NRPS)** - de tool kan de cursuslijst opvragen: welke studenten zitten in de cursus, welke rollen hebben ze? Essentieel als we een coach-dashboard willen bouwen dat laat zien welke studenten actief zijn.

**Deep Linking** - een docent kan vanuit Canvas de tool openen, specifieke content selecteren, en die als link terugplaatsen in de cursusstructuur. Bijvoorbeeld: een docent selecteert een specifieke activiteit uit onze tool en plaatst die in een Canvas-module.

### Wat betekent dit voor ons project?

| Mogelijkheid                                   | Relevant? | Toelichting                                               |
| ---------------------------------------------- | --------- | --------------------------------------------------------- |
| Single sign-on vanuit Canvas                   | Ja        | Studenten hoeven niet apart in te loggen                  |
| Gebruikersrol meesturen (student/coach/docent) | Ja        | We kunnen verschillende views tonen per rol               |
| Cursuscontext meesturen                        | Ja        | De tool weet in welke cursus de student zit               |
| Cijfers terugsturen naar Canvas                | Misschien | Handig als we voortgang willen koppelen aan het gradebook |
| Cursuslijst opvragen                           | Ja        | Nodig voor een coach-dashboard                            |
| Content embedden in Canvas                     | Ja        | Onze tool verschijnt als onderdeel van de Canvas-ervaring |

### Beperkingen

- LTI-tools draaien in een iframe binnen Canvas, of openen in een nieuw tabblad. De iframe-optie kan problemen geven met third-party cookies in moderne browsers.
- De tool moet op een eigen server gehost worden - het is een volledig losse webapplicatie.
- Configuratie vereist samenwerking met de Canvas-beheerder (Eric kan dit regelen).
- LTI stuurt beperkte informatie mee. Meer gedetailleerde data (cursusinhoud, submissions) moet via de Canvas REST API opgehaald worden.

---

## 2. Canvas REST API

### Wat is het?

Canvas biedt een uitgebreide REST API waarmee je vrijwel alles kunt doen wat je ook via de webinterface kunt. De API is JSON-gebaseerd en gebruikt OAuth 2.0 voor authenticatie. Eric heeft aangeboden om development keys te regelen.

### Authenticatie

Twee opties:

- **Access tokens** - voor ontwikkeling en persoonlijk gebruik. Genereer een token in je Canvas-instellingen.
- **Developer keys (OAuth 2.0)** - voor applicaties die namens gebruikers werken. Eric kan deze regelen.

### Relevante API-endpoints

**Courses** (`/api/v1/courses`)

- Cursussen ophalen waar een gebruiker in zit
- Cursusdetails, modules, en pagina's opvragen
- Analytics: participatie en activiteit per cursus

**Users** (`/api/v1/users`)

- Gebruikersinformatie ophalen
- Cursusinschrijvingen per gebruiker
- Activiteitenstroom (stream items): recente activiteit van een gebruiker

**Assignments** (`/api/v1/courses/:id/assignments`)

- Opdrachten ophalen, aanmaken, wijzigen
- Submissions en beoordelingen
- Due dates en overrides

**Modules** (`/api/v1/courses/:id/modules`)

- Module-items ophalen (de structuur van een cursus)
- Module-voortgang per student

**Analytics** (`/api/v1/courses/:id/analytics`)

- Participatiedata per dag
- Page views per student
- Submission-statistieken

**Pages** (`/api/v1/courses/:id/pages`)

- Cursuspagina's ophalen en bewerken
- Content van pages lezen

**Calendar Events** (`/api/v1/calendar_events`)

- Agenda-items ophalen en aanmaken

### Wat betekent dit voor ons project?

| Wat we willen                        | Welke API                                 | Haalbaarheid                                                                                      |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Zien waar een student mee bezig is   | Analytics + Submissions                   | Goed - Canvas logt page views en submissions                                                      |
| Cursusinhoud doorzoekbaar maken      | Pages + Modules                           | Goed - alle content is via de API op te halen                                                     |
| Activiteiten loggen                  | Assignments of custom tool                | Gedeeltelijk - we kunnen submissions ophalen maar eigen activiteiten vereisen een eigen datastore |
| Coach-dashboard met studentoverzicht | Users + Enrollments + Analytics           | Goed - we kunnen ingeschreven studenten en hun activiteit ophalen                                 |
| Content op andere manieren aanbieden | Pages (content ophalen) + eigen rendering | Goed - we halen de tekst op en bieden die anders aan                                              |
| Blokkades signaleren                 | Niet native beschikbaar                   | Vereist eigen systeem - Canvas heeft geen concept van "ik loop vast"                              |

### Beperkingen

- **Rate limiting** - Canvas beperkt het aantal API-calls. Bij veel gebruikers tegelijk kan dit een bottleneck worden.
- **Geen real-time** - de API is request-response, geen websockets. Voor live-updates moet je pollen of Canvas webhooks gebruiken (beperkt beschikbaar).
- **Privacy/AVG** - we halen studentdata op. Dit moet zorgvuldig gebeuren en gedocumenteerd worden.
- **Niet alles is beschikbaar** - sommige data (zoals gedetailleerde leesactiviteit per pagina) is alleen beschikbaar voor admins.

---

## 3. LTI vs. Canvas API vs. RAG: wanneer wat?

| Scenario | LTI | Canvas API | RAG | Combinatie |
|---|---|---|---|---|
| Tool embedden in Canvas | x | | | |
| Gebruiker identificeren zonder login | x | | | |
| Cursusinhoud ophalen | | x | | |
| Cursusinhoud doorzoekbaar en conversationeel aanbieden | | | x | x (API haalt op, RAG indexeert en ontsluit) |
| Eigen activiteiten loggen | | | | x (LTI voor context, eigen backend voor data) |
| Cijfers terugsturen naar Canvas | x (AGS) | x | | |
| Coach-dashboard bouwen | | x (Users, Analytics) | | x (LTI voor launch, API voor data) |
| Chatbot in Canvas die vragen beantwoordt op basis van cursusinhoud | | | | x (LTI voor embedding, API voor content, RAG voor antwoorden) |
| Blokkades signaleren en nudgen | | | | x (Analytics voor detectie, RAG voor gepersonaliseerde respons) |

De meest waarschijnlijke aanpak is een **combinatie van alle drie**: LTI voor de integratie in Canvas (launch, SSO, context), Canvas API voor het ophalen van data (cursusinhoud, studentactiviteit), en RAG voor het intelligent ontsluiten van die content via een conversatie-interface. Een eigen backend verbindt deze drie lagen en voegt functionaliteit toe die Canvas zelf niet biedt.

---

## 4. Technische randvoorwaarden

- We hebben een **development key** nodig van Fontys/Canvas-beheer (Eric kan dit regelen)
- De tool moet op een **eigen server** draaien (of een cloudservice)
- We moeten voldoen aan **AVG-eisen** bij het verwerken van studentdata
- Canvas bij Fontys draait op de Instructure-hosted versie (niet self-hosted), wat betekent dat we de standaard API en LTI-configuratie kunnen gebruiken

---

## 5. Bestaande libraries en tooling

| Taal | LTI 1.3 library | Canvas API library |
|---|---|---|
| Python | pylti1p3 | canvasapi (UCF Open) |
| Node.js | ltijs | node-canvas-api |
| PHP | packback/lti-1-3-php-library | - |
| .NET | - (handmatig) | - (handmatig) |

De keuze voor technologiestack is nog niet gemaakt - dat is onderdeel van de adviesfase. Dit overzicht dient als input voor die keuze.

---

## 6. RAG (Retrieval Augmented Generation)

### Wat is het?

RAG is een techniek waarbij een taalmodel niet op basis van zijn trainingsdata antwoord geeft, maar op basis van content die op het moment van de vraag wordt opgehaald uit een externe databron. Het model wordt zo gevoed met actuele, domeinspecifieke informatie zonder dat het opnieuw getraind hoeft te worden.

Voor dit project betekent dat: cursusinhoud uit Canvas wordt opgeslagen in een doorzoekbare database. Als een student een vraag stelt, worden de meest relevante stukken content opgehaald en meegegeven aan het taalmodel. Het model antwoordt op basis van die echte cursusinhoud.

### Waarom RAG en niet fine-tuning?

Fine-tuning betekent dat je een bestaand model bijtraint op eigen data. Dat klinkt aantrekkelijk, maar heeft voor dit use case drie grote nadelen:

- **Kosten** - een trainingsrun kost honderden euro's en vereist ML-expertise
- **Statisch** - zodra cursusinhoud verandert, moet je opnieuw trainen
- **Onbetrouwbaar voor feiten** - taalmodellen onthouden feiten niet betrouwbaar via training; ze verzinnen plausibele antwoorden

RAG lost dit op: de content zit in een database die je live kunt updaten. Het model hoeft alleen maar te redeneren over de aangeleverde context.

### Hoe werkt het technisch?

**Stap 1 - Indexeren (eenmalig)**
Canvas-content (pagina's, modules, opdrachten) wordt opgehaald via de REST API. De tekst wordt opgesplitst in kleine stukken ("chunks") en omgezet naar vectoren via een embedding model. Die vectoren worden opgeslagen in een vector database.

**Stap 2 - Ophalen (bij elke vraag)**
De vraag van de student wordt ook omgezet naar een vector. De vector database zoekt de meest gelijkende chunks op - dat zijn de stukken content die semantisch het meest aansluiten bij de vraag.

**Stap 3 - Beantwoorden**
De relevante chunks worden samen met de gespreksgeschiedenis meegegeven in de context van de API-call naar het taalmodel. Het model genereert een antwoord op basis van die echte cursusinhoud.

### Relevantie voor dit project

| Wat we willen | Hoe RAG dat oplost |
|---|---|
| Studenten vinden informatie niet in Canvas | Chatbot zoekt en vat samen op basis van echte content |
| Herhalende vragen aan docenten | Chatbot beantwoordt ze zelfstandig met bronvermelding |
| Content tekstgebaseerd en slecht leesbaar | Chatbot biedt content aan in conversatievorm |
| Cursusinhoud up-to-date houden | Database updaten is voldoende, geen hertraining nodig |

### Technische keuzes (nog te maken in adviesfase)

| Onderdeel | Opties |
|---|---|
| Embedding model | OpenAI text-embedding-3-small, Anthropic, of open source (e.g. sentence-transformers) |
| Vector database | Supabase pgvector (eenvoudig, PostgreSQL-gebaseerd), Pinecone (managed), Chroma (lokaal) |
| Taalmodel | Claude Sonnet via Anthropic API |
| Backend | Node.js of Python als proxy tussen frontend en API |

### Kosten inschatting

De Anthropic API (Claude Sonnet 4.6) kost $3 per miljoen input tokens en $15 per miljoen output tokens. Een gemiddeld studentgesprek van 10 berichten inclusief RAG-context is circa 3.000 tokens. Bij 500 studenten die elk 5 gesprekken per dag voeren: circa €20-30 per dag. Voor een PoC met beperkt testgebruik zijn de kosten verwaarloosbaar - enkele euro's per week.

### Beperkingen

- **AVG** - studentdata wordt verwerkt en opgeslagen. Dit vereist een verwerkersovereenkomst en documentatie.
- **Kwaliteit van chunks** - slecht opgesplitste content leidt tot slechte antwoorden. De chunking-strategie is bepalend voor de kwaliteit.
- **Hallucinaties** - het model kan buiten de aangeleverde context redeneren. Dit vereist een strenge systeem-prompt die het model instrueert alleen op basis van de aangeleverde content te antwoorden.

---

## 8. Conclusie

Dit document heeft drie technische lagen verkend die samen een samenhangende denkrichting vormen voor het project.

**LTI** zorgt dat de tool naadloos in Canvas leeft — studenten hoeven niet apart in te loggen en de tool ontvangt direct de cursuscontext en gebruikersrol.

**Canvas API** levert de data — cursusinhoud, studentactiviteit en voortgang zijn allemaal opvraagbaar via goed gedocumenteerde endpoints.

**RAG** maakt die data intelligent doorzoekbaar — in plaats van studenten door modules te laten navigeren, beantwoordt een chatbot vragen op basis van de echte cursusinhoud.

Deze drie lagen vormen samen een technisch haalbare denkrichting die aansluit bij het kernprobleem. Of dit de juiste oplossingsrichting is, wordt bepaald in de ideation-fase van sprint 2, gevoed door de enquête- en interviewresultaten. Een aanvullend ontwerpprincipe dat in dit project wordt verkend — nudging — is uitgewerkt in een separate literature study.
