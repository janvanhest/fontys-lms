# Chat Source Attribution Design

## Doel

Maak voor chatbot-antwoorden subtiel zichtbaar welke externe bron(nen) zijn geraadpleegd, zonder technische details over vector search te tonen. De eerste bronsoort is Canvas-content; later volgen challenge- en competentietool-bronnen.

## Scope

- Toon alleen bronnen wanneer tijdens het genereren van een antwoord echt retrieval is gebruikt.
- Toon maximaal 1-3 meest relevante bronnen per assistant-antwoord.
- Render bronnen als subtiele klikbare labels in de vorm `Canvas: Stappenplan`.
- Open bij klik de opgeslagen bron-URL in een nieuw tabblad.
- Ontwerp het dataformaat generiek zodat meerdere bronsoorten dezelfde UI kunnen hergebruiken.

## Niet in Scope

- Geen aparte bronweergave voor berichten zonder retrieval.
- Geen volledige lijst van alle gevonden chunks.
- Geen technische terminologie in de UI zoals "vector database" of "embedding".
- Geen UI voor rankinguitleg of confidence scores.

## Aanpak

### Backend

De retrieval-keten retourneert niet langer alleen samengevoegde tekst, maar ook gestructureerde bronmetadata van de best scorende resultaten.

Het bronformaat wordt:

```ts
type ChatSource = {
  kind: string
  label: string
  url: string | null
}
```

Voor Canvas-content wordt:

- `kind = "canvas"`
- `label = "Canvas: <title>"`
- `url = <metadata.url>`

`DocumentSearchService` haalt voor de topresultaten zowel `content` als `metadata` op uit `documents`.
`RagTool` geeft een object terug met:

```ts
type RagToolResult = {
  content: string
  sources: ChatSource[]
}
```

`ChatService` bewaart tijdens een antwoord de bronnen van toolresultaten, dedupliceert ze op `label + url`, houdt de originele relevantievolgorde aan en kapt af op maximaal 3 bronnen. Deze bronnen worden meegestuurd in het `final` SSE-event.

Het contract voor het finale SSE-event wordt:

```ts
type FinalChatPayload = {
  text: string
  sources?: ChatSource[]
}
```

Voor toekomstige toolbronnen zoals challenge- en competentietool geldt hetzelfde contract. Alleen de backendmapping van ruwe tooldata naar `ChatSource` verschilt per bronsoort.

### Frontend

De frontend verwerkt het `final` event als JSON-payload met `text` en optionele `sources`.

Het assistant-berichtmodel krijgt:

```ts
type Message = {
  id: string
  role: 'student' | 'assistant'
  content: string
  isStreaming?: boolean
  sources?: ChatSource[]
}
```

Onder elk assistant-antwoord wordt alleen bij aanwezigheid van `sources` een subtiele rij klikbare bronlabels getoond. De labels:

- gebruiken de backendlabeltekst direct
- zijn compact en visueel ondergeschikt aan de hoofdtekst
- openen alleen links als `url` aanwezig is

## Datastroom

1. Student verstuurt bericht naar `/chat/stream`.
2. LLM roept retrieval-tool aan.
3. Backend zoekt topresultaten via pgvector.
4. Backend bouwt antwoordcontext en bronmetadata op.
5. LLM genereert antwoord.
6. Backend verstuurt `final` event met antwoordtekst plus optionele bronnen.
7. Frontend toont het antwoord en daaronder maximaal 3 klikbare bronlabels.

## Foutafhandeling

- Als retrieval geen resultaten oplevert, worden geen bronnen meegestuurd.
- Als een bron geen URL heeft, mag het label niet klikbaar zijn.
- Als het `final` event nog legacy platte tekst bevat, moet de frontend dat defensief blijven verwerken totdat backend en frontend tegelijk zijn uitgerold.

## Teststrategie

- Backend unit tests voor document retrieval met metadata.
- Backend unit tests voor deduplicatie en top-3 bronselectie in `ChatService`.
- Frontend tests voor parsing van `final` payloads met en zonder `sources`.
- Frontend render test voor zichtbare bronlabels onder assistant-berichten.

## Risico's

- Bronlabels kunnen dubbel lijken als meerdere chunks uit hetzelfde document komen; daarom is deduplicatie verplicht.
- De huidige retrieval geeft documentchunks terug, niet gegarandeerd exacte citaten. De UI moet daarom "bronnen geraadpleegd" impliceren, niet "bron van elke zin".
- Toekomstige tools moeten hun output naar hetzelfde `ChatSource` contract mappen om UI-fragmentatie te voorkomen.
