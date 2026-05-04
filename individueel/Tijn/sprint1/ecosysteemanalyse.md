# Ecosysteemanalyse - Fontys LMS Landschap

**Sprint 1 | Infrastructure - Analyse - Niveau 1**
**Datum:** maart 2026

**DOT-methodes:**
- Available product analysis (Library): bestaande tools in het ecosysteem geanalyseerd op functionaliteit, beperkingen en koppelmogelijkheden
- Document analysis (Field): projectdocumenten, stakeholderverslagen en probleemanalyses bestudeerd


## Inleiding

Dit document brengt het ICT-ecosysteem in kaart waarbinnen Fontys-studenten hun leerervaring opbouwen. Het centrale systeem is Canvas, maar daaromheen zijn meerdere losgekoppelde tools ontstaan die elk een deelprobleem oplossen. De vraag is: hoe hangen deze systemen samen, wat kunnen ze, waar zitten de beperkingen, en waar liggen de gaten?


## 1. De tools in het ecosysteem

### 1.1 Canvas

**Wat het is:** Het centrale Learning Management System van Fontys, geleverd door Instructure. Canvas is de basis waarop alle andere tools aansluiten.

**Wat het doet:**
- Cursussen, modules en opdrachten beheren
- Inleveringen ontvangen en beoordelen
- Communicatie tussen studenten en docenten
- Voortgang en cijfers bijhouden
- Externe tools insluiten via LTI

**Wie het gebruikt:** Studenten, docenten, coaches, beheerders

**Koppelmogelijkheden:** Canvas REST API (JSON, OAuth 2.0) en LTI 1.3 voor externe tools. Vrijwel alle data is opvraagbaar via de API: cursussen, modules, opdrachten, inleveringen, activiteiten, analytics.

**Beperkingen:**
- Gebouwd rond modules en vaste cursusstructuren
- Geen native ondersteuning voor activiteitsgericht of vraaggestuurd navigeren
- Zoekfunctionaliteit is onbetrouwbaar
- Tekst-zwaar, weinig multimediale alternatieven
- Geen semester-overstijgende weergave van het leerpad


### 1.2 Portflow

**Wat het is:** Een e-portfolio tool ontwikkeld door Drieam, gericht op programmatisch toetsen waarbij de student eigenaarschap heeft over zijn bewijsmateriaal.

**Wat het doet:**
- Studenten verzamelen bewijsmateriaal (opdrachten, producten, reflecties)
- Feedback aanvragen bij docenten, peers of externe beoordelaars
- Portfolio indienen voor beoordeling
- Canvas-inleveringen importeren als bewijs

**Wie het gebruikt:** Studenten (primair), docenten, coaches, externe beoordelaars

**Koppelmogelijkheden:** LTI 1.3 (Advantage) gecertificeerd. Maakt gebruik van Canvas-gebruikersbeheer voor authenticatie.

**Beperkingen:**
- Bewijs koppelen aan een competentie kost veel klikken
- Geen drag-and-drop voor portfolio-items
- Studenten begrijpen niet altijd hoe ze werk moeten koppelen aan competenties
- Portfolios blijven daardoor incompleet, coaches geven veel uitleg


### 1.3 FeedPulse

**Wat het is:** Een LTI-applicatie voor gestructureerde feedbackverwerking, ook ontwikkeld door Drieam.

**Wat het doet:**
- Studenten verwerken feedback actief op vaste checkpoints
- Docenten geven snelle smiley-beoordelingen als statuscheck
- Meerdere feedbackmomenten worden bijgehouden zodat ontwikkeling zichtbaar wordt
- Peer-feedback mogelijk

**Wie het gebruikt:** Studenten, docenten, coaches

**Koppelmogelijkheden:** LTI-koppeling met Canvas.

**Beperkingen:**
- Feedback is niet zichtbaar in Canvas zelf
- Studenten moeten actief naar FeedPulse navigeren
- Data-uitwisseling met andere tools (Portflow, Studycoach) ontbreekt


