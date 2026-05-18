Dit document bevat de domeinanalyse: van ruwe termen uit de casus naar een gefilterd domeinmodel. Eerst worden werkwoorden en zelfstandige naamwoorden geïdentificeerd, daarna gefilterd naar entiteiten, attributen, rollen en gedrag, en ten slotte vertaald naar een klassendiagram.

---

## Zelfstandige naamwoorden & werkwoorden

### Zelfstandige naamwoorden

Gevonden in het adviesrapport, het gespreksverslag met Eric Slaats en de probleemanalyse.

|                   |                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Term              | Bron                                                                                                               |
| Student           | Overal in het adviesrapport                                                                                        |
| Coach             | Gespreksverslag Eric Slaats — begeleiding van studenten; probleemanalyse sectie Mens                               |
| Docent            | Probleemanalyse sectie Mens — workshopaanbod en signalering                                                        |
| Challenge         | Gespreksverslag Eric Slaats — "challenges variëren van 3 weken tot 3 jaar"                                         |
| Semester          | Gespreksverslag Eric Slaats — "fluide onderwijs, semesters zijn niet langer automatisch het einde van een project" |
| Activiteit        | Concept B, C en D in het adviesrapport — eigen stramien student                                                    |
| Activiteitstype   | Eigen stramien: CHALLENGE / OPDRACHT / WORKSHOP / COMPETENTIE / EIGEN                                              |
| Architectuurlaag  | HBO-i raamwerk — Software, Infrastructuur, Gebruikersinteractie, Organisatieprocessen, Hardware interfacing        |
| HboiActiviteit    | HBO-i raamwerk — Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control                                    |
| Beheersingsniveau | HBO-i raamwerk — niveau 1 t/m 4                                                                                    |
| Beroepstaak       | HBO-i raamwerk — combinatie van architectuurlaag, activiteit en beheersingsniveau                                  |
| Leeruitkomst      | Fontys-specifiek (LO1–LO7) — niet op de HBO-i server beschikbaar                                                   |
| Cursusinhoud      | Technische verkenning LTI en Canvas API — Canvas-pagina's als bron voor RAG                                        |
| Module            | Canvas-navigatiestructuur — het probleem dat het adviesrapport beschrijft                                          |
| Opdracht          | Canvas-concept, benoemd in enquêteresultaten                                                                       |
| Workshop          | Probleemanalyse — "workshop-paradox: studenten vragen om meer workshops maar bezoeken ze niet"                     |
| Voortgang         | Gespreksverslag Eric Slaats; scoringscriterium C4 activiteitsoverzicht                                             |
| Gesprek           | Gespreksverslag Eric Slaats — "een omgeving waarmee studenten een dialoog kunnen aangaan"                          |
| Bericht           | Onderdeel van gesprek                                                                                              |
| Nudge             | Literature study nudging in education — Thaler & Sunstein (2008)                                                   |
| Leercyclus        | Concept D — Stappenplan-tab in de tabnavigatie                                                                     |
| Fase              | HBO-i activiteiten als fases: analyseren, adviseren, ontwerpen…                                                    |
| Portfolio         | Portflow — extern systeem bij Fontys                                                                               |
| Bewijsstuk        | Portfolio-context — onderdeel van Portflow                                                                         |
| Profiel           | Studentgegevens afkomstig van LTI-launch                                                                           |
| Suggestie         | Concept D — systeem stelt competentiekoppeling voor na loggen activiteit                                           |
| Expert            | Docent die een deelproduct valideert op een specifiek vakgebied — eenmalig of incidenteel contact                  |
| Validatie         | Beoordeling van een deelproduct door een expert — heeft datum, oordeel en toelichting                              |
| Semesterplan      | Overzicht van beroepstaken die een student dit semester wil aantonen — besproken met coach                         |

### Werkwoorden

