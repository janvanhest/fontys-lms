# Chatbot scope

**Auteur:** Tijn Knapen
**Datum:** maart 2026

## Wat is de chatbot?

De chatbot is een onderdeel van het LMS-systeem. Hij vervangt de tekstgebaseerde Canvas-interface en geeft studenten en docenten de mogelijkheid om in gewone taal vragen te stellen en acties uit te voeren. De chatbot kent het systeem volledig en reageert op basis van de context die hij heeft.

## Gebruikers

De chatbot communiceert met alle gebruikers van het systeem:

- **Studenten** - vragen stellen over competenties, voortgang, opdrachten, planning
- **Docenten** - opvragen wat er op de planning staat, notificaties ontvangen, context toevoegen aan studenten

## Twee soorten taken

### 1. Kennis beantwoorden

De chatbot beantwoordt vragen op basis van informatie die hij heeft. Die informatie bestaat uit twee lagen:

**Statische systeemdata** - dit verandert zelden en geldt voor iedereen:
- Competentiedefinities en niveaus (HBO-i framework)
- Cursussen, modules, activiteiten
- Regels en richtlijnen van het systeem

**Gebruikersgevoede context** - dit wordt ingevoerd door studenten of docenten en is specifiek:
- Projectbeschrijvingen ("dit is ons project")
- Opdrachten en deliverables ("dit is wat ik heb ingeleverd")
- Persoonlijke voortgang en behaalde competenties

Voorbeeld: een student geeft zijn projectomschrijving aan de chatbot. Daarna vraagt hij welk document hij het beste kan schrijven voor Design niveau 1. De chatbot combineert de projectcontext met de competentiedefinitie en geeft concreet advies.

### 2. Acties uitvoeren

De chatbot kan ook iets doen in het systeem, niet alleen antwoorden. Hij is een coordinator.

Voorbeelden:
- Student plant een feedbackgesprek in met een docent over 5 dagen. De chatbot zet dit in de planning en laat de docent dit weten.
- Chatbot stuurt een notificatie naar een docent als een student iets heeft ingeleverd.

## Use cases (concreet)

### Use case 1: Student wil een competentie behalen
Een student wil Analyse niveau 3 behalen. De chatbot kent de competentiedefinitie en de voortgang van de student, en geeft concreet advies over wat hij het beste kan aanpakken.

### Use case 2: Docent vraagt zijn planning op
Een docent vraagt wat er vandaag op de planning staat. De chatbot haalt de juiste activiteiten en afspraken op en geeft een helder overzicht.

### Use case 3: Student wil weten wat hij kan maken voor een competentie
Een student vraagt welk document hij kan schrijven om Design aan te tonen in zijn project. De chatbot snapt de projectcontext van de student en geeft een passend en concreet advies.

## Wat de chatbot niet is

- Geen generieke AI-assistent los van het systeem
- Geen chatbot die alleen statische FAQ-vragen beantwoordt
- Geen vervanging van Canvas, maar een aanvulling die de interface vereenvoudigt

## Context-architectuur

Hoe de chatbot zijn context opbouwt verschilt per laag en per gebruikerstype.

### Altijd aanwezig (system prompt)

Bij elke sessie, voor elke gebruiker:
- Competentiedefinities en niveaus
- Cursussen en systeemregels
- Instructies over hoe de chatbot zich gedraagt

Dit is statische data die zelden verandert. Past zonder problemen in het context window.

### Bij sessie-start (eager loading)

Zodra een gebruiker inlogt, haalt de chatbot alle data op die aan die gebruiker gekoppeld is en laadt dit in de context.

**Student:** voortgang, behaalde competenties, openstaande activiteiten, projectbeschrijving, planning. De data van één student is beheersbaar en past in het context window.

**Docent:** alleen de eigen planning en algemene informatie. Niet de data van alle studenten - dat is te veel om in bulk te laden.

### On-demand (function calling)

Wanneer een docent iets vraagt over een specifieke student, haalt het model pas dan die data op uit de database. De docent vraagt, het model bepaalt welke data het nodig heeft, roept de juiste functie aan en bouwt dan pas het antwoord.

Dit is ook het patroon voor alle acties: inplannen, notificeren, data wegschrijven.

## Technische richting (globaal)

| Aspect | Keuze |
|---|---|
| Taal | Python |
| Model | Lokaal via Ollama (GDPR-safe) |
| Aanroep | Directe API, geen framework voor de eerste iteraties |
| Statische data | Geladen vanuit Canvas API of mock JSON |
| Gebruikersgevoede data | Opgeslagen in database (uitwerking volgt in iteratie 2) |
| Acties | Via function calling (uitwerking volgt later) |

## Iteratiestrategie

De chatbot wordt iteratief gebouwd. Elke iteratie begint met een onderzoeksvraag, eindigt met een prototype, en levert een binaire conclusie op: werkt de aanpak of niet?

- **Iteratie 1** - basis: kan het model goed antwoorden op gestructureerde context (competenties + studentprofiel)?
- **Iteratie 2** - gebruikersgevoede data: hoe sla je dit op en haal je het op?
- **Iteratie 3** - acties: function calling voor plannen en notificeren

De conclusie van elke iteratie bepaalt de richting van de volgende.
