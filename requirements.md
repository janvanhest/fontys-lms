Op basis van de domeinanalyse zijn de concepten en entiteiten van het Activity First LMS vastgesteld. Dit document vertaalt die analyse naar concrete eisen: wat moet het systeem kunnen, wanneer is een eis gerealiseerd en welke risico's spelen een rol. De functionele requirements zijn gegroepeerd in epics die de implementatievolgorde bepalen.

---

## **Stakeholders**

|                                           |                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| **Stakeholder**                           | **Belang**                                                               |
| Student (avondopleiding HBO-ICT)          | Activiteiten loggen, beroepstaken koppelen, chatbot raadplegen           |
| Eric Slaats (Digital Transformer, Fontys) | Canvas blijft intact, tool sluit aan op vraaggestuurd onderwijs, nudging |
| Coach                                     | Inzicht in voortgang student zonder handmatig monitoren                  |

---

## **Context van bestaande systemen**

Dit systeem integreert met:

- **Canvas LMS** — bron van gebruikersidentiteit via LTI 1.3, cursusinhoud via REST API
- **Competentietool (HBO-i raamwerk)** — vaste referentiedata voor architectuurlagen, activiteiten en beheersingsniveaus; Fontys-implementatie van het HBO-i raamwerk
- **Portflow** — voorbeeld van LTI Global Navigation Placement bij Fontys (integratieparadigma)
- **Anthropic API** — taalmodel voor chatbot

---

## **Functionele requirements**

### **FR-01 — Activiteit aanmaken**

Het systeem stelt een student in staat een activiteit aan te maken met een type, omschrijving, datum en koppeling aan een actieve challenge.  
**Acceptatiecriteria:**

- Een activiteit heeft een verplicht type uit de enum: CHALLENGE, OPDRACHT, WORKSHOP, COMPETENTIE, EIGEN
- Een activiteit is altijd gekoppeld aan één challenge
- Een activiteit zonder type of challenge wordt geweigerd met een foutmelding

---

### **FR-02 — Beroepstaak koppelen aan activiteit**

Het systeem stelt een student in staat een beroepstaak te koppelen aan een activiteit, met een status (gesuggereerd of bevestigd) en een optionele toelichting.  
**Acceptatiecriteria:**

- Een koppeling verwijst naar een geldige beroepstaak (architectuurlaag + activiteit + niveau)
- Status gesuggereerd mag zonder toelichting worden opgeslagen
- Status bevestigd vereist een toelichting van minimaal één zin
- Een activiteit mag meerdere beroepstaakkoppelingen hebben

---

### **FR-03 — Challenge aanmaken en beheren**

Het systeem stelt een student in staat een challenge aan te maken, te activeren en af te ronden.  
**Acceptatiecriteria:**

- Een challenge heeft een titel, beschrijving en status (concept, actief, afgerond)
- Een student heeft maximaal één challenge met status actief tegelijk
- Een afgeronde challenge kan niet opnieuw worden geactiveerd

---

### **FR-04 — Chatbot raadplegen**

Het systeem stelt een student in staat een vraag te stellen aan de chatbot, die antwoord geeft op basis van cursusinhoud en de studentcontext.  
**Acceptatiecriteria:**

- De chatbot heeft toegang tot de actieve challenge, recente activiteiten en gekoppelde beroepstaken van de student
- Antwoorden zijn gebaseerd op geïndexeerde cursusinhoud (RAG) en studentcontext
- De chatbot antwoordt binnen 10 seconden onder normale omstandigheden

---

### **FR-05a — Studentprofiel via mock-authenticatie (PoC)**

Het systeem injecteert bij elke request een hardcoded studentprofiel via een MockAuthGuard, zodat de PoC zonder Canvas-koppeling kan draaien.  
**Acceptatiecriteria:**

- MockAuthGuard injecteert naam, email en student-id bij elke request
- Een student hoeft niet apart in te loggen
- De guard heeft dezelfde interface als de productie LtiAuthGuard zodat de swap later zonder andere codewijzigingen kan

---

### **FR-05b — Studentprofiel via LTI 1.3 (productie)**

Het systeem haalt de gebruikersidentiteit op via LTI 1.3 bij elke launch vanuit Canvas.  
**Acceptatiecriteria:**

- Naam, email en Canvas-gebruikers-id worden opgeslagen bij eerste launch
- LTI JWT wordt gevalideerd met de Canvas public key
- Bij herhaalde launch wordt het bestaande profiel opgehaald, niet opnieuw aangemaakt

---

### **FR-06 — Activiteitenoverzicht bekijken**

Het systeem toont een student een chronologisch overzicht van zijn gelogde activiteiten, gegroepeerd per challenge.  
**Acceptatiecriteria:**