|             |                   |                          |
| ----------- | ----------------- | ------------------------ |
| Werkwoord   | Wie               | Op wat                   |
| logt        | Student           | Activiteit               |
| koppelt     | Student / Systeem | Activiteit → Beroepstaak |
| suggereert  | Systeem           | Beroepstaakkoppeling     |
| bevestigt   | Student           | Suggestie                |
| stelt vraag | Student           | Chatbot                  |
| zoekt       | Student           | Cursusinhoud             |
| volgt       | Student           | Workshop                 |
| werkt aan   | Student           | Challenge                |
| nastreeft   | Student           | Beroepstaak + Niveau     |
| begeleidt   | Coach             | Student                  |
| monitort    | Coach             | Activiteiten van student |
| biedt aan   | Coach / Docent    | Workshop / Activiteit    |
| indexeert   | Systeem           | Cursusinhoud             |
| haalt op    | Systeem           | Studentcontext           |
| genereert   | Systeem           | Antwoord                 |
| attendeert  | Systeem           | Student (nudge)          |
| plant       | Student           | Activiteit               |

---

## Filtering — entiteit, attribuut, rol of gedrag?

### Filtermethode

Elke term wordt langs vier vragen gelegd:

- **Entiteit**: heeft een eigen identiteit en levenscyclus, wordt opgeslagen. *Test: kan ik er twee van hebben die op elkaar lijken maar toch verschillend zijn?*
- **Attribuut**: beschrijft een entiteit, bestaat niet zonder die eigenaar. *Test: bestaat dit zonder zijn eigenaar? → nee = attribuut.*
- **Rol**: hetzelfde ding in een andere context. *Test: is dit eigenlijk een bekende entiteit met ander gedrag?*
- **Gedrag**: iets wat het systeem doet, geen ding dat het is. Komt uit de werkwoordenlijst.
- **Buiten scope**: bestaat in het domein maar wordt niet door dit systeem beheerd.

### Filterresultaat

|                   |                             |                                                                                                                                                                 |
| ----------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Term              | Oordeel                     | Toelichting                                                                                                                                                     |
| Student           | Entiteit                    | Heeft eigen identiteit, profiel, activiteiten en gesprekken                                                                                                     |
| Coach             | Entiteit + Rol              | Begeleidt studenten op procesniveau — heeft overzicht van activiteiten en semesterplan; is meer dan een rol want heeft een eigen relatie met meerdere studenten |
| Expert            | Rol                         | Valideert deelproducten op inhoudelijk vakgebied — eenmalig of incidenteel contact; zelfde User-type als Coach maar andere interactie                           |
| Docent            | Rol                         | Is een gebruiker die workshops aanbiedt — zelfde User, andere rechten                                                                                           |
| Challenge         | Entiteit                    | Heeft naam, status, looptijd, hoort bij één student                                                                                                             |
| Semester          | Attribuut                   | Beschrijft een Student (huidig semester), geen eigen levenscyclus                                                                                               |
| Activiteit        | Entiteit                    | Heeft type, datum, duur, koppeling aan challenge en beroepstaken                                                                                                |
| Activiteitstype   | Attribuut                   | Enum op Activiteit: CHALLENGE / OPDRACHT / WORKSHOP / COMPETENTIE / EIGEN                                                                                       |
| Architectuurlaag  | Entiteit (referentie)       | Vaste lijst uit HBO-i raamwerk, wordt niet aangemaakt door gebruiker                                                                                            |
| HboiActiviteit    | Entiteit (referentie)       | Vaste lijst: analyseren t/m manage & control                                                                                                                    |
| Beheersingsniveau | Entiteit (referentie)       | Vaste lijst: 1–4 met naam en beschrijving                                                                                                                       |
| Beroepstaak       | Entiteit (referentie)       | Combinatie van architectuurlaag + activiteit + niveau — hart van het raamwerk                                                                                   |
| Leeruitkomst      | Buiten scope (PoC)          | Fontys-specifiek, niet op de HBO-i server, te complex voor PoC                                                                                                  |
| Cursusinhoud      | Buiten scope (domein)       | Gebruiker ervaart dit niet direct — leeft als technisch concept (Chunk) in de RAG-pipeline, niet in het domein                                                  |
| Module            | Buiten scope (structuur)    | Canvas-navigatiestructuur valt buiten scope — inhoud wordt technisch geïndexeerd maar leeft niet in het domein                                                  |
| Opdracht          | Buiten scope                | Canvas-concept, valt buiten systeemgrens                                                                                                                        |
| Workshop          | Attribuut / Activiteitstype | Als activiteitstype is het een enum-waarde; als Coach een workshop *aanbiedt* is het een Activiteit van het type WORKSHOP                                       |
| Voortgang         | Gedrag / Berekend           | Geen entiteit — wordt afgeleid uit gelogde activiteiten en beroepstaakkoppelingen                                                                               |
| Gesprek           | Entiteit                    | Heeft een eigen levenscyclus per student, bevat berichten                                                                                                       |
| Bericht           | Entiteit                    | Onderdeel van gesprek, heeft rol (student/assistent), inhoud en timestamp                                                                                       |
| Nudge             | Gedrag                      | Het systeem *attendeert* — dat is gedrag, geen ding dat wordt opgeslagen                                                                                        |
| Leercyclus        | Buiten scope (PoC)          | Informatief concept in de Stappenplan-tab, geen eigen data                                                                                                      |
| Fase              | Attribuut                   | Mogelijke enum op Challenge (in welke fase zit je?), niet verplicht voor PoC                                                                                    |
| Portfolio         | Buiten scope                | Portflow beheert dit, niet dit systeem                                                                                                                          |
| Bewijsstuk        | Buiten scope                | Hoort bij Portflow / portfolio, niet bij dit systeem                                                                                                            |
| Profiel           | Attribuut                   | Beschrijft Student (naam, email, semester) — geen aparte entiteit nodig                                                                                         |
| Suggestie         | Gedrag                      | Het systeem *suggereert* een koppeling — dat is gedrag, de koppeling zelf is de entiteit                                                                        |
| Validatie         | Entiteit                    | Een expert valideert een activiteit/deelproduct — heeft datum, oordeel en toelichting; eigen levenscyclus                                                       |
| Semesterplan      | Entiteit                    | Overzicht van gekozen beroepstaken en activiteiten voor een semester — coach en student bespreken dit samen                                                     |

