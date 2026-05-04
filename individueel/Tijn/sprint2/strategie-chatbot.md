# Chatbot strategie - Sprint 2

**Sprint 2 | Infrastructure - Analyse - Niveau 1**
**Datum:** maart 2026
**Auteur:** Tijn Knapen

## Aanleiding

In sprint 1 is de technische basis verkend: de Canvas API, LTI 1.3 en het ecosysteem rondom het LMS. In sprint 2 gaat de focus naar de chatbot. Het idee: vervang de tekstgebaseerde Canvas-interface door een chatbot die gevoed wordt met alle context (student, docent, activiteiten, competenties, planning). Zowel student als docent kunnen er in gewone taal vragen aan stellen.

Een concreet voorbeeld: een student vinkt aan dat hij Analyse niveau 3 wil behalen. De chatbot weet wat dat competentieniveau inhoudt, kent de voortgang van de student, en geeft direct advies over wat hij het beste kan aanpakken.

Dit document is een persoonlijk vertrekpunt om richting te bepalen. Het is geen groepsbeslissing en ook niet definitief. Elke aanpak die hier staat vraagt nog apart onderzoek. De voorbeelden en iteraties zijn bedoeld om te verkennen, niet om meteen uit te voeren.

## Twee vragen als vertrekpunt

Om ergens te beginnen zijn er twee vragen nuttig:

1. **Hoe bouw je de chatbot?** - welke technologie of architectuur gebruik je
2. **Hoe voer je de data?** - hoe krijgt de chatbot de juiste context

Dit zijn persoonlijke deelvragen om een richting te vinden. Ze zijn niet afgestemd met de groep en kunnen nog veranderen.

## Vraag 1: Hoe bouw je de chatbot?

Een chatbot bestaat uit een aantal vaste componenten. Per component zijn er keuzes te maken.

| Component | Wat het doet |
|---|---|
| Input | De vraag van de gebruiker |
| Context | Welke data wordt meegegeven aan het model |
| Orchestratie | Hoe wordt bepaald wat er nodig is en hoe de aanroep verloopt |
| LLM | Het taalmodel dat het antwoord genereert |
| Output | Het antwoord terug naar de gebruiker |

De relevante keuzes zitten in de orchestratie en het LLM.

### Orchestratie: direct API of via framework?

**Direct API** - je roept het LLM rechtstreeks aan en beheert zelf de prompt, context en response.
- Voorbeelden: Anthropic Claude API, OpenAI API
- Voordelen: volledige controle, weinig afhankelijkheden, makkelijk te debuggen
- Nadelen: je schrijft alles zelf, geen ingebouwde geheugen- of retrieval-logica

**Via framework** - een framework zoals LangChain of LlamaIndex zit als tussenlaag. Het regelt chains, geheugen, retrieval en tool-aanroepen.
- Voorbeelden: LangChain, LlamaIndex
- Voordelen: veel kant-en-klare patronen, minder code om zelf te schrijven
- Nadelen: extra afhankelijkheid, soms onduidelijk wat er precies onder de motorkap gebeurt

### LLM: lokaal of cloud?

**Lokaal** - het model draait op de eigen machine via bijvoorbeeld Ollama. De data verlaat de machine niet.
- Voorbeelden: Ollama met Llama 3 (8B), Mistral 7B
- Voordelen: gratis, volledig GDPR-proof, geen externe afhankelijkheid
- Nadelen: minder sterk dan grote cloud-modellen, heeft goede hardware nodig

**Cloud** - het model draait bij een externe aanbieder via een API.
- Voorbeelden: Anthropic Claude, OpenAI GPT-4
- Voordelen: sterker model, geen hardware-eisen
- Nadelen: data verlaat de organisatie, kosten, GDPR-afwegingen nodig

## Vraag 2: Hoe voer je de data?

Er zijn twee fundamenteel verschillende categorieen.

**Context-strategieen** (methode 1 en 3): je voegt data toe aan het model zodat het zelf antwoord kan geven op basis van die informatie.

**Orkestratie-strategie** (methode 2): het model stuurt externe systemen aan om data op te halen of acties uit te voeren. Het model geeft geen antwoord vanuit voorgegeven data, maar coordineert zelf wat er nodig is.

Frameworks zoals LangChain combineren beide aanpakken. Hier zit een directe link met de architectuurkeuze uit vraag 1.

### Methode 1: System prompt injection

Alle relevante data wordt als tekst of JSON in de system prompt gestopt voordat de vraag wordt gesteld. Het LLM heeft alles beschikbaar in zijn context window.

```
Systeem: Je bent een leerassistent. Dit is de student:
{
  "naam": "Tijn",
  "behaalde_competenties": ["Analyse-1", "Design-1"],
  "openstaande_activiteiten": [...]
}
Beantwoord de vraag van de student.
```

- Voordelen: makkelijkste aanpak, geen extra infrastructuur nodig
- Nadelen: context window heeft een limiet, werkt niet meer als de data groot wordt

### Methode 2: Function calling / tool use

Het LLM krijgt een lijst van tools (functies die het mag aanroepen). Het model bepaalt zelf welke informatie het nodig heeft en roept de juiste tool aan.

