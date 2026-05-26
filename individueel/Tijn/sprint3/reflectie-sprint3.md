# Reflectie Sprint 3

**Project:** Bouw je eigen Learning Management System (LMS)
**Organisatie:** Fontys Hogeschool ICT
**Auteur:** Tijn Knapen
**Team:** Jan van Hest, Tamara Lemmens, Burak Ergin, Wares Helmand, Tijn Knapen
**Datum:** 24 mei 2026

## Versiebeheer


| Versie | Datum      | Auteur      | Wijzigingen   |
| ------ | ---------- | ----------- | ------------- |
| 1      | 24-05-2026 | Tijn Knapen | Eerste versie |


## Start van de sprint

Sprint 3 stond in het teken van ontwerpen en realiseren. De richting was na sprint 2 helder: een chatbot die als alternatief naast Canvas kan draaien, opgebouwd uit een NestJS backend, een Postgres-database met pgvector en een React frontend. Jan en ik bleven samen verantwoordelijk voor de chatbot. Voor mezelf had ik daarnaast de doelstelling om mijn Infrastructure niveau 1 portfolio rond te krijgen door een eigen end-to-end PoC te bouwen waarmee ik elk van de vijf HBO-i activiteiten kon onderbouwen.

## Werkzaamheden en onderzoek

Mijn hoofdbijdrage aan de team-PoC was PR #5: een werkende Docker Compose stack met een NestJS backend en Postgres met pgvector. Daarnaast heb ik vier PRs van anderen gereviewd (#4, #7, #8, #23), waarvan ik er twee (PR #4 over de mock-api en Docker, en PR #7 over Ollama en pgvector) heb uitgewerkt als losse review-documenten zodat ze ook als bewijsstuk voor de professionele standaard kunnen dienen.

Parallel aan de team-PoC heb ik mijn eigen end-to-end PoC gebouwd in `individueel/Tijn/sprint3/end-to-end-poc/`. Het idee was om een werkende hybride chatbot te maken die RAG (via pgvector) en function calling (op de relationele DB) in één antwoord combineert, en op basis daarvan vier portfolio-documenten te schrijven: een analyse, een advies, een ontwerp met diagrammen volgens het C4-model en een installatiehandleiding. De realisatie zelf zit in een aparte zip die ik via Portflow heb ingeleverd. Op 20 en 21 mei heb ik via Portflow per HBO-i activiteit een feedback request naar Marc gestuurd. Een week eerder, op 19 mei, had ik al een mondeling gesprek met Marc gehad, waarin hij twee aandachtspunten meegaf: het security-risico rond prompt injection en behoefte aan meer onderbouwing van de keuzes in het high-level diagram.

## Wat minder ging

De samenwerking tussen de twee duos in onze groep ging deze sprint stroever. Het chatbot-duo (Jan en ik) en het backend/api-duo (Wares en Tamara) zitten technisch nog niet helemaal op één lijn. Zij waren bezig met een Azure-richting terwijl wij al een werkende Docker Compose stack hadden, en de afstemming over hoe alles uiteindelijk in elkaar moet haken kwam pas laat op gang. Daar moeten we in sprint 4 echt iets aan doen, anders krijgen we straks een aansluitprobleem op het moment dat we het allemaal bij elkaar moeten brengen. Ook is er een groepslid uitgevallen, waardoor we nu nog met vier verder gaan. Dat zet wat extra druk op de werkverdeling.

Daarnaast loopt het contact met de stakeholder stroever dan in sprint 2. Ik heb Eric Slaats deze sprint zelf niet gesproken. Voor 26 mei staat een stakeholdergesprek gepland, dus dat moment komt er wel, maar tussendoor hadden we als groep eerder met hem kunnen afstemmen.

## Wat ik heb geleerd

Het grootste leermoment voor mij deze sprint zit niet zozeer in een techniek, maar in hoe ik mijn werk laat zien aan anderen. Door bewust meer feedback te vragen en mijn werk vaker te delen, krijg je veel gerichter terug wat goed gaat en wat beter kan dan wanneer je dat zelf moet inschatten. Dat klinkt simpel, maar het was voor mij echt een omslag.