- Overzicht toont type, omschrijving, datum en eventuele beroepstaakkoppelingen per activiteit
- Overzicht is filterbaar op challenge
- Activiteiten zonder beroepstaakkoppeling zijn visueel onderscheidbaar

---

### **FR-07 — Beroepstaaksuggestie ontvangen**

Het systeem suggereert automatisch een of meer beroepstaken na het aanmaken van een activiteit, op basis van het activiteitstype en de actieve challenge.  
**Acceptatiecriteria:**

- Suggestie bevat architectuurlaag, activiteit en beheersingsniveau
- Student kan een suggestie bevestigen (met toelichting) of afwijzen
- Afwijzen verwijdert de suggestie zonder verdere actie
- Suggestie wordt niet gegenereerd als er geen actieve challenge is

---

### **FR-08 — Gespreksgeschiedenis bewaren en bekijken**

Het systeem bewaart gespreksgeschiedenis per student en stelt een student in staat eerdere gesprekken te bekijken en voort te zetten.  
**Acceptatiecriteria:**

- Elk gesprek wordt opgeslagen inclusief alle berichten en timestamps
- Gesprekken zijn gesorteerd op datum, meest recent eerst
- Een eerder gesprek kan worden heropend en voortgezet
- Gespreksgeschiedenis is alleen zichtbaar voor de eigen student

---

### **FR-09 — Coach ziet activiteiten van student**

Het systeem toont een coach een overzicht van de activiteiten van zijn studenten.

**Acceptatiecriteria:**

- Coach ziet per student: naam, actieve challenge, aantal gelogde activiteiten
- Coach kan doorklikken naar het activiteitenoverzicht van een individuele student
- Coach ziet alleen studenten die aan hem zijn gekoppeld

---

### **FR-10 — Coach voegt activiteit toe aan student**

Het systeem stelt een coach in staat een activiteit toe te voegen aan de tijdlijn van een student, bijvoorbeeld een aangeboden workshop.

**Acceptatiecriteria:**

- Coach kan een activiteit aanmaken namens een student
- De activiteit is zichtbaar in het overzicht van de student
- De student ontvangt een melding van de toegevoegde activiteit

---

### **FR-11 — Cursusinhoud indexeren**

Het systeem indexeert geselecteerde cursusinhoud in de vector database zodat de chatbot er vragen over kan beantwoorden.

**Acceptatiecriteria:**

- Indexering wordt uitgevoerd via een seed-taak, niet automatisch bij elke launch
- Geïndexeerde inhoud bevat een bron-label (bijv. titel van de Canvas-pagina)
- Herindexeren overschrijft bestaande chunks voor dezelfde bron

---

### **FR-12 — Nudge bij inactiviteit**

Het systeem attendeert een student wanneer hij langere tijd geen activiteiten heeft gelogd.

**Acceptatiecriteria:**

- Nudge verschijnt na X dagen inactiviteit (standaard: 7 dagen, instelbaar)
- Nudge is zichtbaar bij het openen van de applicatie, niet als externe notificatie
- Student kan een nudge wegklikken zonder verdere actie

---

### **FR-13 — Streaming via SSE**

Het systeem ondersteunt streaming van chatbot-antwoorden via Server-Sent Events zodat de student direct feedback krijgt in plaats van te wachten op een volledig antwoord.

**Acceptatiecriteria:**

- Een `POST /chat/stream` endpoint stuurt antwoorden als SSE-stream
- De stream stuurt event-types: `status`, `tool_call`, `tool_result`, `final`, `error`
- SSE-headers worden correct gezet: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- De synchrone en streaming-variant delen dezelfde businesslogica

---

### **FR-14 — Hybride redeneren**

De chatbot combineert zelfstandig RAG (statische cursusinhoud) en tool use (dynamische studentdata) in één antwoord, gestuurd door de system prompt.

**Acceptatiecriteria:**

- De system prompt instrueert het model: eerst definitie ophalen via RAG, dan studentdata via tool use, dan combineren
- Tool-aanroepen verlopen in een iteratieve lus van maximaal 6 iteraties
- Tool-aanroepen en resultaten worden bijgehouden als trace en meegestuurd in de response
- Het model combineert beide bronnen zonder expliciete instructie van de student

---

### **FR-15 — Info endpoint**

Een GET /info endpoint geeft inzicht in de draaiende stack, beschikbare tools en actieve configuratie. Bedoeld voor debugging en demos.

**Acceptatiecriteria:**

- Endpoint retourneert: stackinformatie (modellen, database), live counts per tabel, actieve system prompt en beschikbare tool-definities
- Bereikbaar zonder authenticatie in development-mode

---

### **NFR-01 — Performance**

Het systeem reageert op gebruikersacties binnen aanvaardbare tijd.

**Acceptatiecriteria:**

