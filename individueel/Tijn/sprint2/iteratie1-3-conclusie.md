# Iteratie 1 - Conclusie

**Sprint 2 | Infrastructure (Infrastructure) - Analyse - Niveau 1**
**Datum:** april 2026
**Auteur:** Tijn Knapen


## Terugblik op de onderzoeksvraag

> Kan een lokaal LLM via Ollama betrouwbaar antwoord geven op vragen over competenties en studentvoortgang, als die data als gestructureerde JSON in de system prompt wordt meegegeven?

**Antwoord: ja, maar het modeltype maakt een groot verschil.**

De aanpak werkt in principe. Een lokaal model kan via Ollama JSON-context verwerken en zinvolle antwoorden geven over competenties en studentvoortgang. Maar tijdens het testen bleek al snel dat niet elk model hier goed genoeg in is. Llama 3.1 8B, de oorspronkelijke keuze, hallucineert structureel en is daarmee ongeschikt. Na een modelwissel naar Qwen 2.5 14B verbeterden de resultaten aanzienlijk.


## Deelvraag 1 - Welk model is het meest geschikt?

In het onderzoeksdocument werd Llama 3.1 8B gekozen op basis van het grote context window (128k tokens). Tijdens het testen bleek dit onvoldoende als enkel criterium.

### Wat Llama 3.1 8B deed

Bij de planningsvraag ("Wat staat er de komende dagen op mijn planning?") negeerde Llama de concrete datums uit de JSON volledig en verzon een weekindeling die nergens in de data stond:

> *"Maandag: Je hebt geen activiteiten gepland. Dinsdag: Werk aan het schrijven van een adviesrapport..."*

De activiteiten in de JSON hebben gewoon datums (4 april, 7 april, 10 april). Llama negeerde die en maakte er een ma/di/wo-structuur van. Dit is een duidelijk geval van hallucinatie: het model verzint een structuur die niet gevraagd is en niet in de data staat.

Bij de competentievraag (scenario 1) sprak het model zichzelf binnen hetzelfde antwoord tegen. Het zei eerst dat `niveau_bezig` voor Infrastructure Analyse `null` was, en een alinea later dat het `2` was. Dat is inconsistentie die je in een leerassistent niet kan gebruiken.

**Conclusie over Llama 3.1 8B: afgekeurd.** Het model hallucineert structureel en is niet betrouwbaar genoeg om als basis te dienen.

### Modelwissel naar Qwen 2.5 14B

Op basis van de testresultaten is gewisseld naar Qwen 2.5 14B. Dit model scoort aantoonbaar beter op meertalige instructieopvolging en het vasthouden aan de gegeven context.

Resultaat bij dezelfde planningsvraag na de wissel:

> *"1. Prototype iteratie 1 bouwen en testen - Datum: 4 april 2026, Status: Bezig*
> *2. C4-diagram opstellen (level 1 en 2) - Datum: 7 april 2026, Status: Open*
> *3. Adviesrapport bijdrage schrijven - Datum: 7 april 2026, Status: Open..."*

Het model gebruikt de exacte datums en titels uit de JSON, verzint geen structuur en geeft een volledig overzicht. Dit is het gewenste gedrag.

**Definitieve modelkeuze: Qwen 2.5 14B.** Vereist een RTX 3080 of vergelijkbare GPU met minimaal 10GB VRAM. Past volledig op de GPU (~9GB VRAM bij Q4 quantisatie), wat zorgt voor snelle responstijden.


## Deelvraag 2 - Hoe structureer je de system prompt?

De eerste versie van de system prompt bevatte alleen een algemene instructie: "Je verzint geen informatie die niet in de context staat." Dat bleek te vaag.

Na analyse van de slechte resultaten is de prompt uitgebreid met expliciete gedragsregels:

