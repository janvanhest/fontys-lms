# Canvas API & LTI - Technische verkenning

**Sprint 1 | Infrastructuur – Analyseren – Niveau 1**
**Datum:** 15 maart 2026

**DOT-methodes:**
- Literature study (Library): Canvas API-documentatie en LTI 1.3-specificaties bestudeerd
- Available product analysis (Library): bestaande LTI- en Canvas API-libraries per taal vergeleken


## Inleiding

Dit document beschrijft hoe de Canvas REST API en het LTI-protocol technisch werken, welke mogelijkheden en beperkingen ze bieden, en wat dit betekent voor ons prototype. De centrale vraag is: wat kunnen we realisereren via Canvas-integratie, en waar zitten de grenzen?


## 1. Canvas REST API

### 1.1 Basisstructuur

Alle API-aanroepen gaan over HTTPS naar het Canvas-domein van de instelling. Voor Fontys ziet dat er als volgt uit:

```
https://fontys.instructure.com/api/v1/
```

Naast de productieomgeving zijn er twee extra omgevingen:

| Omgeving | URL | Doel |
|----------|-----|------|
| Productie | `fontys.instructure.com` | Live omgeving |
| Beta | `fontys.beta.instructure.com` | Preview van nieuwe Canvas-versies, reset elke zaterdag |
| Test | `fontys.test.instructure.com` | Stabiele kopie van productie, bruikbaar voor integratieontwikkeling |

Voor ontwikkeling is de testomgeving het meest geschikt, omdat die stabiel blijft en niet wekelijks wordt gereset.


### 1.2 Authenticatie

Er zijn twee manieren om te authenticeren:

**A. Persoonlijk toegangstoken (voor ontwikkeling en prototyping)**

Elke Canvas-gebruiker kan in zijn profiel een persoonlijk token aanmaken. Dit token wordt meegestuurd in de `Authorization`-header:

```
Authorization: Bearer <JOUW-TOKEN>
```

Dit werkt goed voor persoonlijk prototype-gebruik, maar Instructure's API-beleid verbiedt het opvragen van tokens namens andere gebruikers. Het kan dus niet als oplossing voor een multi-user applicatie.

**B. OAuth2 (voor applicaties die namens meerdere gebruikers werken)**

Voor een echte applicatie is OAuth2 vereist. Het werkt via drie stappen:

**Stap 1** - Stuur de gebruiker naar Canvas:
```
GET https://fontys.instructure.com/login/oauth2/auth
  ?client_id=XXX
  &response_type=code
  &state=CSRF-TOKEN
  &redirect_uri=https://jouw-app.nl/callback
```

**Stap 2** - Canvas stuurt een autorisatiecode terug:
```
https://jouw-app.nl/callback?code=XXX&state=CSRF-TOKEN
```

**Stap 3** - Wissel de code server-side in voor een toegangstoken:
```
POST /login/oauth2/token
  grant_type=authorization_code
  client_id=XXX
  client_secret=YYY
  code=ZZZ
```

Dit geeft een access token terug (geldig 1 uur) plus een refresh token voor verlenging.

**Developer Key vereist:** OAuth2 werkt alleen met een Developer Key (client_id + client_secret), die door een Canvas-beheerder bij Fontys aangemaakt moet worden. Dit is een praktische afhankelijkheid: zonder medewerking van de Canvas-beheerder kun je geen OAuth2-applicatie registreren.


### 1.3 Relevante API-endpoints

Hieronder de endpoints die het meest relevant zijn voor een studentgericht prototype:

**Cursussen en voortgang**

| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/v1/courses` | Alle cursussen van de ingelogde student |
| GET | `/api/v1/courses/:id/users/:user_id/progress` | Voortgang van een student in een cursus |
| GET | `/api/v1/courses/:id/todo` | Openstaande taken en deadlines |
| GET | `/api/v1/courses/:id/activity_stream` | Activiteitenstream van de student |

**Inschrijvingen en cijfers**

| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/v1/courses/:id/enrollments` | Inschrijvingen met cijfergegevens |
| GET | `/api/v1/users/:user_id/enrollments` | Alle inschrijvingen van een gebruiker |

Een enrollment-object bevat een `grades`-object:
```json
{
  "current_grade": "B+",
  "current_score": 87.5,
  "final_grade": "B",
  "final_score": 83.2
}
```

**Opdrachten en inleveringen**

| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/v1/courses/:id/assignments` | Lijst van opdrachten, gesorteerd op deadline |
| GET | `/api/v1/courses/:id/students/submissions` | Alle inleveringen van een student in een cursus |

Een inlevering (`submission`) bevat:
- `workflow_state`: `submitted`, `unsubmitted`, `graded`, `pending_review`
- `late`, `missing`, `excused` (booleans)
- `score`, `grade`, `submitted_at`

**Modules (leerpad)**

| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/v1/courses/:id/modules` | Alle modules met optionele voortgang per student |
| GET | `/api/v1/courses/:id/modules/:id/items` | Items in een module |
| PUT | `/api/v1/courses/:id/modules/:id/items/:id/done` | Item markeren als afgerond |
| GET | `/api/v1/courses/:id/module_item_sequence` | Vorig/volgend item in de volgorde |

Met de parameter `include[]=items,content_details` en `student_id=X` geeft de modules-endpoint ook de voltooiingsstatus per student terug. Voortgangstypen zijn: `must_view`, `must_submit`, `min_score`, `must_mark_done`.


### 1.4 Rate limiting en paginering

**Rate limiting**

Canvas gebruikt een "leaky bucket"-algoritme. Elk verzoek geeft in de response-headers terug hoeveel quota is verbruikt:

```
X-Request-Cost: 1
X-Rate-Limit-Remaining: 498
```

Bij overschrijding krijg je `HTTP 429 Too Many Requests`. Parallelle verzoeken verbruiken meer quota dan sequentiële verzoeken. Implementeer altijd retry-logica met exponential backoff.

**Paginering**

De standaard paginagrootte is 10 items. Gebruik `?per_page=100` voor meer resultaten per pagina. Canvas geeft in de `Link`-responseheader links mee naar de volgende en vorige pagina:

```
Link: <https://...?page=2&per_page=100>; rel="next", <https://...?page=1>; rel="first"
```

Behandel deze URL's als ondoorzichtig - bouw ze niet zelf na. Controleer altijd of er een volgende pagina is, ook als je veel resultaten per pagina opvraagt.


## 2. LTI - Learning Tools Interoperability

### 2.1 Wat is LTI?

LTI is een open standaard van IMS Global (nu 1EdTech) voor het veilig starten van externe tools vanuit een LMS. Zonder LTI moet een gebruiker apart inloggen op elk extern systeem. Met LTI kan het LMS de identiteit van de gebruiker, de cursuscontext en de rol direct meegeven aan de externe tool - single sign-on zonder dat de gebruiker iets merkt.

**Terminologie:**
- In LTI 1.1: het LMS heet "Tool Consumer", de externe tool heet "Tool Provider"
- In LTI 1.3: het LMS heet "Platform", de externe tool heet "Tool"


### 2.2 LTI 1.1 vs LTI 1.3

| Aspect | LTI 1.1 | LTI 1.3 |
|--------|---------|---------|
| Authenticatie | OAuth 1.0a met gedeeld geheim | OIDC + JWT + OAuth 2.0 |
| Berichtformaat | Formulier-POST met handtekening | Gesigneerde JWT |
| Sleutelbeheer | Symmetrisch gedeeld geheim | Asymmetrisch RSA-sleutelpaar |
| Veiligheid | Kwetsbaar voor replay-aanvallen | Nonce- en CSRF-bescherming |
| Services | Alleen basiscijferterugkoppeling | Volledige LTI Advantage services |

LTI 1.1 is nog steeds ondersteund, maar wordt uitgefaseerd. Nieuwe tools moeten LTI 1.3 gebruiken.


### 2.3 LTI 1.3 authenticatie: het OIDC-startproces

LTI 1.3 gebruikt OpenID Connect (OIDC), een identiteitslaag bovenop OAuth 2.0. Het verloopt in vier stappen:

**Stap 1 - Startinitiatief (Canvas naar Tool)**

Canvas stuurt een verzoek naar het `oidc_initiation_url`-endpoint van de tool:
```
iss=https://canvas.instructure.com
login_hint=<opaque waarde>
target_link_uri=<URL van de resource>
client_id=<developer key ID>
deployment_id=<deployment-ID>
```

**Stap 2 - Authenticatieverzoek (Tool naar Canvas, browseromleiding)**

De tool valideert `iss` en `client_id`, genereert een `state` (CSRF-token) en een `nonce`, en stuurt de browser door naar Canvas:
```
GET https://sso.canvaslms.com/api/lti/authorize_redirect
  ?client_id=XXX
  &login_hint=<waarde uit stap 1>
  &state=<CSRF-token>
  &nonce=<unieke waarde>
  &response_type=id_token
  &scope=openid
  &response_mode=form_post
```

Dit moet een browseromleiding zijn (geen server-naar-server verzoek) zodat Canvas de gebruikerssessie kan controleren.

**Stap 3 - Authenticatierespons (Canvas naar Tool)**

Canvas POST een JWT naar het `redirect_uri`-endpoint van de tool:
```
id_token=<gesigneerde JWT>
state=<state uit stap 2>
```

De tool verifieert de JWT-handtekening via Canvas' publieke sleutels:
```
https://sso.canvaslms.com/api/lti/security/jwks
```

