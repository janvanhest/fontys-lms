# Iteratie 1 - Onderzoek

**Sprint 2 | Infrastructure (Infrastructure) - Analyse - Niveau 1**
**Datum:** maart 2026
**Auteur:** Tijn Knapen

## Aanleiding

Vanuit de chatbot-strategie is besloten om iteratief te werken. Elke iteratie begint met een onderzoeksvraag, eindigt met een prototype, en levert een conclusie op: werkt de aanpak of niet?

Iteratie 1 richt zich op de basis: kan een lokaal taalmodel betrouwbaar antwoord geven als je het de juiste context geeft? Dit is de kern van de chatbot. Alles wat later komt (database, acties, gebruikersinvoer) bouwt hierop voort. Als dit niet werkt, heeft de rest geen zin.

De gekozen aanpak voor deze iteratie:

- Lokaal model via Ollama (GDPR-safe, geen kosten, geen externe afhankelijkheid)
- Directe API-aanroep, geen framework
- Twee lagen context: system prompt voor statische data, eager loading voor studentdata
- Mock data op basis van het HBO-i framework en een fictief studentprofiel, opgebouwd conform de geplande PostgreSQL-databasestructuur

## Onderzoeksvraag

> Kan een lokaal LLM via Ollama betrouwbaar antwoord geven op vragen over competenties en studentvoortgang, als die data als gestructureerde JSON in de system prompt wordt meegegeven?

### Deelvragen

1. Welk Ollama-model is het meest geschikt voor deze use case?
2. Hoe structureer je de system prompt zodat het model de JSON-context goed gebruikt?
3. Past de benodigde data binnen het context window van het gekozen model?
4. Geeft het model concrete en correcte antwoorden op de drie use cases?

## Modelkeuze

Voor lokaal draaien via Ollama zijn er een paar reele opties. De belangrijkste criteria voor deze use case zijn: grootte van het context window (we injecteren JSON), kwaliteit van het Nederlands, en haalbaarheid op gewone hardware.


| Model        | Context window | Nederlands | Hardware  |
| ------------ | -------------- | ---------- | --------- |
| Llama 3.1 8B | 128k tokens    | Redelijk   | ~8GB RAM  |
| Mistral 7B   | 8k tokens      | Redelijk   | ~8GB RAM  |
| Gemma 2 9B   | 8k tokens      | Redelijk   | ~10GB RAM |


**Keuze: Llama 3.1 8B**

Het grote context window (128k tokens) is de doorslag. Als je straks studentdata, competentiedefinities en projectcontext allemaal in de system prompt wil stoppen, heb je ruimte nodig. Mistral 7B en Gemma 2 9B zitten op 8k tokens - dat is krap zodra de data groeit. Llama 3.1 8B is ook breed getest en goed gedocumenteerd.

Als blijkt dat het Nederlands tegenvalt of de antwoorden te zwak zijn, wordt in de conclusie gekeken of een ander model beter past.

## Aanpak

### Mock data

Er wordt geen echte Canvas API gebruikt in iteratie 1. De data wordt gesimuleerd via twee JSON-bestanden:

**student.json** - profiel van een fictieve student:

- Naam, opleiding
- Behaalde competenties met niveau
- Openstaande activiteiten
- Huidig project (korte beschrijving)

**competenties.json** - subset van het HBO-i framework:

- De relevante competenties (Infrastructure, Software, Design, User Interaction)
- Per competentie: definitie niveau 1, 2 en 3
- Activiteiten per competentie (Analyse, Advise, Design, Realise, Manage & Control)

### Geen database in iteratie 1

In iteratie 1 wordt geen database gebruikt. Alle data staat als mock JSON in losse bestanden. Het doel is eerst te valideren of het model goed reageert op gestructureerde context - pas als dat werkt heeft een echte database zin.

In iteratie 2 komt PostgreSQL erbij. De mock JSON wordt daarom al opgebouwd conform de entiteiten die in het ERD komen (User, Course, Competency, StudentProgress, Activity, Project, Event), zodat de overstap naar een echte database zo klein mogelijk is.