- **Datum toegevoegd:** het model weet nu wat "vandaag" is, wat essentieel is voor planningsvragen. Zonder datum kan het model niet bepalen welke activiteiten "binnenkort" zijn.
- **Verbod op metataal:** de instructie "Verwijs NOOIT naar 'de data', 'het studentobject' of 'de JSON'" pakte een specifiek irritatiepunt aan. Zonder deze regel zei het model continu "in het studentobject zie ik..." en "uit de competentiematrix blijkt...", wat onnatuurlijk aanvoelt in een leerassistent.
- **Expliciete planningsregel:** "Als je een planning geeft, gebruik je alleen de activiteiten en datums die hieronder staan. Verzin geen weekindeling." Dit was de directe reactie op het Llama-probleem.

De uiteindelijke promptopzet werkt als volgt:

```
Laag 1 (statisch): gedragsregels + datum + competentiedefinities
Laag 2 (per sessie): studentprofiel, voortgang, activiteiten, project
```

Deze twee-lagenstructuur sluit direct aan op de geplande productie-architectuur: laag 1 is gedeeld voor alle gebruikers, laag 2 wordt per ingelogde student opgehaald.


## Deelvraag 3 - Past de data in het context window?

Voor een enkele student: ja, ruimschoots. De gecombineerde JSON-data (competenties + studentprofiel) beslaat naar schatting 3.000 tot 5.000 tokens. Met een context window van 128k tokens is dit minder dan 5% van de beschikbare ruimte.

**Maar hier ligt een architectureel probleem dat nu al zichtbaar is.**

De aanpak werkt voor 1 student. Zodra je de data van meerdere studenten in de context wil stoppen, loopt het snel vol:

- 1 student: ~800 tokens
- 100 studenten: ~80.000 tokens (nog net haalbaar)
- 1000 studenten: ~800.000 tokens (ver buiten elk context window)

Dit betekent dat de chatbot nooit alle studentdata tegelijk in de context kan laden. De architectuur moet hier al vroeg op anticiperen. De oplossingsrichting is al deels aanwezig in de strategie:

- **Student-sessie:** alleen de data van de ingelogde student laden (eager loading). Dit schaalt.
- **Docent-sessie:** data per student ophalen via function calling als de docent ernaar vraagt. Niet alles tegelijk in de context.
- **Langere termijn:** RAG (Retrieval Augmented Generation) via pgvector in PostgreSQL, zodat alleen de relevante stukken worden opgehaald op basis van de vraag.

Dit is geen probleem voor iteratie 1, maar het is een beperking die bewust in het ontwerp moet worden meegenomen vanaf iteratie 2.


## Deelvraag 4 - Geeft het model correcte antwoorden op de drie use cases?

### Scenario 1: Voortgang en advies

**Vraag:** "Ik wil Infrastructure Analyse niveau 2 behalen. Wat moet ik daarvoor doen?"

Qwen 2.5 14B herkende dat de student niveau 1 al heeft behaald, haalde de definitie van niveau 2 op uit de competenties en koppelde dat concreet aan het lopende project. De volledige output:

> "Om het niveau 2 van de competentie Infrastructure in de activiteit Analyse te behalen, moet je een complexere ecosysteemanalyse en technische specificaties uitvoeren. Hier zijn de stappen die je kunt volgen:
>
> 1. Complexe Ecosysteemanalyse: Ga verder dan de basis-ecosysteemanalyse die je al hebt uitgevoerd voor Canvas API-verkenning. Dit betekent dat je een gedetailleerde analyse moet doen van alle componenten, interfaces en interacties in het ecosysteem waarin je project zich bevindt.
>
> 2. Technische Specificaties: Maak technische specificaties voor de chatbot-architectuur die je momenteel aan het uitwerken bent. Dit omvat: het bepalen van de nodige API's en andere externe systemen, het identificeren en documenteren van alle hulpbronnen (hardware, software) die nodig zijn voor het systeem, en een gedetailleerde analyse van de vereisten en limieten van elke technische component.
>
> 3. Documentatie: Schrijf een volledig rapport of whitepaper waarin je ecosysteemanalyse en technische specificaties worden gedocumenteerd."

