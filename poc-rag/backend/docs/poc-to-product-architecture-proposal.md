# POC naar Product Architectuurvoorstel

## Korte conclusie

De huidige POC is inhoudelijk sterk, maar de projectstructuur is nog te plat voor een duurzame basis. Vooral de map `chat` draagt te veel verantwoordelijkheden tegelijk: API-afhandeling, conversation context, orchestration, antwoordgeneratie en response-vorming zitten dicht op elkaar.

Voor een POC is dat begrijpelijk. Voor een nieuw project of serieuze refactor zou ik de gedragingen behouden, maar de modulegrenzen explicieter maken.

## Doel van de herstructurering

De herstructurering moet niet vooral cosmetisch zijn. Het doel is om de backend beter leesbaar, testbaar en uitbreidbaar te maken.

Belangrijkste doelen:

- Duidelijker maken wat productlogica is en wat infrastructuur is.
- Voorkomen dat services zoals `ChatService` en `SearchService` steeds groter worden.
- API-contracten consequenter bij de API-laag plaatsen.
- Retrieval, antwoordgeneratie en conversation context losser van elkaar testbaar maken.
- Domeinkennis apart houden van technische zoekimplementatie.
- Een structuur maken die bruikbaar is voor een nieuw project, niet alleen voor deze POC.

## Wat behouden uit de POC

Deze onderdelen zijn sterk en moeten conceptueel worden meegenomen:

- Dunne controllers die alleen API-verzoeken aannemen en doorzetten.
- Een kleine publieke API rond vraag-antwoordgedrag.
- Contextbewuste verwerking van vervolgvragen.
- Domeinspecifieke retrieval in plaats van alleen generieke vector search.
- Bronvermelding in de response.
- Fallbackgedrag wanneer embeddings of LLM-generatie niet beschikbaar zijn.
- Seedbare kennisbasis voor snelle validatie van het concept.

## Wat veranderen

De huidige structuur is functioneel, maar niet scherp genoeg voor verdere groei.

Aanbevolen veranderingen:

- Gebruik `chat` niet meer als centrale containernaam. Het productgedrag is breder dan chat; het is eerder een assistant- of vraag-antwoordmodule.
- Splits `SearchService` op in queryanalyse, retrieval, ranking en confidence-beoordeling.
- Zet DTO's consequent bij de API-contracten van de module.
- Maak antwoordgeneratie een eigen module, zodat LLM-provider en fallbackbeleid niet in de conversation-flow vastgroeien.
- Geef health checks een eigen technische module.
- Maak domeinvocabulaire los van de technische retrievalimplementatie.
- Houd database- en seedcontent in een knowledge-base module, niet verspreid door retrieval of chat.

## Voorgestelde nieuwe structuur

Deze structuur is bedoeld als doelbeeld voor een nieuw project of een serieuze opschoning van deze POC.

```text
src/
  app.module.ts
  main.ts

  modules/
    assistant/
      api/
        assistant.controller.ts
        dto/
          ask-question.request.dto.ts
          ask-question.response.dto.ts
          source.dto.ts
          conversation-message.dto.ts
      application/
        answer-question.use-case.ts
        source-selection.service.ts
      domain/
        conversation-context.service.ts
        question-intent.service.ts
        domain-vocabulary.service.ts
        student-profile-context.service.ts
      assistant.module.ts

    student-profile/
      application/
        get-current-student-profile.use-case.ts
      domain/
        student-profile.ts
      infrastructure/
        student-profile.repository.ts
      student-profile.module.ts

    retrieval/
      application/
        retrieve-relevant-content.use-case.ts
      domain/
        retrieval-result.ts
        retrieval-confidence.service.ts
        keyword-ranking.service.ts
      infrastructure/
        vector-retriever.service.ts
        keyword-retriever.service.ts
      retrieval.module.ts

    generation/
      application/
        generate-answer.use-case.ts
      infrastructure/
        anthropic-answer-generator.service.ts
        fallback-answer-generator.service.ts
      prompts/
        answer-generation.prompt.ts
      generation.module.ts

    knowledge-base/
      api/
        knowledge-health.controller.ts
      domain/
        document.entity.ts
        document-metadata.ts
      infrastructure/
        database-seeder.service.ts
        course-content.seed.ts
      knowledge-base.module.ts

    embeddings/
      infrastructure/
        ollama-embedding.service.ts
      embeddings.module.ts

    health/
      health.controller.ts
      health.module.ts
```

