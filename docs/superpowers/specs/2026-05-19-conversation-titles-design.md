# Conversation Titles Design

## Doel

Vervang datumgebaseerde gesprekstitels door betekenisvolle gesprekstitels die automatisch ontstaan tijdens het chatten, maar die de gebruiker daarna inline in de sidebar kan aanpassen.

## Scope

- Genereer automatisch een voorlopige titel na het eerste complete assistant-antwoord.
- Verfijn die titel later nog maximaal één keer als het gesprek inhoudelijk duidelijker wordt.
- Sta inline hernoemen toe in de sidebar.
- Sla titels persistent op in de backend zodat ze na reload behouden blijven.
- Voorkom dat automatische titelupdates handmatige wijzigingen overschrijven.
- Voeg geen deletefunctionaliteit toe.

## Niet in Scope

- Geen verwijderen of archiveren van gesprekken.
- Geen aparte titelbeheerpagina.
- Geen complexe titelgeschiedenis of undo-flow.
- Geen zichtbare “AI gegenereerd”-badge.

## Aanpak

### Backend

`conversations` krijgt extra velden:

```ts
title: string | null
titleManuallyEdited: boolean
titleRevisionCount: number
```

Gedrag:

- Nieuwe gesprekken starten zonder titel.
- Na het eerste complete assistant-antwoord genereert de backend automatisch een korte titel.
- Na enkele extra berichten mag de backend de titel nog één keer verfijnen.
- Zodra een gebruiker handmatig hernoemt, zet de backend `titleManuallyEdited = true` en stopt elke automatische update.

De titelgeneratie gebeurt in de chatservice, direct na het opslaan van een assistant-antwoord. De implementatie mag in eerste instantie pragmatisch zijn:

- titel baseren op de eerste studentvraag of vroege gesprekssamenvatting
- kort, concreet, maximaal ongeveer 3-6 woorden

Als later gewenst kan dit nog door de LLM worden verfijnd, maar het persistente contract blijft hetzelfde.

Daarnaast komt er een update-endpoint:

```http
PATCH /chat/conversations/:id
```

Body:

```ts
{
  title: string
}
```

Regels:

- Lege of alleen-whitespace titels worden geweigerd of getrimd naar een geldige waarde.
- Alleen de eigenaar van het gesprek mag de titel aanpassen.
- Er komt geen delete-endpoint.

### Frontend

De sidebar gebruikt `conversation.title` als primaire weergave. Alleen als er nog geen titel is, valt de UI tijdelijk terug op de datum/tijd.

Inline hernoemen:

- klik of dubbelklik op de titel activeert edit-modus
- titel verandert op dezelfde plek in een compact tekstveld
- `Enter` slaat op
- `Escape` annuleert
- `blur` slaat op als de waarde geldig is

Tijdens opslaan:

- mag de lijst lokaal optimistisch updaten, of kort disabled zijn
- fouten mogen subtiel terugvallen naar de vorige titel

De datumchip blijft als secundaire context onder de titel zichtbaar.

## Datastroom

1. Student start of vervolgt een gesprek.
2. Backend slaat student- en assistant-berichten op.
3. Backend bepaalt of een automatische titel moet worden aangemaakt of eenmalig verfijnd.
4. Sidebar haalt gesprekken op en toont de opgeslagen titels.
5. Gebruiker klikt op een titel en wijzigt die inline.
6. Frontend verstuurt `PATCH /chat/conversations/:id`.
7. Backend slaat de handmatige titel op en blokkeert verdere automatische overschrijving.

## Foutafhandeling

- Als automatische titelgeneratie mislukt, blijft de datumfallback zichtbaar.
- Als inline opslaan mislukt, herstelt de frontend de vorige titel.
- Als de gebruiker een lege titel probeert op te slaan, annuleert of herstelt de frontend naar de vorige geldige titel.

## Teststrategie

- Backend tests voor automatisch titel aanmaken.
- Backend tests voor maximaal één automatische verfijning.
- Backend tests die bewijzen dat handmatige hernoeming automatische updates blokkeert.
- Backend tests voor `PATCH /chat/conversations/:id`.
- Frontend tests of stories voor inline edit state en fallbackweergave.

## Risico's

- Te vroege titelgeneratie kan generieke titels opleveren; daarom is één latere verfijning toegestaan.
- Zonder `titleManuallyEdited` bestaat risico op frustrerende overschrijvingen.
- Sidebar-interacties kunnen rommelig worden als klikgedrag te gevoelig is; edit-modus moet bewust en subtiel zijn.