Wat opvalt: het model koppelt niveau 2 direct aan het project ("chatbot-architectuur die je momenteel aan het uitwerken bent") en aan de al uitgevoerde activiteit ("de basis-ecosysteemanalyse die je al hebt uitgevoerd"). Beide staan in de studentdata. Het model verzint niets en geeft concreet en bruikbaar advies.

**Beoordeling:** voldoet aan de succescriteria.

### Scenario 2: Planning opvragen

**Vraag:** "Wat staat er de komende dagen op mijn planning?"

Dit was het scenario waar Llama volledig faalde door een verzonnen weekindeling. Qwen 2.5 14B gaf de volgende output:

> "De komende dagen heb je een aantal activiteiten die je moet afwerken. Hier is een overzicht:
>
> 1. Prototype iteratie 1 bouwen en testen - Datum: 4 april 2026, Status: Bezig
> 2. C4-diagram opstellen (level 1 en 2) - Datum: 7 april 2026, Type: Document, Status: Open
> 3. Adviesrapport bijdrage schrijven (chatbot technische onderbouwing) - Datum: 7 april 2026, Type: Document, Status: Open
> 4. Iteratie 1 conclusie schrijven - Datum: 10 april 2026, Type: Document, Status: Open
> 5. Sprint 2 reflectie schrijven - Datum: 19 april 2026, Type: Reflectie, Status: Open"

Het model gebruikt de exacte titels, datums en statussen uit de JSON. Geen verzonnen structuur, geen aannames over weekdagen, geen lege plekken ingevuld. Dit is het gewenste gedrag: de chatbot fungeert als een directe weergave van wat er in het systeem staat, zonder iets toe te voegen.

Ter vergelijking de output van Llama 3.1 8B op dezelfde vraag:

> "Maandag: Je hebt geen activiteiten gepland voor maandag. Dinsdag: Werk aan het schrijven van een adviesrapport over chatbot-architectuur (iteratie 1) voor de competentie Infrastructure - Advise. Woensdag: Je hebt geen activiteiten gepland voor woensdag..."

Llama verzint hier een volledige weekindeling. De activiteiten hebben gewone datums in de JSON, maar het model negeert die en maakt er een ma/di/wo-overzicht van. Dit is een klassiek geval van hallucinatie: het model vult een structuur in die niet gevraagd is en niet in de data staat.

**Beoordeling:** Qwen voldoet aan de succescriteria. Llama faalt.

### Scenario 3: Koppeling competentie aan project

**Vraag:** "Welk document kan ik schrijven om Infrastructure Advise aan te tonen in mijn project?"

Qwen 2.5 14B gaf een uitgebreide en bruikbare output:

> "Om het niveau 'Advise' van de competentie 'Infrastructure' aan te tonen, kun je een document schrijven dat gericht is op technisch advies voor de chatbot-architectuur.
>
> Titel: Technisch Adviesrapport voor Chatbot-Architectuur
> Datum: 2026-04-07 | Project: Fontys LMS - Chatbot module
>
> Inhoudsopgave:
> 1. Inleiding
> 2. Overzicht van de kernproblemen
> 3. Technische keuze en onderbouwing
> 4. Analyse van de opties
> 5. Advies over technologische standaarden
> 6. Conclusie en voorstel
> 7. Bijlagen
>
> In dit adviesrapport bespreek ik de technische keuzes voor het ontwerp van een chatbot die als LTI-tool is gekoppeld aan Canvas, met behulp van de Canvas API. Bij de keuze van technologische standaarden heb ik onder andere gekeken naar: API-verificatie en autorisatiemechanismen, verwerking van grote hoeveelheden data zonder prestatieproblemen, en veiligheid van de chatbot en interacties met Canvas."