- REST-endpoints (activiteiten, challenges, profiel) responderen binnen 500ms
- Chatbot genereert een eerste token binnen 3 seconden
- Vectorzoekopdrachten (RAG retrieval) worden uitgevoerd binnen 1 seconde

---

### **NFR-02 — Privacy (AVG)**

Het systeem verwerkt persoonsgegevens van studenten conform de AVG.

**Acceptatiecriteria:**

- Embeddings worden lokaal gegenereerd via Ollama voor de PoC — geen studentdata naar externe embedding-API's; bij overgang naar productie een embedding-provider kiezen met verwerkersovereenkomst
- Gespreksgeschiedenis wordt alleen opgeslagen voor de eigen student, niet gedeeld
- Studentdata wordt niet opgenomen in URL-parameters of querystrings
- Voor productie: verwerkersovereenkomst met Anthropic vereist voor chatgeneratie én met embedding-provider vereist voor RAG (buiten PoC-scope, wel gedocumenteerd als risico)

---

### **NFR-03 — Security**

Het systeem is uitsluitend toegankelijk via geldige authenticatie.

**Acceptatiecriteria:**

- Alle API-endpoints vereisen een geldig sessie-token (MockAuthGuard voor PoC, LtiAuthGuard voor productie)
- LTI JWT wordt gevalideerd met de Canvas public key (productie)
- Geen endpoints zijn publiek toegankelijk zonder authenticatie, met uitzondering van diagnostische endpoints (zoals `GET /info`) in development-mode

---

### **NFR-04 — Duurzaamheid**

Het systeem minimaliseert onnodige externe API-aanroepen.

**Acceptatiecriteria:**

- Embeddings worden lokaal gegenereerd (Ollama) — geen kosten of externe afhankelijkheid voor indexering
- Cursusinhoud wordt eenmalig geïndexeerd, niet bij elke chatbotaanroep opnieuw opgehaald
- Anthropic API wordt alleen aangeroepen bij een daadwerkelijke chatvraag

---

### **NFR-05 — Toegankelijkheid**

De interface is bruikbaar voor avondstudenten op uiteenlopende apparaten.

**Acceptatiecriteria:**

- De applicatie is bruikbaar op een modern mobiel apparaat (responsive layout)
- Kleurcontrast voldoet aan WCAG 2.1 AA
- Formulieren zijn bedienbaar via toetsenbord

---

### **NFR-06 — API-documentatie**

Alle endpoints zijn gedocumenteerd via Swagger.

**Acceptatiecriteria:**

- Swagger UI bereikbaar op `/api`
- Alle request/response DTO's zijn geannoteerd
- Endpoints zijn gegroepeerd per module

---

### **NFR-07 — Foutafhandeling**

Het systeem vangt fouten op een voorspelbare manier af.

**Acceptatiecriteria:**

- Embedding service gooit een duidelijke fout als Ollama niet bereikbaar is
- Chat service vangt fouten tijdens tool-uitvoering op en stuurt een `error` event via SSE
- Bij te veel tool-iteraties wordt een leesbaar fallback-antwoord teruggegeven
- Applicatie start niet zonder `ANTHROPIC_API_KEY`

---

### **NFR-08 — Configuratie**

Alle externe afhankelijkheden worden geconfigureerd via environment variables.

**Acceptatiecriteria:**

- Een `.env.example` beschrijft alle vereiste variabelen
- Geen hardcoded credentials in de codebase
- Lokale Ollama-toegang vanuit Docker via `host.docker.internal`

---

## **Risicoanalyse (top 3)**

|       |                                                                |          |            |                                                                                    |
| ----- | -------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------- |
| **#** | **Risico**                                                     | **Kans** | **Impact** | **Mitigatie**                                                                      |
| R1    | Anthropic API-kosten lopen op bij intensief testgebruik        | Laag     | Middel     | Gebruikslimiet instellen via Anthropic dashboard; PoC beperkt tot kleine testgroep |
| R2    | Studentdata lekt via chatbot-antwoorden naar andere gebruikers | Laag     | Hoog       | Sessie-isolatie per student afdwingen; gespreksgeschiedenis nooit gedeeld          |
| R3    | LTI-configuratie bij Fontys Canvas vereist beheerderstoegang   | Middel   | Hoog       | Eric Slaats heeft developer keys toegezegd; tijdig afstemmen voor sprint 3         |

---

## **MoSCoW — PoC scope**