### 1.4 Studycoach

**Wat het is:** Een coaching- en analytics-dashboard, mede ontwikkeld met Fontys.

**Wat het doet:**
- Coaches zien leeranalytics per student
- Identificeert at-risk studenten vroeg
- Gedeelde notities tussen coach en student
- Toont leergedrag en resultaten over meerdere Canvas-cursussen

**Wie het gebruikt:** Semestercoaches, docenten, studenten

**Koppelmogelijkheden:** LTI-koppeling met Canvas. Haalt analytics op via Canvas.

**Beperkingen:**
- Primair gericht op coaches, niet op de student zelf
- Voortgang is niet direct inzichtelijk voor de student vanuit Studycoach
- Coaches tracken momenteel nog veel handmatig


### 1.5 Fontys Links

**Wat het is:** De centrale startpagina van Fontys die verwijst naar alle Fontys-diensten.

**Wat het doet:**
- Centrale toegang tot Fontys-systemen (Canvas, M365, e-mail, etc.)
- Authenticatie via centrale Fontys-login

**Wie het gebruikt:** Alle Fontys-studenten en medewerkers

**Koppelmogelijkheden:** Centraal authenticatiepunt, geen directe data-uitwisseling met Canvas.

**Beperkingen:**
- Alleen een doorverwijspagina, geen inhoudelijke tool
- Geen integratie met leerdata


### 1.6 Microsoft 365

**Wat het is:** De Microsoft-suite die Fontys gebruikt voor communicatie en samenwerking.

**Wat het doet:**
- Teams: communicatie tussen studenten, coaches en docenten
- SharePoint/OneDrive: bestandsdeling
- Outlook: e-mail

**Wie het gebruikt:** Studenten, docenten, coaches

**Koppelmogelijkheden:** Staat los van Canvas, geen directe data-uitwisseling.

**Beperkingen:**
- Communicatie en leerdata zijn volledig gescheiden
- Afspraken en begeleiding via Teams zijn niet zichtbaar in Canvas


### 1.7 AI-competentiemapping tool

**Wat het is:** Een AI-tool die studenten helpt hun werk te koppelen aan competenties.

**Wat het doet:**
- Analyseert ingevoerd werk en stelt voor aan welke competentie het gekoppeld kan worden

**Wie het gebruikt:** Studenten

**Koppelmogelijkheden:** Onduidelijk, vermoedelijk los van Canvas.

**Beperkingen:**
- Genereert te veel output, wordt daardoor nauwelijks gebruikt
- Niet geintegreerd in de dagelijkse workflow van studenten


## 2. Koppelstructuur

Canvas fungeert als centrale hub. De meeste tools hangen er via LTI 1.3 aan:

| Tool | Koppeling met Canvas | Richting |
|------|---------------------|---------|
| Portflow | LTI 1.3 | Canvas levert gebruiker, cursuscontext en inleveringen |
| FeedPulse | LTI 1.3 | Canvas levert gebruiker en cursuscontext |
| Studycoach | LTI 1.3 | Canvas levert analytics en gebruikersdata |
| Fontys Links | Geen | - |
| M365 | Geen | - |
| AI-competentietool | Onduidelijk | - |

Wat opvalt: de data-uitwisseling is overwegend eenrichtingsverkeer. Canvas levert gebruikerscontext aan de tools, maar de tools sturen weinig of niets terug naar Canvas of naar elkaar. Er is geen centrale plek waar al deze data samenkomt voor de student.


## 3. Knelpunten

Op basis van de stakeholderanalyse en projectdocumentatie zijn de volgende knelpunten vastgesteld:

**Versnippering van tools**
Studenten moeten tussen Canvas, Portflow, FeedPulse, Studycoach en M365 schakelen om een volledig beeld van hun leerproces te krijgen. Er is geen centrale plek die alles samenvoegt. De aandacht verschuift daardoor van leren naar navigeren.