Het model pakt de projectcontext correct op: de datum (7 april), de projectnaam (Fontys LMS) en de technische context (LTI, Canvas API) komen rechtstreeks uit de JSON. De voorgestelde documentstructuur sluit aan op wat Infrastructure Advise niveau 1 verwacht: advies geven over de inrichting van een nieuw ICT-systeem in een voorspelbare omgeving.

Twee kanttekeningen. Ten eerste vulde het model de opties in de inhoudsopgave niet in ("Option A/B"). Dit is eigenlijk correct gedrag: de JSON bevat geen lijst van afgewogen opties, dus het model verzint ze niet. In een echte situatie zou de student die opties zelf aanleveren. Ten tweede bevatte de output twee kleine taalfouten ("Rationeeleringen" en "adverteren" in plaats van "aanpakken"). Dit zijn vertaalfouten die je bij lokale modellen vaker ziet en die geen invloed hebben op de bruikbaarheid van het antwoord.

**Beoordeling:** voldoet grotendeels aan de succescriteria. De taalfouten zijn acceptabel voor een lokaal model. Het niet invullen van de opties is logisch gedrag, geen fout.


## Samenvatting van de succescriteria

| Criterium | Llama 3.1 8B | Qwen 2.5 14B |
|---|---|---|
| Antwoord in het Nederlands | Voldoende | Goed |
| Geen hallucinaties | Faalt | Grotendeels voldaan |
| Concreet en specifiek | Matig | Goed |
| Consistent | Faalt | Voldaan |
| Context window voldoende | Voldaan | Voldaan |


## Wat werkt en wat niet

**Wat werkt:**
- De twee-lagenstructuur (statische context + studentdata per sessie) werkt zoals bedacht.
- Met de juiste gedragsregels in de system prompt houdt het model zich aan de data.
- Qwen 2.5 14B geeft betrouwbare, concrete antwoorden op alle drie de scenario's.
- De mock JSON-structuur sluit goed aan op de geplande databasestructuur, de overstap naar PostgreSQL in iteratie 2 wordt hierdoor kleiner.

**Wat niet werkt of aandacht nodig heeft:**
- Llama 3.1 8B is te onbetrouwbaar voor deze use case.
- De system prompt vereist expliciete, strikte instructies. Een vage instructie als "verzin niets" is onvoldoende.
- Het context window is een architecturele beperking bij schaal. Dit moet worden opgelost via student-specifieke eager loading en later RAG.


## Aanbevelingen voor iteratie 2

1. **PostgreSQL koppeling:** de mock JSON vervangen door echte data uit een PostgreSQL database. De structuur is al voorbereid.
2. **Eager loading vanuit DB:** studentdata per sessie dynamisch ophalen uit de database. Dit werkt hetzelfde als nu, maar in plaats van een JSON-bestand wordt de data via een query opgehaald en in de system prompt gestopt. De prompt-structuur verandert niet, alleen de bron van de data.
3. **Grotere en complexere studentdata testen:** iteratie 1 gebruikte een beperkt studentprofiel. In iteratie 2 wordt getest met rijkere data (meer activiteiten, meer voortgangsrecords) om te zien hoe het model daarmee omgaat.
4. **Modelkeuze vastleggen als Qwen 2.5 14B:** dit model is de basis voor verdere iteraties.

## Vooruitblik: function calling in latere iteraties

Eager loading werkt goed voor een enkele student, maar is niet de eindoplossing. De volgende stap na iteratie 2 is function calling. Dit verdient een apart onderzoeksdocument en wordt hier alvast kort beschreven als richting.

Bij function calling bevat de system prompt geen studentdata meer. In plaats daarvan krijgt het model een "handleiding": een lijst van functies die het kan aanroepen als het iets nodig heeft.

```
Beschikbare functies:
- get_student_progress(user_id)
- get_activities(user_id, datum)
- get_competentie(naam, niveau)
- add_activity(user_id, titel, datum)
- update_progress(user_id, competentie, activiteit, niveau)
- update_activity(user_id, activity_id, status)
```