|        |                                          |            |                                                                                   |
| ------ | ---------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| **FR** | **Requirement**                          | **MoSCoW** | **Reden**                                                                         |
| FR-01  | Activiteit aanmaken                      | Must       | Kern van het systeem — zonder dit geen data                                       |
| FR-02  | Beroepstaak koppelen                     | Must       | Primaire waarde voor student — competentiekoppeling                               |
| FR-03  | Challenge aanmaken en beheren            | Must       | Context voor activiteiten — zonder challenge geen activiteit                      |
| FR-04  | Chatbot raadplegen                       | Must       | Kern van Concept D — RAG + studentcontext                                         |
| FR-05a | Studentprofiel via mock-auth             | Must       | Toegangspoort voor PoC — MockAuthGuard zonder Canvas-koppeling                    |
| FR-05b | Studentprofiel via LTI 1.3               | Won't      | Productie-implementatie — buiten PoC-scope                                        |
| FR-06  | Activiteitenoverzicht                    | Must       | Student moet zien wat hij gelogd heeft                                            |
| FR-07  | Beroepstaaksuggestie                     | Should     | Waardevol maar chatbot kan dit deels overnemen                                    |
| FR-08  | Gespreksgeschiedenis bewaren en bekijken | Must       | Bewaren is vereist voor chatbot-context; tonen hoort bij dezelfde functionaliteit |
| FR-09  | Coach ziet studenten                     | Could      | Coach buiten PoC-scope volgens C4 Level 1                                         |
| FR-10  | Coach voegt activiteit toe               | Could      | Afhankelijk van FR-09                                                             |
| FR-11  | Cursusinhoud indexeren                   | Must       | RAG werkt niet zonder geïndexeerde inhoud                                         |
| FR-12  | Nudge bij inactiviteit                   | Won't      | Waardevol concept, te vroeg voor PoC                                              |
| FR-13  | Streaming via SSE                        | Must       | Chatbot zonder streaming voelt traag — directe feedback essentieel                |
| FR-14  | Hybride redeneren                        | Must       | Kern van Concept D — RAG + tool use in één antwoord                               |
| FR-15  | Info endpoint                            | Could      | Handig voor demos en debugging, niet blokkerend                                   |

---

# **Epics**

**Project:** Activity First LMS

**Student:** Jan van Hest | Semester 6 | HBO-ICT Open Learning | Fontys

**Sprint:** 3

**Basis:** Must-requirements (FR-01, FR-02, FR-03, FR-04, FR-05a, FR-06, FR-08, FR-11, FR-13, FR-14)

---

## **Overzicht**

|          |                        |              |
| -------- | ---------------------- | ------------ |
| **Epic** | **Naam**               | **FR's**     |
| E-01     | Toegang via Canvas     | FR-05        |
| E-02     | Challenge beheren      | FR-03        |
| E-03     | Activiteiten bijhouden | FR-01, FR-06 |
| E-04     | Beroepstaken koppelen  | FR-02        |
| E-05     | Chatbot met context    | FR-04, FR-11 |

---

## **E-01 — Toegang via mock-authenticatie (PoC)**

Een student opent de applicatie en wordt automatisch herkend via de MockAuthGuard. Geen apart inloggen, geen Canvas-koppeling voor de PoC.

**FR's:** FR-05a

**Afhankelijkheden:** geen

---

## **E-02 — Challenge beheren**

Een student maakt een challenge aan, activeert hem en rondt hem af. De actieve challenge vormt de context voor alle activiteiten en de chatbot.

**FR's:** FR-03

**Afhankelijkheden:** E-01

---

## **E-03 — Activiteiten bijhouden**

Een student logt wat hij heeft gedaan — een workshop gevolgd, een opdracht geschreven, aan zijn challenge gewerkt. Hij ziet een overzicht van alles wat hij gelogd heeft.

**FR's:** FR-01, FR-06

**Afhankelijkheden:** E-01, E-02

---

## **E-04 — Beroepstaken koppelen**

Een student koppelt een beroepstaak aan een activiteit en legt vast wat hij daarmee aantoont. De koppeling verwijst naar een specifieke combinatie van architectuurlaag, activiteit en beheersingsniveau uit het HBO-i raamwerk.

**FR's:** FR-02

**Afhankelijkheden:** E-03, HBO-i referentiedata geladen

---

## **E-05 — Chatbot met context**

Een student stelt een vraag aan de chatbot. De chatbot weet aan welke challenge de student werkt, welke activiteiten hij heeft gelogd en welke beroepstaken hij nastreeft. Antwoorden worden gestreamd en zijn gebaseerd op geïndexeerde cursusinhoud gecombineerd met dynamische studentdata.

**FR's:** FR-04, FR-08, FR-11, FR-13, FR-14

**Afhankelijkheden:** E-01, E-02, E-03, cursusinhoud geïndexeerd

---

## **Volgorde van implementatie**

```

E-01 → E-02 → E-03 → E-04

↘

E-05

```

E-05 heeft alle voorgaande epics nodig voor een zinvolle studentcontext. E-04 en E-05 kunnen parallel lopen zodra E-03 klaar is.