**Gekozen database voor iteratie 2: PostgreSQL**, om twee redenen:
- **JSONB** - flexibele data zoals competentiedefinities kan als JSON worden opgeslagen en is toch efficient doorzoekbaar
- **pgvector** - als later RAG wordt toegevoegd voor ongestructureerde tekst, kan vectoropslag direct in dezelfde database zonder aparte vector-database

### Prompt-opzet

De system prompt bevat twee lagen.

**Laag 1 - System prompt (statisch, altijd aanwezig):**
```
Je bent een leerassistent voor een HBO-ICT student. Je helpt studenten en docenten
met vragen over competenties, voortgang en planning. Je antwoordt altijd in het
Nederlands. Je geeft concrete en specifieke adviezen op basis van de gegevens
die je hebt. Je verzint geen informatie die niet in de context staat.

COMPETENTIES:
{competenties_json}
```

**Laag 2 - Eager loading (bij sessie-start, gebruikersspecifiek):**
```
STUDENT:
{student_json}
```

Dit simuleert het gedrag van het uiteindelijke systeem: statische systeemdata zit altijd in de prompt, gebruikersdata wordt per sessie opgehaald en toegevoegd. In iteratie 2 komt dit uit PostgreSQL. De gebruikersvraag komt daarna als losse user message.

### Testscenario's

De drie use cases uit de chatbot-scope worden als testscenario gebruikt:

**Scenario 1:** "Ik wil Analyse niveau 3 behalen. Wat moet ik daarvoor doen?"

- Verwacht: model noemt de juiste definitie van Analyse niveau 3, koppelt dit aan de voortgang van de student, geeft concreet advies

**Scenario 2:** "Wat staat er vandaag op mijn planning?"

- Verwacht: model noemt de activiteiten uit het studentprofiel die voor vandaag staan

**Scenario 3:** "Welk document kan ik schrijven om Design aan te tonen in mijn project?"

- Verwacht: model combineert de projectomschrijving van de student met de Design-competentiedefinitie en geeft een concreet voorstel

## Criteria voor succes

Iteratie 1 is geslaagd als het model op alle drie de scenario's voldoet aan deze criteria:

- Antwoord is in het Nederlands
- Antwoord verwijst correct naar de meegegeven competentiedefinities (model verzint niets)
- Antwoord is concreet, niet generiek
- Antwoord is consistent: dezelfde vraag twee keer gesteld geeft geen tegenstrijdige antwoorden

Iteratie 1 is mislukt als:

- Het model structureel hallucineert (informatie verzint die niet in de context staat)
- Het Nederlands te slecht is voor praktisch gebruik
- Het context window te klein blijkt voor de benodigde data

## Conclusie

*Wordt ingevuld na het bouwen en testen van het prototype (zie iteratie1-2-prototype).*

---

## Competentieverantwoording

**Infrastructure (Infrastructure) - Analyse - Niveau 1**

In dit document analyseer ik de technische opties voor de eerste iteratie van de chatbot. Ik leg de keuze voor een lokaal model uit op basis van concrete criteria (context window, privacy, hardware), beschrijf hoe de prompt-architectuur werkt en stel meetbare criteria op voor succes en mislukking. Dit is een analyse van een eenvoudige infrastructuur in een voorspelbare context, uitgevoerd op basis van de use cases en technische randvoorwaarden van het project.

**Infrastructure (Infrastructure) - Advise - Niveau 1**

Op basis van de analyse geef ik in dit document een onderbouwd advies over de inrichting van de chatbot-infrastructuur voor iteratie 1. Ik adviseer een lokaal model (Llama 3.1 8B via Ollama) vanwege het grote context window en GDPR-veiligheid, een directe API-aanroep zonder framework voor maximale controle, en een twee-laagse promptopzet met statische systeemdata in de system prompt en gebruikersdata via eager loading. Voor de database adviseer ik PostgreSQL voor iteratie 2, op basis van de JSONB- en pgvector-mogelijkheden. Dit advies is gegeven binnen een voorspelbare context en gebaseerd op de concrete eisen van het project.