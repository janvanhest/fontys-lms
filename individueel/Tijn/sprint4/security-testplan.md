# Security Testplan en Dreigingsanalyse - Activity First LMS Chatbot

**Versie:** 0.2 (concept, ter validatie)
**Datum:** 2026-06-07
**Auteur:** Tijn Knaap
**Begeleiding:** Marc (infra-expert)
**Status:** Concept. 

---

## 1. Doel en aanleiding

Ik voer een security-analyse uit op onze LMS-chatbot PoC. Ik benader het als een red team: ik zoek actief naar zwakke plekken in plaats van af te wachten. Het resultaat is een **adviesrapport** met bevindingen en aanbevelingen.

Belangrijk: het blijft bij **analyse en advies**. We gaan niks fixen in deze fase.

Bewuste keuze in deze versie: ik focus op de **chatbot zelf**, niet op de infrastructuur eromheen. De reden is methodisch. Dit is een PoC, en dan is het zinloos om de afwezigheid van productie-hardening (geen TLS, geen rate limiting, geen echte auth) als bevinding op te schrijven. Dat is een bekende, bewuste vereenvoudiging. Interessant en waardevol is wat ze wél gebouwd hebben en waar het ontwerp daarvan kan falen. Bij een chatbot zit dat in hoe het model omgaat met niet-vertrouwde invoer en hoe het zijn tools gebruikt.

Hoofdstuk 5 en 6 vormen straks ook de eerste hoofdstukken van het adviesrapport, dus dit werk is geen wegwerp-voorwerk.

## 2. Scope

### In scope (de chatbot-laag)

- Het LLM-gedrag: hoe de chatbot omgaat met niet-vertrouwde invoer, direct en via opgeslagen data.
- De tools en de agent-loop: function calling, `perform_ui_action`, `search_activities`, de RAG-zoektool.
- De dataflows die niet-vertrouwde inhoud het model in brengen (activiteiten van de student, de RAG-corpus).
- De afhandeling van de model-output in de frontend.
- De externe Anthropic-afhankelijkheid, voor zover het beschikbaarheid en kosten raakt.

### Buiten scope

- De bekende PoC-vereenvoudigingen in de infrastructuur (zie hoofdstuk 7, daar benoem ik ze bewust in plaats van ze te testen).
- Productieomgevingen of systemen van Fontys of Canvas.
- Data of accounts van echte gebruikers.
- Het daadwerkelijk oplossen van bevindingen.

## 3. Kwaliteitseisen

De leidende eis is **security**. Voor een chatbot betekent dat vooral:

- **Integriteit van gedrag:** kan invoer (van de gebruiker of uit opgeslagen data) het gedrag van de bot kapen?
- **Beschikbaarheid en kostenbeheersing:** de bot leunt op een betaalde externe dienst (Anthropic). Misbruik kan de dienst duur maken of platleggen.
- **Vertrouwelijkheid:** lekt de bot dingen die niet bedoeld zijn (systeemprompt, interne instructies, data van een andere context)?

## 4. Aanpak en methodes

Ik werk volgens erkende standaardmethodes, zodat de analyse navolgbaar en herhaalbaar is.


| Methode                                      | Waarvoor                                 | Waarom deze                                                                                                                               |
| -------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **OWASP Top 10 for LLM Applications (2025)** | de kern: de chatbot/AI-dreigingen        | de de-facto standaard voor LLM-toepassingen, dekt prompt injection, excessive agency en output-handling die een gewone web-checklist mist |
| **STRIDE** (threat modeling)                 | de dreigingen per onderdeel structureren | standaard en simpel; geeft de zes hoofdcategorieën als kapstok                                                                            |
| **OWASP API Security Top 10 (2023)**         | alleen waar de API de chatbot voedt      | onze backend is een API; ik gebruik deze lijst gericht op de paden die het model voeden, niet als losse API-audit                         |
| **Risicomatrix (kans x impact)**             | bevindingen prioriteren                  | eenvoudige, uitlegbare scoring die direct het advies voedt                                                                                |


De overkoepelende volgorde (scoping, dreigingsanalyse, testen, rapporteren) volgt de gangbare pentest-fasering. Scope en spelregels stem ik vooraf af met Marc.

## 5. Systeemoverzicht en aanvalsoppervlakte

De stack als context. Het echte zwaartepunt ligt op de dataflows naar en van het model (trust boundary B5 hieronder).