```
Tools:
- getStudentActivities(studentId)
- getCompetencyRequirements(competencyId)
- getStudentProgress(studentId)

Vraag: "Wat moet ik doen voor Analyse niveau 3?"
LLM roept aan: getCompetencyRequirements("analyse-3"), getStudentProgress("tijn")
LLM maakt antwoord op basis van de teruggegeven data.
```

- Voordelen: dynamisch, het model haalt alleen op wat nodig is, schaalt beter
- Nadelen: meer werk om te bouwen, meer kans op fouten bij vage vragen

### Methode 3: RAG (Retrieval-Augmented Generation)

Data wordt omgezet naar vectoren en opgeslagen in een vectordatabase. Bij elke vraag worden de meest relevante stukken opgehaald en meegegeven als context aan het LLM.

```
Vraag --> embedding --> zoek in vectordatabase --> relevante chunks --> LLM --> antwoord
```

- Voordelen: werkt goed voor grote hoeveelheden tekst (Canvas-pagina's, handleidingen)
- Nadelen: meer infrastructuur nodig (embedding-model, vectordatabase), minder geschikt voor strak gestructureerde data als JSON

> Er is al een verkenning gedaan naar RAG in sprint 1. Die bevindingen kunnen hier op worden meegenomen.

### Methode 4: Combinatie

Function calling voor gestructureerde data (activiteiten, competenties, studentprofiel) gecombineerd met RAG voor losse tekst (cursusinhoud, Canvas-pagina's).

- Voordelen: combineert de sterke kanten van beide methodes
- Nadelen: meest complex, pas zinvol als de losse methodes eerst zijn geprobeerd

## Overzicht

| | System prompt | Function calling | RAG | Combinatie |
|---|---|---|---|---|
| Complexiteit | Laag | Middel | Middel | Hoog |
| Schaalbaarheid | Laag | Hoog | Hoog | Hoog |
| Infrastructuur | Geen | Weinig | Vector DB + embeddings | Beide |
| Geschikt voor | Kleine, gestructureerde data | Dynamische queries | Grote tekst-corpus | Productie |
| GDPR-risico | Afhankelijk van API | Afhankelijk van API | Afhankelijk van model | Afhankelijk van model |

## Test use cases

Dit zijn drie concrete situaties die de chatbot moet kunnen afhandelen. Ze zijn het doel - de ideale werking. Alle technische methodes worden langs deze use cases gelegd om te kijken welke aanpak het beste resultaat geeft.

### Use case 1: Student wil een competentie behalen

Een student wil Analyse niveau 3 behalen en vraagt de chatbot wat hij daarvoor het beste kan doen. De chatbot kent de competentiedefinities en de voortgang van de student, en geeft concreet advies.

### Use case 2: Docent vraagt zijn planning op

Een docent vraagt wat er vandaag op de planning staat. De chatbot haalt de juiste activiteiten en afspraken op en geeft een helder overzicht.

### Use case 3: Student wil weten wat hij kan maken voor een competentie

Een student vraagt welk document hij kan schrijven om Design aan te tonen in zijn project. De chatbot snapt de projectcontext van de student en geeft een passend en concreet advies.

## Werkwijze

Per technische methode wordt een iteratie doorlopen. Elke iteratie dekt alle vijf competentie-activiteiten:

- Analyse: de methode begrijpen en in kaart brengen
- Advise: een onderbouwde aanbeveling geven op basis van de bevindingen, ook over of deze methode geschikt is als potentiële eindoplossing
- Design: bepalen hoe de oplossing eruit moet zien voor de use cases
- Realise: een klein prototype of test bouwen om de methode te proberen
- Manage & Control: bewaken of het prototype stabiel werkt, of de antwoorden consistent zijn en of het gedrag voorspelbaar is bij verschillende vragen

De eerste stap is een apart onderzoeksdocument. Daarin worden de opties langs de use cases gelegd en wordt een concrete richting gekozen. Vanuit die keuze start iteratie 1: een gericht experiment met die aanpak. Elke iteratie eindigt met een conclusie: werkt de aanpak niet, dan gaat de volgende iteratie een andere kant op. Werkt het wel, dan wordt de aanpak uitgebreid en verbeterd.

Het uiteindelijke doel is een adviesdocument met een onderbouwde keuze voor de aanpak die het beste past bij dit project. Dit advies vormt de basis voor de verdere uitwerking richting het einde van het semester.

## Competentieverantwoording

**Infrastructure (Infrastructure) - Analyse - Niveau 1**

In dit document breng ik het landschap van mogelijke chatbot-aanpakken in kaart. Ik analyseer drie manieren om een chatbot te bouwen en vier manieren om data te voeden, en zet de verschillen op een rij op het gebied van complexiteit, schaalbaarheid en GDPR. Daarnaast definieer ik drie concrete use cases die als toetssteen dienen voor het verdere onderzoek.

**PS-2**

Met dit document zet ik op een gestructureerde manier mijn onderzoeksrichting uit. Ik gebruik een methodische aanpak: eerst het landschap verkennen, dan use cases definiëren, dan pas testen. Zo voorkom ik dat ik blind een richting op ga en kan ik mijn keuzes achteraf onderbouwen.