**Stap 4 - Resource tonen**

De tool controleert of `state` overeenkomt met de opgeslagen waarde, en toont vervolgens de gevraagde resource.


### 2.4 Inhoud van het LTI JWT

Het JWT bevat standaard OpenID Connect-claims plus LTI-specifieke claims:

**Standaard claims:**
- `iss`: `https://canvas.instructure.com` (de uitgevende partij)
- `aud`: client_id van de tool
- `sub`: een UUID die de gebruiker uniek identificeert per tool
- `exp`: vervaltijdstip (1 uur geldig)
- `nonce`: moet door de tool gecontroleerd worden (replay-aanvalbeveiliging)

**LTI-claims:**
- `message_type`: `LtiResourceLinkRequest` of `LtiDeepLinkingRequest`
- `context`: cursus-ID, naam, type
- `roles`: rol van de gebruiker (bijv. `Learner`, `Instructor`)
- `custom`: vrij te configureren velden (bijv. `$Canvas.user.sisIntegrationId`)


### 2.5 LTI Advantage services

LTI Advantage is LTI 1.3 plus drie optionele services die Canvas allemaal ondersteunt:

**A. Assignment and Grade Services (AGS)**

De tool kan cijfers terugschrijven naar het Canvas-cijferboek. Dit is relevant als ons prototype beoordelingsactiviteiten wil tonen of bijhouden.

Scopes:
- `https://purl.imsglobal.org/spec/lti-ags/scope/score` - score insturen
- `https://purl.imsglobal.org/spec/lti-ags/scope/lineitem` - cijferkolommen beheren

**B. Names and Role Provisioning Services (NRPS)**

De tool kan de deelnemerslijst van een cursus opvragen, inclusief rollen, zonder dat de tool zelf inschrijvingsdata hoeft bij te houden.

Scope: `https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly`

**C. Deep Linking**

Docenten kunnen content vanuit de tool selecteren en insluiten in Canvas-modules of opdrachten. De tool stuurt een `LtiDeepLinkingResponse` JWT terug met de geselecteerde inhoud.


### 2.6 Wat een tool technisch moet bieden

Om als LTI 1.3-tool bij Canvas te kunnen starten, moet de tool de volgende endpoints aanbieden:

| Endpoint | Doel |
|----------|------|
| `oidc_initiation_url` | Ontvangt het startinitiatief van Canvas |
| `redirect_uri` | Ontvangt de JWT van Canvas na authenticatie |
| Publiek JWK-endpoint | Canvas gebruikt dit om aanvragen van de tool te verifiëren |

De tool wordt geregistreerd als Developer Key in Canvas door een beheerder. De minimale configuratie ziet er zo uit:

```json
{
  "title": "Fontys LMS Prototype",
  "oidc_initiation_url": "https://jouw-tool.nl/lti/login",
  "target_link_uri": "https://jouw-tool.nl/lti/launch",
  "scopes": [
    "https://purl.imsglobal.org/spec/lti-ags/scope/score",
    "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"
  ],
  "public_jwk_url": "https://jouw-tool.nl/.well-known/jwks.json",
  "extensions": [{
    "platform": "canvas.instructure.com",
    "privacy_level": "public",
    "settings": {
      "placements": [{
        "placement": "course_navigation",
        "message_type": "LtiResourceLinkRequest"
      }]
    }
  }]
}
```


## 3. Praktische beperkingen

### 3.1 Wat je niet kunt met de Canvas API

- **Geen verhoogde rechten:** De API geeft dezelfde rechten als de Canvas-webinterface van de ingelogde gebruiker. Een studenttoken kan geen gegevens van andere studenten lezen.
- **Geen realtime data:** Canvas heeft geen websocket-API. Alle data wordt via polling opgehaald.
- **Geen echte schrijftoegang tot berekende cijfers:** Je kunt scores insturen, maar Canvas berekent het eindcijfer zelf op basis van de weging.
- **Geen verwijdering van de meeste data:** De meeste DELETE-endpoints archiveren in plaats van echt verwijderen.
- **GraphQL is onvolledig:** Veel REST-endpoints hebben geen GraphQL-equivalent. Complexe filters (zoals "studenten met nul activiteit") zijn niet beschikbaar via GraphQL.

### 3.2 Veelgemaakte fouten

1. **Aannemen dat alle data op pagina 1 staat** - standaard zijn er 10 items per pagina; controleer altijd de `Link`-header.
2. **429-fouten niet afhandelen** - implementeer altijd retry-logica bij rate limit-fouten.
3. **LTI JWT-nonce niet valideren** - dit opent de deur voor replay-aanvallen.
4. **Cookies in iframes (Safari)** - moderne browsers blokkeren third-party cookies in iframes. Gebruik LTI Platform Storage (postMessage-API) als fallback voor het opslaan van de `state`.
5. **64-bit integer IDs in JavaScript** - JavaScript kan grote integers niet nauwkeurig vertegenwoordigen. Gebruik de header `Accept: application/json+canvas-string-ids` om IDs als strings te ontvangen.