| Service             | Poort  | Rol in de chatbot                              |
| ------------------- | ------ | ---------------------------------------------- |
| backend (NestJS)    | 3000   | host van de chatbot, tools, agent-loop         |
| frontend (Vite)     | 5173   | rendert de chat-output (`react-markdown`)      |
| postgres (pgvector) | 5432   | studentdata, gespreksgeschiedenis, vectoren    |
| ollama              | 11434  | embeddings voor de RAG-zoektool                |
| Anthropic API       | extern | het taalmodel (betaalde dienst, key in `.env`) |


**De dataflows die ertoe doen:**

- Gebruikersbericht gaat rechtstreeks het model in.
- Activiteiten van de student: aan te maken via `POST /activities` (vrije tekst), komen via `search_activities` terug het model in.
- RAG-corpus: geseed uit `canvas_content` (read-only gemount), komt via `search_course_content` het model in. Niet door de gebruiker te schrijven.
- Model naar tools: `perform_ui_action` (UI-event), `search_activities` en `get_student_competences` (server-side gescoped op de student-id).
- Model-output gaat naar de frontend en wordt als markdown gerenderd.

**Trust boundaries:**

- B1: client naar backend.
- B2: backend naar de externe Anthropic API.
- B3: backend naar de datastores.
- **B5: de LLM-contextgrens.** Hier komen gebruikersinvoer en opgehaalde data samen het model in, en het model kan tools aanroepen. Dit is het hart van de analyse.

**Geverifieerde config-feiten (context, bewust buiten scope, zie hoofdstuk 7):** geen echte auth (`MOCK_AUTH`), geen rate limiting, geen max berichtlengte, open Swagger, poorten op 0.0.0.0, geen TLS.

## 6. Dreigingsanalyse en testcase-checklist

Elke regel is een hypothese die ik toets. Bijna alles is **actief** en kost LLM-calls, dus dit deel start pas na akkoord van Marc.


| #   | Dreiging / hypothese                                           | STRIDE                 | OWASP LLM                      | Hoe ik het toets                                                                                                                                                          | Verwachting (te bevestigen)                                                                                                                         | Status  |
| --- | -------------------------------------------------------------- | ---------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | **Indirect/stored prompt injection via activiteiten** (de kop) | Tampering              | LLM01                          | activiteit aanmaken met instructies in titel/omschrijving, dan de bot ernaar vragen; `search_activities` voert het het model in                                           | Hoog. Echte keten, bereikbaar door een gewone gebruiker, ontstaat door het ontwerp                                                                  | Te doen |
| 2   | Direct prompt injection en jailbreak                           | Information disclosure | LLM01, LLM07                   | model vragen zijn systeemprompt of tooldefinities te lekken, instructies te overschrijven, de domeingrens te omzeilen (bot als gratis algemene assistent op de schoolkey) | Midden-hoog. Toetst of de guardrails in de prompt houden                                                                                            | Te doen |
| 3   | Excessive agency / tool-sturing                                | Elevation of privilege | LLM06                          | via injectie `perform_ui_action` ongevraagd laten afvuren                                                                                                                 | Vuln reëel, impact nu laag (alleen paneel openen of activiteit highlighten, cosmetisch). Frame als ontwerp-risico zodra er zwaardere tools bijkomen | Te doen |
| 4   | LLM kosten- en resourcemisbruik (denial of wallet)             | Denial of service      | LLM Unbounded Consumption      | meten hoeveel één gemaakte request kost via de zes-staps tool-loop plus onbegrensde input; proberen de bot in een lus te duwen                                            | Midden. Chatbot-specifiek, raakt beschikbaarheid en kosten (de infra-haak)                                                                          | Te doen |
| 5   | Onveilige output-afhandeling                                   | Tampering              | LLM "Improper Output Handling" | bot rare of kwaadaardige output laten genereren, checken of de frontend saniteert                                                                                         | Laag, waarschijnlijk goed gedaan (zie hieronder). Snel te bevestigen                                                                                | Te doen |


**Te verifiëren sterke punten (meld ook wat klopt):**

- `get_student_competences` en `search_activities` worden server-side aangeroepen met de student-id uit de context, niet uit model-input. Het model kan ze dus niet omleiden naar een andere student. Bevestigen dat dit echt zo werkt.
- De chat rendert met `react-markdown` plus `remark-gfm`, zonder `rehype-raw`. Rauwe HTML wordt dus niet uitgevoerd, wat injectie-XSS via de output by design tegenhoudt. Bevestigen door te proberen een `<script>` of een `javascript:`-link via de bot te laten renderen.