## Nieuwe moduleverantwoordelijkheden

### Assistant

De assistant-module is de publieke productfeature. Deze module bezit de API-route voor vragen en orkestreert de gebruikersflow.

Deze module hoort te weten:

- welke input een gebruiker mag sturen
- hoe gesprekshistorie wordt meegenomen
- welke profielcontext van de huidige student relevant is voor het antwoord
- welke use-case wordt uitgevoerd
- welke response naar de client gaat

Deze module hoort niet zelf te weten:

- hoe vector search technisch werkt
- welke LLM-provider wordt gebruikt
- hoe documenten in de database worden opgeslagen
- waar studentprofieldata technisch vandaan komt

### Student Profile

De student-profile module levert profieldata van de huidige student aan de assistant.

Deze module bevat:

- studentidentiteit
- voornaam of weergavenaam
- opleiding of leerroute
- semesterinformatie
- gekozen of bekende leerdoelen
- relevante voorkeuren of voortgangssignalen

Deze module moet geen chatlogica bevatten. De verantwoordelijkheid is alleen: de huidige student veilig en voorspelbaar representeren voor andere modules.

Voor de chatbot is dit vooral waardevol omdat antwoorden persoonlijker en gerichter kunnen worden. Een begroeting zoals "Hallo Jan, waar gaan we aan werken?" is een simpele vorm daarvan. Sterker wordt het wanneer de assistant ook weet aan welk semester, welke leeruitkomsten of welke projecten Jan werkt.

### Retrieval

De retrieval-module zoekt relevante kennis en bepaalt of de resultaten betrouwbaar genoeg zijn.

Deze module bevat:

- retrieval use-case
- vector retrieval
- keyword fallback
- ranking
- confidence checks
- retrieval-result types

Hiermee wordt de huidige brede `SearchService` verdeeld over kleinere verantwoordelijkheden.

### Generation

De generation-module maakt antwoorden op basis van gevonden context.

Deze module bevat:

- promptopbouw
- LLM-generatie
- lokale fallbackgeneratie
- provider-specifieke implementaties

Hierdoor blijft de assistant-flow onafhankelijk van Anthropic, Ollama of een toekomstige andere AI-provider.

### Knowledge Base

De knowledge-base module beheert de opgeslagen onderwijscontent.

Deze module bevat:

- documentmodel
- metadata
- seedcontent
- database seeding

In een productievariant kan deze module later groeien richting contentbeheer, importflows of koppelingen met Canvas.

### Embeddings

De embeddings-module kapselt embeddinggeneratie af.

In de POC gebruikt dit Ollama. In een nieuw project moet de rest van het systeem niet afhankelijk zijn van die keuze. Daarom hoort de provider achter een eigen service of interface te zitten.

### Health

De health-module bevat technische beschikbaarheidschecks. Dit houdt operationele endpoints gescheiden van productfeatures.

## Voorgestelde API-contracten

Voor een nieuw project is `POST /api/assistant/ask` duidelijker dan `POST /api/chat`, omdat het endpoint niet alleen chat verwerkt maar een domeingericht antwoord produceert.

Aanbevolen routes:

- `POST /api/assistant/ask`: hoofdroute voor vraag-antwoord.
- `GET /api/assistant/profile-context`: optionele route om te controleren welke profielcontext de assistant voor de huidige student mag gebruiken.
- `GET /api/health`: technische beschikbaarheidscheck.

Als bestaande clients afhankelijk zijn van `POST /api/chat`, kan die route tijdelijk blijven bestaan als alias. Voor een nieuw project zou ik direct starten met de assistant-route.

## Voorgestelde DTO-namen

De huidige DTO's zijn bruikbaar, maar de namen zijn te chatgericht. Voor een nieuw project zijn deze namen duidelijker:

