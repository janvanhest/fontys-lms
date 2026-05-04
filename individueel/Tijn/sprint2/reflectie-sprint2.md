# Reflectie Sprint 2

**Project:** Bouw je eigen Learning Management System (LMS)
**Organisatie:** Fontys Hogeschool ICT
**Auteur:** Tijn Knapen
**Team:** Jan van Hest, Tamara Lemmens, Burak Ergin, Wares Helmand, Karin van Gompel, Tijn Knapen
**Datum:** 20 april 2026

## Versiebeheer


| Versie | Datum      | Auteur      | Wijzigingen   |
| ------ | ---------- | ----------- | ------------- |
| 1      | 20-04-2026 | Tijn Knapen | Eerste versie |


## Start van de sprint

Sprint 2 begon gestructureerder dan sprint 1. De groep was opgesplitst in drie subgroepen rond concrete focuspunten, en ik ben samen met Jan aan de chatbot gaan werken. De scope was meteen helder: geen breed onderzoek meer, maar een advies en prototype voor een chatbot die de Canvas-interface kan vervangen door vraaggestuurde interactie. Daardoor kon ik vrij snel na de start met inhoudelijk werk beginnen, wat iets is wat ik me na sprint 1 had voorgenomen.

## Werkzaamheden en onderzoek

Mijn hoofdproduct deze sprint was het chatbot-prototype in twee iteraties.

Iteratie 1 was een technische verkenning met lokale taalmodellen via Ollama. Ik heb eerst Llama 3.1 8B geprobeerd, maar die hallucineerde te veel en gaf inconsistente antwoorden. Ik ben overgestapt op Qwen 2.5 14B, dat wel betrouwbaar bleek. De context-opbouw bestond uit twee lagen: een statische system prompt met de HBO-i competenties, en een eager-loaded studentcontext uit een mock JSON-bestand. Drie scenario's getest.

Iteratie 2 verving die mock JSON door een echte PostgreSQL-database in Docker. Ik heb een schema met vier tabellen gebouwd, een seed-script, een loader-module en de chatbot-code aangepast zodat hij per sessie de studentcontext uit de database haalt. Doel was valideren of de database-laag dezelfde kwaliteit oplevert als de JSON-laag. Dat lukte: geen regressie. Docker en PostgreSQL waren voor mij beide nieuw, dat was een flinke leercurve.

Daarnaast heb ik de strategie-chatbot herzien op basis van feedback van Lennart, en bijgedragen aan het adviesrapport. Ik heb Bijlage B uitgebreid met de prototypebeschrijving, modelkeuze en testresultaten, en Bijlage E sectie 7 geschreven over de technische verkenning en de vervolgstap naar Modal.com voor zwaardere modellen.

Voor sprint 3 heb ik alvast een eigen databasevoorstel geschreven voor het eindbeeld van het systeem, als gespreksbasis naast het ontwerp dat de backend-teamgenoten zelf maken.

Bij de stakeholderpresentatie op 14 april heb ik zelf niet gepresenteerd wegens tijdgebrek, maar de terugkoppeling was positief: Eric Slaats was voorstander van een chatbot die de volledige context van de student begrijpt.

## Wat minder ging

Het grootste leerpunt voor mij was werken in iteraties en rekening houden met een teamgenoot. Ik ben van nature iemand die snel iets bouwt, een soort "boem boem, snel werkend krijgen"-aanpak. Stapsgewijs werken via een iteratie-cyclus waarin je eerst onderzoekt, dan ontwerpt, dan realiseert en pas daarna concludeert, is niet mijn natuurlijke ritme. Dat kostte in het begin moeite.

Samenwerken met Jan werkt ook anders dan alleen werken. We doen veel dubbel individueel en komen dan bij elkaar om op één lijn uit te komen. Dat is minder efficiënt dan een strakke taakverdeling, maar het voordeel is dat ik precies weet waar hij aan werkt en andersom.

## Wat ik heb geleerd

Deze sprint heb ik inhoudelijk veel geleerd. Lokale AI-modellen waren nieuw voor mij: hoe Ollama werkt, wat prompt-engineering in de praktijk betekent, waarom een klein model (Llama 3.1 8B) kan falen waar een ander klein model (Qwen 2.5 14B) wel werkt, en hoe je de context-architectuur in lagen kunt opbouwen. PostgreSQL was ook nieuw, net als Docker. Het idee van een database als container die je met één commando weggooit en opnieuw opbouwt was voor mij echt een "aha"-moment. Dat werkt heel anders dan een lokaal geïnstalleerde MySQL.

Naast techniek heb ik geleerd dat methodisch werken en iteratief bouwen waarde heeft. Het resultaat is beter dan wat ik in één keer zou hebben opgeleverd, juist doordat de kaders tussen de fases je dwingen om na te denken voor je bouwt.

## Samenwerking

De samenwerking binnen mijn duo met Jan gaat goed, ook al werken we meer parallel dan verdeeld. Binnen de bredere groep zijn er wel spanningen zichtbaar geworden, bijvoorbeeld rond het adviesrapport dat lang vooral door Jan is getrokken zonder bijdragen vanuit de rest van de groep. Ik heb daar bewust op gereageerd door als eerste na Jan twee bijlagen uit te breiden met mijn eigen werk, zodat het rapport als geheel verder kwam. Dat was ook een manier om het niet alleen bij mijn duo-partner te laten.

## Terugblik

Sprint 2 was productiever en gerichter dan sprint 1. De opsplitsing in subgroepen werkte goed en het concrete doel maakte het makkelijk om te starten. Ik ben tevreden met wat er ligt: twee werkende iteraties van de chatbot, bijdragen aan het adviesrapport, een eigen databasevoorstel voor sprint 3, en positieve terugkoppeling van Lennart op de strategie-chatbot en van Eric op de richting.

De iteratieve aanpak zelf is duidelijk en gestructureerd, maar op sommige vlakken wel overbodig in mijn ogen. Niet elke iteratie heeft bijvoorbeeld evenveel "analyse" of "advies" nodig als de template suggereert. Voor sprint 3 wil ik de structuur als hulpmiddel blijven gebruiken, maar strakker kiezen welke fases per iteratie echt zinvol zijn.

## Competentieverantwoording

**PL-2**

In sprint 1 schreef ik dat ik moeite heb met werken in onduidelijkheid. In sprint 2 merkte ik dat een andere eigenschap meer speelde: ik wil dingen graag snel bouwen en neem dan te weinig tijd voor de iteratie-stappen die ervoor en erna zitten. Door bewust in de iteratieve structuur te werken en stap voor stap te gaan, heb ik die neiging in toom weten te houden. Het resultaat is beter dan wat ik in mijn oude tempo had opgeleverd, en daar ben ik tot nu toe blij mee.

**PS-2**

Ik heb deze sprint methodisch gewerkt via een iteratieve cyclus van analyse, advies, ontwerp, realisatie en conclusie. Elke iteratie had een expliciete onderzoeksvraag, deelvragen, concrete testscenario's en een onderbouwde conclusie. Die structuur dwong mij om keuzes zoals modelkeuze, database en schema-aanpassingen te onderbouwen in plaats van intuïtief te maken. De bijdragen aan het adviesrapport (Bijlage B en E) zijn in dezelfde methodische vorm opgezet.