---

## Uitkomst

Na filtering blijven de volgende **echte entiteiten** over:

- Student
- Coach *(heeft eigen relatie met meerdere studenten)*
- Challenge
- Activiteit
- Validatie *(expert valideert een activiteit)*
- Semesterplan *(overzicht beroepstaken per semester, besproken met coach)*
- Beroepstaak *(referentie — vaste HBO-i lijst)*
- Architectuurlaag *(referentie)*
- HboiActiviteit *(referentie)*
- Beheersingsniveau *(referentie)*
- Beroepstaakkoppeling *(koppeltabel tussen Activiteit en Beroepstaak)*
- Gesprek
- Bericht

De volgende termen zijn **rollen van een Docent**:

- Coach — begeleidt de student op procesniveau; bewaakt het semesterplan en de voortgang over competenties
- Expert — valideert een deelproduct op inhoudelijk vakgebied; eenmalig of incidenteel contact
- Docent — biedt workshops aan en signaleert patronen in een cohort

> **Noot:** Coach, Expert en Docent zijn alle drie docenten binnen Fontys — geen generieke gebruikers. Coach is daarnaast ook een entiteit omdat hij een persistente relatie heeft met specifieke studenten.

De volgende termen vallen **buiten scope** voor de PoC:

- Module, Opdracht, Portfolio, Bewijsstuk, Leeruitkomst, Leercyclus, Cursusinhoud

> **Technische noot:** `Chunk` leeft niet in het domein maar wel in de technische architectuur — het is het opslagformaat van de RAG-pipeline. Hoort thuis in het datamodel en de C4-diagrammen, niet hier.

---

---

# Domeinmodel

**Project:** Activity First LMS  
**Student:** Jan van Hest | Semester 6 | HBO-ICT Open Learning | Fontys  
**Sprint:** 2–3  
**Doel van dit document:** Domeinmodel op basis van de gefilterde entiteiten uit stap 2. Beschrijft klassen, attributen en relaties zoals de gebruiker die ervaart — geen technische implementatiedetails.

---

## Klassendiagram (PlantUML)