- `ChatMessageDto` wordt `AskQuestionRequestDto`.
- `HistoryItemDto` wordt `ConversationMessageDto`.
- `ChatResponseDto` wordt `AskQuestionResponseDto`.
- `ChatSourceDto` wordt `SourceDto`.
- Voeg `StudentProfileContextDto` toe voor profielinformatie die veilig aan de assistant-context mag worden meegegeven.

Deze namen beschrijven het API-contract beter. Ze zeggen wat het systeem functioneel doet, niet alleen via welke UI-vorm het wordt aangeroepen.

## Voorgestelde service- en use-case namen

Voor de hoofdflow:

- `ChatService` wordt `AnswerQuestionUseCase`.
- Source-selectie wordt een aparte `SourceSelectionService`.
- Profielcontext wordt opgebouwd via `StudentProfileContextService`.

Voor retrieval:

- `SearchService` wordt opgesplitst in `RetrieveRelevantContentUseCase`, `VectorRetrieverService`, `KeywordRetrieverService`, `KeywordRankingService` en `RetrievalConfidenceService`.
- Query-intentie en domeinbegrippen worden verplaatst naar `QuestionIntentService` en `DomainVocabularyService`.

Voor generatie:

- `AnswerGenerationService` wordt `GenerateAnswerUseCase`.
- Anthropic-specifieke logica verhuist naar `AnthropicAnswerGeneratorService`.
- Fallbacklogica verhuist naar `FallbackAnswerGeneratorService`.

Voor embeddings:

- `EmbeddingService` wordt `OllamaEmbeddingService` wanneer Ollama de concrete provider blijft.
- Als providerwissel belangrijk wordt, kan daar later een generieke `EmbeddingProvider` interface boven komen.

Voor studentprofieldata:

- Voeg `GetCurrentStudentProfileUseCase` toe als enige application entrypoint voor profieldata.
- Voeg `StudentProfileRepository` toe als infrastructuurlaag voor de daadwerkelijke bron, bijvoorbeeld database, LMS-koppeling of identity provider.
- Houd `StudentProfileContextService` in de assistant-module om te bepalen welke profielvelden in prompts en antwoorden gebruikt mogen worden.

## Studentprofiel en personalisatie

Een belangrijk uitbreidingspunt voor het nieuwe project is dat de assistant profieldata van de huidige student kan gebruiken. Dat maakt de chatbot minder generiek en meer gericht op de persoonlijke leercontext.

Voorbeelden van nuttige profieldata:

- voornaam of gekozen weergavenaam
- huidige opleiding of leerroute
- huidig semester
- actieve leeruitkomsten
- gekozen project of challenge
- persoonlijke leerdoelen
- coach of begeleidingscontext
- recente portfolio- of voortgangsstatus, als die betrouwbaar beschikbaar is

Deze data moet niet onbeperkt in prompts worden gestopt. De assistant heeft een compacte profielcontext nodig met alleen velden die helpen om beter te antwoorden. Een goede promptcontext kan bijvoorbeeld bevatten dat de student Jan heet, in semester 4 zit, aan een groepschallenge werkt en vooral bewijs zoekt voor bepaalde leeruitkomsten.

De profielcontext ondersteunt drie vormen van personalisatie:

- Begroeting en toon: de assistant kan de student persoonlijk aanspreken.
- Relevantie: antwoorden kunnen aansluiten op semester, leerdoelen en projectvorm.
- Vervolgadvies: suggesties kunnen beter passen bij wat de student al gekozen of gedaan heeft.

Belangrijke grens: profieldata mag het antwoord sturen, maar niet de enige bron van waarheid worden. Inhoudelijke onderwijsantwoorden moeten nog steeds terug te voeren zijn op knowledge-base bronnen of expliciet gemarkeerd worden als persoonlijk advies.

Voor privacy en beheersbaarheid moet de assistant alleen werken met profielvelden die expliciet zijn toegestaan voor assistant-gebruik. Gevoelige data, beoordelingen of interne docentnotities horen niet automatisch in de promptcontext.