**Snelle passieve check (geen PoC-open-deur, want een gelekte key is een echt incident):** staat de Anthropic API-key per ongeluk in de git-history of in de frontend-bundle? Met `gitleaks` en de browser-devtools.

## 7. Bewust buiten scope: bekende PoC-beperkingen

De volgende punten heb ik gezien en bewust niet getest, omdat het bekende en geaccepteerde vereenvoudigingen van een PoC zijn. Ze als bevinding opschrijven zou geen waarde toevoegen:

- Geen echte authenticatie (`MOCK_AUTH` met een hardcoded demo-student).
- Geen rollen of goedkeuringsmodel (een student kan zijn eigen behaalde niveau zetten).
- Geen rate limiting en geen maximale berichtlengte op de API.
- Open Swagger op `/api`, geen security-headers.
- Alle poorten op 0.0.0.0, geen TLS, datastores bereikbaar op het netwerk.

Mocht het product richting productie gaan, dan horen deze alsnog opgepakt te worden. Voor nu vallen ze buiten scope.

## 8. Risicoscoring

Ik scoor elke bevestigde bevinding op **kans** en **impact**, elk laag, midden of hoog. De combinatie geeft het risico.


| Kans \ Impact | Laag   | Midden | Hoog    |
| ------------- | ------ | ------ | ------- |
| **Hoog**      | Midden | Hoog   | Kritiek |
| **Midden**    | Laag   | Midden | Hoog    |
| **Laag**      | Laag   | Laag   | Midden  |


Het advies prioriteer ik op deze score: kritiek en hoog eerst.

## 9. Rules of engagement

- Alleen de lokale dev-stack op mijn eigen machine. Geen productie, geen Fontys- of Canvas-systemen, geen data van echte gebruikers.
- Alleen analyse en advies. Geen fixes en geen blijvende wijzigingen aan de codebase.
- Data die ik via een test aanpas (zoals een aangemaakte activiteit) ruim ik daarna op of zet ik terug via een reset.
- De kosten-test (#4) beperk ik tot een klein aantal verzoeken (richtlijn: maximaal tien), puur om aan te tonen dat de rem ontbreekt. Het doel is niet de API-key leegtrekken.
- Ik test in een afgestemd tijdvenster en laat het team weten wanneer, omdat we de codebase delen.
- Geautoriseerd door Marc en het team. Dit document is de afstemming.

## 10. Planning en fasering

- **Fase 0:** dit plan opstellen en valideren met Marc. (nu)
- **Fase 1:** voorbereiding, laag risico: dataflows en code lezen, de output-handling bevestigen, de key-leak check. Kan al starten.
- **Fase 2:** de actieve chatbot-tests (#1 tot en met #4). Pas na akkoord van Marc, want ze kosten LLM-calls.
- **Fase 3:** bevindingen scoren met de risicomatrix en het adviesrapport schrijven.

## 11. Op te leveren resultaat

Een adviesrapport (security-assessment) met:

1. Inleiding, scope en aanpak (de standaardmethodes en het waarom, inclusief de bewuste afbakening op de chatbot).
2. Systeemoverzicht en aanvalsoppervlakte (dit document, hoofdstuk 5 en 6).
3. Bevindingen: per stuk een omschrijving, reproduceerstappen, bewijs, STRIDE- en OWASP-categorie, en het risico. Inclusief de bevestigde sterke punten.
4. Advies en aanbevelingen, geprioriteerd op risico.
5. Conclusie met de top-risico's.

---

## Competentieverantwoording

**Infrastructure (Infrastructure) - Analyse - Niveau 1**

In dit testplan analyseer ik de security van onze LMS-chatbot volgens standaardmethodes: STRIDE voor het structureren van de dreigingen, de OWASP Top 10 for LLM Applications als checklist voor de AI-specifieke risico's en een risicomatrix voor de prioritering. Ik heb het systeem in kaart gebracht (services, dataflows en trust boundaries) en daaruit vijf concrete dreigingshypotheses afgeleid, elk met een toetsbare testcase. De kwaliteitseis security is daarbij leidend. Dit sluit aan op Analyse niveau 1: ik analyseer een eenvoudige infrastructuur en de bijbehorende security threats volgens een standaardmethode, binnen een voorspelbare context (onze eigen PoC-stack) en met begeleiding van een infra-expert (Marc). Het resultaat is een afgebakend en geautoriseerd plan dat direct de basis vormt voor het security-adviesrapport.