```
@startuml Domeinmodel_ActivityFirstLMS

skinparam classAttributeIconSize 0
skinparam classFontSize 13
skinparam packageStyle rectangle
hide empty methods

title Domeinmodel — Activity First LMS

package "Begeleidingsdomein" {

    abstract class Docent {
        + naam: String
        + email: String
        + rol: DocentRol
    }

    class Coach extends Docent {
    }

    class Expert extends Docent {
    }

    class Validatie {
        + datum: Date
        + oordeel: ValidatieOordeel
        + toelichting: String
    }

    class Semesterplan {
        + semester: Integer
        + aangemaakt_op: Date
    }

}

package "Studentdomein" {

    class Student {
        + naam: String
        + email: String
        + semester: Integer
        + opleiding: String
    }

    class Challenge {
        + titel: String
        + beschrijving: String
        + status: ChallengeStatus
        + startdatum: Date
        + einddatum: Date
    }

    class Activiteit {
        + omschrijving: String
        + type: ActiviteitsType
        + datum: Date
        + duur: Integer
    }

    class Beroepstaakkoppeling {
        + status: KoppelingStatus
        + toelichting: String
    }

}

package "HBO-i raamwerk" #lightgrey {

    class Beroepstaak {
        + beschrijving: String
    }

    class Architectuurlaag {
        + id: String
        + naam: String
    }

    class HboiActiviteit {
        + id: String
        + naam: String
    }

    class Beheersingsniveau {
        + niveau: Integer
        + naam: String
    }

}

package "Chatdomein" {

    class Gesprek {
        + aangemaakt_op: DateTime
    }

    class Bericht {
        + inhoud: String
        + rol: BerichtRol
        + timestamp: DateTime
    }

}

' Enumeraties
enum DocentRol {
    COACH
    EXPERT
    DOCENT
}

enum ValidatieOordeel {
    GOEDGEKEURD
    AFGEKEURD
    IN_BEHANDELING
}

enum ActiviteitsType {
    CHALLENGE
    OPDRACHT
    WORKSHOP
    COMPETENTIE
    EIGEN
}

enum ChallengeStatus {
    ACTIEF
    AFGEROND
    CONCEPT
}

enum KoppelingStatus {
    GESUGGEREERD
    BEVESTIGD
}

enum BerichtRol {
    STUDENT
    ASSISTENT
}

' Begeleidingsdomein relaties
Coach "1" -- "0..*" Student : begeleidt >
Coach "1" -- "0..*" Semesterplan : bespreekt >
Student "1" -- "0..*" Semesterplan : heeft >
Semesterplan "1" -- "0..*" Beroepstaakkoppeling : bevat >
Validatie "0..*" -- "1" Activiteit : valideert >
Validatie .. ValidatieOordeel

' Relaties studentdomein
Student "1" -- "0..*" Challenge : werkt aan >
Student "1" -- "0..*" Activiteit : logt >
Student "1" -- "0..*" Gesprek : voert >

Activiteit "0..*" -- "1" Challenge : hoort bij >
Activiteit "1" -- "0..*" Beroepstaakkoppeling : heeft >

' Koppeling naar HBO-i
Beroepstaakkoppeling "0..*" -- "1" Beroepstaak : verwijst naar >

' HBO-i raamwerk relaties
Beroepstaak "0..*" -- "1" Architectuurlaag
Beroepstaak "0..*" -- "1" HboiActiviteit
Beroepstaak "0..*" -- "1" Beheersingsniveau

' Chatdomein
Gesprek "1" -- "1..*" Bericht : bevat >

' Enumeraties koppelen
Docent .. DocentRol
Activiteit .. ActiviteitsType
Challenge .. ChallengeStatus
Beroepstaakkoppeling .. KoppelingStatus
Bericht .. BerichtRol
Validatie .. ValidatieOordeel

@enduml
```

---

## Klassendiagram (afbeelding).