Het model weet de data niet uit zijn hoofd, maar weet wel waar het moet zoeken en wat het kan aanpassen. Dit maakt twee dingen mogelijk die eager loading niet kan:

**Lezen op aanvraag:** de student vraagt iets, het model bepaalt zelf welke data het nodig heeft en haalt alleen dat op. De context window blijft klein, ongeacht hoeveel data er in de database staat.

**Schrijven naar de database:** de chatbot kan niet alleen antwoorden maar ook acties uitvoeren. Een student zegt "ik heb opdracht A afgerond" en het model roept `update_activity` aan waarna de database direct wordt bijgewerkt. Of complexer: het model herkent dat een afgeronde activiteit ook de competentievoortgang bijwerkt en roept meerdere functies achter elkaar aan.

```
Student: "Ik heb mijn ecosysteemanalyse ingeleverd"

Model roept aan: update_activity(activity_id=1, status="afgerond")
Model roept aan: update_progress(competentie="Infrastructure", activiteit="Analyse", niveau_bezig=2)
Model antwoordt: "Goed bezig. Opdracht staat als afgerond en je bent nu bezig met Infrastructure Analyse niveau 2."
```

Dit sluit direct aan op de kernvraag van het project: de student hoeft niet te weten waar in Canvas hij iets moet afvinken - hij zegt het gewoon tegen de chatbot. Vraaggestuurd onderwijs met minimale hindernissen.

De volgorde van iteraties is daarmee:
- Iteratie 2: eager loading vanuit PostgreSQL - werkt het model even goed met echte DB-data?
- Iteratie 3: function calling - kan het model zelfstandig de juiste data ophalen?
- Iteratie 4: schrijfacties - kan het model de database bijwerken op basis van wat de student zegt?

Voor iteratie 3 wordt een apart onderzoeksdocument geschreven, analoog aan dit document.


## Competentieverantwoording

**Infrastructure (Infrastructure) - Realise - Niveau 1**

In deze iteratie heb ik een werkend prototype gebouwd op basis van het ontwerp uit het onderzoeksdocument. Ik heb Python-code geschreven die via directe API-aanroepen communiceert met Ollama, twee lagen JSON-context inlaadt en drie concrete use cases test. Tijdens het testen heb ik het prototype aangepast op basis van de resultaten: de system prompt uitgebreid met gedragsregels, de timeout verwijderd en het model gewisseld van Llama 3.1 8B naar Qwen 2.5 14B. Dit is een realisatie van een ICT-component in een gestructureerde en voorspelbare context, op basis van een eerder opgesteld ontwerp.

**Infrastructure (Infrastructure) - Analyse - Niveau 1**

Op basis van de testresultaten heb ik een analyse gemaakt van wat werkt en wat niet. Ik heb het gedrag van twee modellen vergeleken op concrete criteria, de oorzaak van de hallucinaties bij Llama geidentificeerd (te vage instructies, ontbrekende datum in prompt), en een architecturele beperking gesignaleerd rond schaalbaarheid van het context window. Dit is een analyse van een eenvoudige infrastructuur op basis van meetbare kwaliteitscriteria in een voorspelbare context.

**Infrastructure (Infrastructure) - Manage & Control - Niveau 1**

In iteratie 1 heb ik het taalmodel als infrastructuurcomponent beheerd. Ik ben gestart met Llama 3.1 8B op basis van gedocumenteerde criteria (context window, hardware-vereisten). Tijdens het testen bleek het model niet te voldoen: structurele hallucinaties en inconsistente output. Ik heb dit geanalyseerd, de oorzaak vastgesteld en het model vervangen door Qwen 2.5 14B, met bijbehorende hardwarespecificaties (RTX 3080, ~9GB VRAM bij Q4 quantisatie). De modelkeuze, de reden voor de wissel en de configuratie zijn vastgelegd in dit document en in `testresultaten.txt`. Dit is het monitoren en bijsturen van een ICT-infrastructuurcomponent op basis van kwaliteitscriteria in een voorspelbare context.