## Gewenste flow in de nieuwe structuur

De hoofdflow blijft inhoudelijk hetzelfde, maar de verantwoordelijkheden worden scherper verdeeld.

1. `AssistantController` ontvangt de vraag.
2. `AnswerQuestionUseCase` start de hoofdflow.
3. `GetCurrentStudentProfileUseCase` haalt het profiel van de huidige student op.
4. `StudentProfileContextService` bepaalt welke profieldata bruikbaar en toegestaan is voor deze vraag.
5. `ConversationContextService` bepaalt context en eventuele herformulering.
6. `QuestionIntentService` bepaalt het type vraag.
7. `DomainVocabularyService` verrijkt de vraag met domeinbegrippen.
8. `RetrieveRelevantContentUseCase` zoekt relevante kennis.
9. `RetrievalConfidenceService` bepaalt of resultaten bruikbaar zijn.
10. `GenerateAnswerUseCase` maakt een antwoord via LLM of fallback, met toegestane profielcontext.
11. `SourceSelectionService` kiest de bronnen voor de response.
12. `AssistantController` geeft antwoord en bronnen terug aan de client.

Deze flow maakt duidelijk welke component waarvoor verantwoordelijk is en waar je later tests of vervangbare implementaties kunt plaatsen.

## Refactorstrategie

De verstandigste aanpak is gefaseerd. Probeer niet alles tegelijk semantisch te veranderen.

### Fase 1: Documenteren en naamgeving vastleggen

Leg dit voorstel vast als doelarchitectuur. Gebruik het als referentie voordat code wordt verplaatst.

### Fase 2: Verplaatsen zonder gedragswijziging

Verplaats controllers, DTO's en services naar de nieuwe mappenstructuur met minimale inhoudelijke aanpassingen.

Doel:

- imports herstellen
- modules opnieuw registreren
- bestaande route werkend houden
- geen retrieval- of generatiegedrag veranderen

### Fase 3: Services opsplitsen

Splits de brede services daarna pas op.

Start met `SearchService`, omdat daar de meeste verantwoordelijkheden samenkomen. Splits daarna source-selectie uit `ChatService` en providerlogica uit `AnswerGenerationService`.

### Fase 4: API-route aanscherpen

Introduceer `POST /api/assistant/ask`. Houd `POST /api/chat` tijdelijk als compatibele route als er al een frontend op draait.

### Fase 5: Tests rond kernkwaliteit

Voeg gerichte tests toe op:

- intentdetectie
- domeinvocabulaire
- confidence rules
- fallbackgedrag
- source-selectie
- follow-upvraagherkenning
- profielcontext en personalisatieregels

Deze tests zijn belangrijker dan brede end-to-end tests, omdat hier de conceptuele kwaliteit van de RAG-flow zit.

## Acceptatiecriteria voor een toekomstige refactor

Een refactor naar deze structuur is geslaagd als:

- de publieke vraag-antwoordflow hetzelfde blijft werken
- controllers dun blijven
- DTO's alleen API-contracten beschrijven
- retrieval zonder antwoordgeneratie getest kan worden
- antwoordgeneratie zonder database getest kan worden
- domeinvocabulaire zonder vector search getest kan worden
- providerkeuzes voor LLM en embeddings niet door de hele codebase lekken
- het duidelijk is waar nieuwe domeinbegrippen toegevoegd moeten worden
- studentprofieldata alleen via een expliciete profielcontext in de assistant terechtkomt
- persoonlijke antwoorden nog steeds bronvermelding gebruiken wanneer ze onderwijsinhoud bevatten

## Praktisch advies

Voor een nieuw project zou ik niet proberen de huidige mappenstructuur te redden. Ik zou de gedragingen en lessen uit de POC meenemen, maar starten met de nieuwe module-indeling.

Voor deze bestaande POC is een volledige refactor alleen zinvol als er nog actief op wordt doorgebouwd. Als de POC vooral dient als bewijs en inspiratie, is dit voorstel-document waarschijnlijk waardevoller dan het daadwerkelijk verplaatsen van alle bestanden.
