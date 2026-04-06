export interface SeedChunk {
  title: string;
  source: string;
  content: string;
}

const pageOne = `In Pro Open Learning bepaal jij zelf wat je wilt leren en hoe je dat doet.
Dit stappenplan helpt je om gestructureerd te starten.
Planning en begeleiding zijn essentieel voor succes.`;

const stepOne = `Stap 1: Wat zijn je doelen dit semester?
Begin met het bepalen waar je aan wilt werken. Welke HBO-i competenties wil je ontwikkelen?
Welke leeruitkomsten passen bij jouw ambities? Verken de mogelijkheden en kies je focus voor dit semester.`;

const stepTwo = `Stap 2: Wat heb je daarvoor nodig?
Kies een passend project of challenge die aansluit bij jouw leeruitkomsten.
Je kunt kiezen tussen een groepschallenge of individueel project.
Bij een groepschallenge werk je samen met medestudenten aan een realistische opdracht van een externe opdrachtgever.
Bij een individueel project werk je zelfstandig aan een eigen project dat past bij jouw ambities.`;

const stepThree = `Stap 3: Hoe ga je dat dan doen?
Splits je project op in hanteerbare leeractiviteiten en zorg dat de complexiteit past bij je niveau.
Leer hoe je een groot project opdeelt in concrete, uitvoerbare stappen.
Zorg dat je werk uitdagend is, maar niet overweldigend.`;

const stepFour = `Stap 4: Hoe maak je alles inzichtelijk voor het semester?
Maak je plannen concreet en zorg voor goede documentatie.
Agile werken betekent werken in sprints met korte cyclussen van planning, uitvoering en reflectie.
Leeruitkomsten in Pro Open Learning helpen om je voortgang te documenteren.
Portflow bij Fontys ICT helpt om werk en competenties vast te leggen.
Een persoonlijk semesterplan bevat deadlines en mijlpalen.`;

const pageOneTip = `Tip: wacht niet tot je alles perfect hebt uitgedacht.
Begin met stap 1, maak keuzes en verfijn onderweg.
Gebruik je coach om feedback te krijgen en waar nodig bij te sturen.`;

const pageTwoIntro = `Persoonlijk Semesterplan:
Een flexibel hulpmiddel om richting te geven aan je semester, inhoudelijk en persoonlijk.
Het plan is kort, bondig en flexibel en vormt de basis voor coachinggesprekken.`;

const pageTwoCompetence = `Inhoud en PO zijn twee kanten van hetzelfde verhaal.
Een competentie aantonen gaat niet alleen over het product, maar ook over communicatie, samenwerking,
feedback verwerken en verantwoordelijkheid nemen.`;

const pageTwoQuestions = `Kernvragen voor het semesterplan:
1. Wat ga je doen en aan welke competenties koppel je dit?
2. Waarom is dit relevant voor het aantonen van competenties en de challenge?
3. Hoe ga je dat doen qua aanpak, stappen en middelen?
4. Welke expertise heb je nodig voor feedback, validatie of kennis?
5. Welke persoonlijke ontwikkeling neem je mee uit eerdere feedback of eigen observaties?`;

const pageTwoPo = `PO is een verplicht onderdeel wanneer je eerder feedback kreeg op niet-inhoudelijke zaken,
zoals communicatie, aanwezigheid, feedback geven of ontvangen, samenwerking of professioneel gedrag.`;

const pageTwoSprintUse = `Gebruik het semesterplan per sprint.
Controleer of het plan nog relevant is, vul aan of pas aan waar nodig,
gebruik het in coachinggesprekken en beschrijf in de eindreflectie hoe het richting gaf.`;

const pageTwoCoaching = `Coachingsmomenten:
Week 2 of 3 is de eerste bespreking met je coach.
Daarna volgen minimaal twee vervolggesprekken.
In de eindreflectie beschrijf je welke richting het plan gaf en welke aanpassingen je deed.`;

const pageTwoGuidelines = `Richtlijnen:
Houd het semesterplan kort en bondig, ongeveer 1 tot 2 A4.
Het plan is richtinggevend, niet dogmatisch.
Gebruik het actief in gesprekken en om keuzes te maken en expertise te benutten.`;

export const seedChunks: SeedChunk[] = [
  { source: 'Canvas - Stappenplan', title: 'Introductie Stappenplan', content: pageOne },
  { source: 'Canvas - Stappenplan', title: 'Stap 1: Doelen', content: stepOne },
  { source: 'Canvas - Stappenplan', title: 'Stap 2: Benodigdheden', content: stepTwo },
  { source: 'Canvas - Stappenplan', title: 'Stap 3: Aanpak', content: stepThree },
  { source: 'Canvas - Stappenplan', title: 'Stap 4: Inzichtelijk maken', content: stepFour },
  { source: 'Canvas - Stappenplan', title: 'Tip', content: pageOneTip },
  { source: 'Canvas - Persoonlijk Semesterplan', title: 'Introductie Semesterplan', content: pageTwoIntro },
  { source: 'Canvas - Persoonlijk Semesterplan', title: 'Inhoud en PO', content: pageTwoCompetence },
  { source: 'Canvas - Persoonlijk Semesterplan', title: 'Kernvragen', content: pageTwoQuestions },
  { source: 'Canvas - Persoonlijk Semesterplan', title: 'Wanneer is PO verplicht?', content: pageTwoPo },
  { source: 'Canvas - Persoonlijk Semesterplan', title: 'Gebruik per sprint', content: pageTwoSprintUse },
  { source: 'Canvas - Persoonlijk Semesterplan', title: 'Coachingsmomenten', content: pageTwoCoaching },
  { source: 'Canvas - Persoonlijk Semesterplan', title: 'Richtlijnen', content: pageTwoGuidelines },
];