Inhoudelijk heb ik weer een aantal nieuwe dingen aangeraakt: NestJS, TypeORM, pgvector goed configureren en het C4-model gebruiken om dezelfde stack op verschillende abstractielagen te beschrijven. Vooraf vond ik dat C4-model een beetje overdreven, maar achteraf bleek het juist heel nuttig: elk diagram beantwoordt een andere vraag, en in mijn analyse en advies kon ik er steeds naar terugverwijzen.

## Samenwerking

De samenwerking met Jan blijft heel goed. We weten van elkaar waar we mee bezig zijn, plannen goed, helpen elkaar waar nodig en verdelen het werk zo dat we elkaar niet in de weg lopen maar wel kunnen aanvullen. Mijn eigen end-to-end PoC en de team-PoC delen voor een groot deel dezelfde stack, en daardoor kon ik PRs van Jan reviewen met concrete kennis, en hij mijne andersom.

Met de bredere groep is het beeld gemengder. Binnen de duo's gaat het op zich prima, maar de afstemming tussen de duo's onderling kost meer moeite dan ik vooraf had ingeschat. Op 12 mei is dit ook in het groepsoverleg met Coen aan bod gekomen, en de afspraak is dat we een document of diagram maken dat de interface tussen de onderdelen beschrijft. Dat moet sprint 4 echt opgepakt worden.

## Terugblik

Ondanks de stroevere samenwerking tussen de duo's ben ik tevreden over wat er aan het einde van sprint 3 ligt. We hebben een mooi product in de maak en het loopt al goed. Persoonlijk heb ik een werkende end-to-end PoC, vijf onderbouwde bewijsstukken voor Infrastructure niveau 1, twee uitgewerkte PR-reviews en concrete bijdragen aan de team-PoC. De doorsteek die ik in sprint 1 en 2 voorbereidde, is in sprint 3 echt op tafel gekomen.

Voor sprint 4 ga ik twee dingen oppakken: het security-onderzoek rond prompt injection (analyse plus advies) als vervolg op de feedback van Marc, en de frontend competence-grid waarmee de competentie-backend zichtbaar wordt in de UI. Daarnaast wil ik in sprint 4 de afstemming tussen de duo's actiever oppakken zodat we als groep weer dichter bij elkaar komen.

## Competentieverantwoording

**PL-2**

In sprint 1 was mijn leerpunt dat ik moeite heb met werken in onduidelijkheid, in sprint 2 dat ik te snel iets werkend wil krijgen. Voor sprint 3 heb ik mezelf bewust de opdracht gegeven om meer feedback te vragen en mijn werk vaker te laten zien aan anderen. Coach Coen had op 12 mei expliciet aangegeven dat dit een aandachtspunt was, en dat heb ik direct opgepakt: actief feedback gevraagd bij Marc (zowel mondeling op 19 mei als via vijf Portflow feedback requests op 20-21 mei), en mijn voortgang vaker in de groep gedeeld. Voor mij is dat geen natuurlijke reflex, dus dat ik dit consequent ben blijven doen tot het einde van de sprint zie ik als een echte stap in mijn ontwikkeling.

**PS-2**

Ik heb deze sprint methodisch gewerkt op meerdere niveaus tegelijk. Mijn eigen PoC is opgebouwd in een herkenbare structuur (analyse, advies, ontwerp, realisatie, manage en control), waarbij elk bewijsstuk volgt uit het voorgaande. Mijn PR-reviews op de team-PoC zijn vastgelegd in losse review-documenten die laten zien hoe ik feedback onderbouw en doseer voor mijn teamgenoot. Mijn feedback-log is uitgebreid met alle bronnen (individuele feedpulses, groepsfeedpulses, Portflow feedback requests en PR-reviews) en mijn versiebeheer-document is bijgewerkt met v0.4 voor sprint 3. Daarmee laat ik zien dat ik niet alleen techniek lever, maar het werk ook verantwoord op een manier waarmee stakeholders, teamgenoten en beoordelaars terug kunnen vinden waarom en hoe iets gemaakt is.