![](https://portfolio-lti-production.s3.eu-west-1.amazonaws.com/fhict_instructure_com/8oozau8ta4nendl7148apld7tqzc?response-content-disposition=inline%3B%20filename%3D%22domein%20-activity%20-%20first.png%22%3B%20filename%2A%3DUTF-8%27%27domein%2520-activity%2520-%2520first.png&response-content-type=image%2Fpng&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAZUHNSBLFLRASQZLQ%2F20260518%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20260518T183053Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=c98d43e002530f7fbd715099ef06ec66fd3b00988852c037cf082c010a891da1)

## Toelichting per klasse

### Studentdomein

**Student** — de centrale gebruiker. Heeft een profiel (naam, email, semester, opleiding). Logt activiteiten, werkt aan challenges en voert gesprekken met de chatbot.

**Challenge** — het project of de opdracht waar een student aan werkt. Heeft een status (concept, actief, afgerond) en een looptijd. Eén student kan meerdere challenges hebben, maar werkt doorgaans aan één actieve.

**Activiteit** — een concrete leerhandeling gelogd door de student. Het type bepaalt de aard: CHALLENGE (werken aan een challenge), OPDRACHT (een formele opdracht), WORKSHOP (bijwonen of geven), COMPETENTIE (gericht aantonen van een beroepstaak), EIGEN (vrij formaat). Elke activiteit hoort bij één challenge.

**Beroepstaakkoppeling** — de verbinding tussen een activiteit en een beroepstaak uit het HBO-i raamwerk. Kan gesuggereerd zijn door het systeem of bevestigd door de student. De toelichting is de eigen onderbouwing van de student: "dit toont aan omdat..."

### HBO-i raamwerk

Dit package bevat **referentiedata** — vaste lijsten die niet door gebruikers worden aangemaakt maar door het systeem worden geladen (via de HBO-i server of seed-data).

**Beroepstaak** — de atomaire eenheid van het HBO-i raamwerk. Altijd een combinatie van architectuurlaag + activiteit + beheersingsniveau. Bijvoorbeeld: Software × Realiseren × Niveau 3.

**Architectuurlaag** — Software, Infrastructuur, Gebruikersinteractie, Organisatieprocessen, Hardware interfacing.

**HboiActiviteit** — Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control.

**Beheersingsniveau** — 1 (taakgericht), 2 (probleemgericht), 3 (situatiegericht), 4 (professiegericht).

### Begeleidingsdomein

**Coach** — begeleidt studenten op procesniveau. Heeft inzicht in activiteiten, beroepstaakkoppelingen en het semesterplan. Is een echte entiteit omdat hij een persistente relatie heeft met meerdere studenten — niet alleen andere rechten.

**Validatie** — een expert beoordeelt een deelproduct of activiteit. Heeft een datum, oordeel (goedgekeurd/afgekeurd/in behandeling) en toelichting. Hangt aan een Activiteit — de student logt "technische verkenning afgerond" en vraagt een expert die te valideren. Expert is een rol, niet een aparte klasse — dezelfde User kan als Expert of Coach optreden afhankelijk van de context.

**Semesterplan** — het overzicht van beroepstaken die een student dit semester wil aantonen. Coach en student bespreken dit samen. Bevat een set Beroepstaakkoppelingen die als doel zijn gesteld, niet als bewijs.

### Chatdomein

**Gesprek** — een chatsessie van een student met de assistent. Heeft een eigen levenscyclus en bevat één of meer berichten.

**Bericht** — één uitwisseling in een gesprek. De rol bepaalt wie het bericht heeft gestuurd: de student of de assistent.

---

## Ontwerpkeuzes

**Waarom geen aparte User-klasse?** Coach en Student zijn beide gebruikers maar hebben fundamenteel andere verantwoordelijkheden in het domein — een gedeelde User-basisklasse voegt voor de PoC complexiteit toe zonder waarde. Coach heeft een eigen entiteit met eigen relaties. Expert en Docent zijn rollen die later als uitbreiding kunnen worden toegevoegd.

**Waarom Beroepstaakkoppeling als aparte klasse?** Omdat de koppeling zelf attributen heeft (status, toelichting). Een simpele many-to-many relatie tussen Activiteit en Beroepstaak zou die informatie kwijtraken.

**Waarom Chunk niet in het domein?** Chunk is een technisch implementatiedetail van de RAG-pipeline. De gebruiker ervaart cursusinhoud via de chatbot, niet als directe entiteit. Chunk leeft in het datamodel en de architectuur.

**Waarom HboiActiviteit en niet Activiteit?** Om naamconflict te vermijden. De student logt een `Activiteit` (zijn eigen leerhandeling). Het HBO-i raamwerk kent ook een `Activiteit` (analyseren, adviseren etc.). Twee verschillende concepten, één woord — vandaar `HboiActiviteit` in de code.