### 3.3 Fontys-specifieke overwegingen

- **Geen zelfbeheer van Developer Keys.** Alle OAuth2- en LTI 1.3-registraties moeten door een Canvas-beheerder bij Fontys worden aangemaakt. Dit is een concrete afhankelijkheid in het project.
- **De tool moet publiek bereikbaar zijn.** Canvas moet het `oidc_initiation_url`- en `redirect_uri`-endpoint van onze tool kunnen bereiken. Lokaal draaien op `localhost` werkt niet - gebruik een tunneltool zoals ngrok tijdens ontwikkeling, of zet de tool vroeg op een testserver.
- **Privacywetgeving (AVG/GDPR).** Studentgegevens verwerken via de API of LTI valt onder de AVG. Voor een prototype in een onderwijscontext moet worden afgestemd met Fontys ICT wat toelaatbaar is.
- **Persoonlijk token voor prototyping.** Studenten kunnen zelf een persoonlijk token aanmaken in hun Canvas-profiel. Voor prototyping met de eigen account werkt dit prima zonder dat een beheerder iets hoeft te doen.


## 4. Bestaande libraries en tooling

Bij de implementatie hoeven we het wiel niet opnieuw uit te vinden. Er zijn bestaande libraries voor zowel LTI 1.3 als de Canvas REST API:

| Taal | LTI 1.3 library | Canvas API library |
|------|-----------------|-------------------|
| Python | `pylti1p3` | `canvasapi` (UCF Open) |
| Node.js | `ltijs` | `node-canvas-api` |
| PHP | `packback/lti-1-3-php-library` | - |
| .NET | - (handmatig) | - (handmatig) |

De keuze voor een technologiestack is nog niet gemaakt en hoort thuis in de adviesfase. Dit overzicht dient als input voor die keuze.


## 5. Conclusie: wat betekent dit voor ons prototype?

Op basis van deze verkenning komen we tot het volgende beeld:

**Canvas REST API** is geschikt voor het ophalen van studentdata: cursussen, opdrachten, inleveringen, voortgang en cijfers. Voor prototyping is een persoonlijk token voldoende. Voor een multi-user tool is een Developer Key (OAuth2) nodig, waarvoor de Canvas-beheerder van Fontys ingeschakeld moet worden.

**LTI 1.3** is de juiste koppelingsmethode om ons prototype als tab of tool in Canvas in te bouwen. Het regelt automatisch de single sign-on, geeft ons de cursuscontext en gebruikersrol mee, en biedt via LTI Advantage toegang tot het cijferboek (AGS) en de deelnemerslijst (NRPS).

**De combinatie van LTI 1.3 en de REST API** is het meest krachtig: LTI verzorgt de authenticatie en insluiting in Canvas, terwijl de REST API rijkere data biedt dan LTI alleen kan leveren.

**Twee concrete acties die nodig zijn voordat we verder kunnen:**
1. Contact opnemen met de Fontys Canvas-beheerder voor een Developer Key (OAuth2) en LTI-registratie.
2. Een publiek bereikbare testomgeving opzetten (VPS of tunnel) zodat Canvas onze tool kan bereiken.


## Bronnen

- [Canvas REST API Documentatie](https://canvas.instructure.com/doc/api/)
- [Canvas OAuth2](https://canvas.instructure.com/doc/api/file.oauth.html)
- [Canvas API Throttling](https://canvas.instructure.com/doc/api/file.throttling.html)
- [Canvas Paginering](https://canvas.instructure.com/doc/api/file.pagination.html)
- [Canvas LTI Developer Key Configuratie](https://canvas.instructure.com/doc/api/file.lti_dev_key_config.html)
- [Canvas LTI Launch Overzicht](https://canvas.instructure.com/doc/api/file.lti_launch_overview.html)
- [IMS Global LTI Advantage Overzicht](https://www.imsglobal.org/lti-advantage-overview)
- [Instructure API-beleid](https://www.instructure.com/policies/canvas-api-policy)


## Competentieverantwoording

**Infrastructure (Infrastructure) – Analyse – Niveau 1**

In dit document analyseer ik de technische infrastructuur achter een Canvas-integratie: de Canvas REST API en het LTI 1.3-protocol. Ik breng in kaart hoe authenticatie werkt, welke endpoints relevant zijn voor ons prototype, en wat de beperkingen zijn. De bevindingen vertaal ik naar concrete vervolgstappen: een Developer Key aanvragen bij de Fontys Canvas-beheerder en een publiek bereikbare testomgeving opzetten.