**Canvas is module-gericht, niet student-gericht**
Canvas is ontworpen rondom modules en cursussen. Fontys beweegt richting vraaggestuurd onderwijs waarbij de student zijn eigen activiteiten en leervraag centraal stelt. Challenges kunnen drie weken maar ook drie jaar duren en lopen dwars door semesters heen. De strakke modulestructuur van Canvas ondersteunt dit niet.

**Informatie is slecht vindbaar**
De zoekfunctionaliteit van Canvas is onbetrouwbaar. Studenten vragen docenten en coaches rechtstreeks om informatie in plaats van het systeem te gebruiken. Dit schaalt slecht en legt onnodige druk op begeleiders.

**Content is tekst-zwaar**
Canvas leunt zwaar op geschreven tekst. Studenten hebben steeds meer moeite met grote lappen tekst en nemen informatie anders op, maar Canvas biedt weinig alternatieven.

**Workshops missen hun doelgroep**
Studenten die het meest baat hebben bij een workshop verschijnen er het minst. Het systeem geeft geen signaal aan coaches of studenten wanneer bijsturing nodig is.

**Coaches werken handmatig**
Studycoach biedt analytics, maar coaches tracken voortgang nog steeds veel handmatig. Proactieve signalering vanuit het systeem ontbreekt.

**Competentiekoppeling is onduidelijk**
Studenten begrijpen niet hoe hun dagelijkse werk aansluit bij competenties. Portflow maakt dit moeilijk door slechte UX, en de AI-tool genereert te veel output om bruikbaar te zijn.


## 4. Positie van ons prototype

Op basis van deze analyse is duidelijk wat het ecosysteem mist: een studentgericht overzicht dat data uit de bestaande tools samenvoegt en de student helpt zijn eigen leerpad te begrijpen en te navigeren.

Ons prototype sluit aan op Canvas via LTI 1.3 en de Canvas REST API. Het biedt vijf functies:

| Onderdeel | Wat het oplost |
|-----------|---------------|
| **Chat** | Studenten stellen vragen over cursusinhoud. De chatbot leest Canvas-content en beantwoordt vragen zonder dat studenten zelf hoeven te zoeken |
| **Activities** | Kalenderoverzicht van activiteiten en deadlines, opgehaald via de Canvas API |
| **Challenge** | Overzicht van lopende challenges, ook semester-overstijgend |
| **Competenties** | Inzicht in voortgang per competentie, gekoppeld aan inleveringen en feedback |
| **Stappenplan** | Persoonlijk leerpad dat de student zelf kan volgen en aanpassen |

Het prototype vervangt geen van de bestaande tools. Het legt een verbindende laag bovenop Canvas die de student een samenhangend overzicht geeft vanuit zijn eigen perspectief.


## 5. Conclusie

Het Fontys LMS-ecosysteem bestaat uit Canvas als centrale hub met daaromheen meerdere gespecialiseerde tools die via LTI 1.3 zijn aangesloten. De tools lossen elk een deelprobleem op, maar werken onderling niet samen en sturen data niet terug naar een centraal punt.

De fundamentele mismatch is dat Canvas is gebouwd voor module-gericht onderwijs, terwijl Fontys beweegt richting vraaggestuurd, activiteitsgericht leren. Ons prototype vult dit gat door via de Canvas API en LTI een studentgerichte laag toe te voegen die de bestaande infrastructuur slimmer ontsluit.


## Competentieverantwoording

**Infrastructure (Infrastructure) - Analyse - Niveau 1**

In dit document analyseer ik het ICT-ecosysteem rondom Canvas: welke tools er zijn, hoe ze koppelen, waar de beperkingen zitten en waar de gaten vallen. De bevindingen vertaal ik naar een concreet beeld van wat het ecosysteem mist en hoe ons prototype daar op aansluit.
