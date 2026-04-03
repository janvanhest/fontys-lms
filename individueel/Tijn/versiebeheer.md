# Versiebeheer - Fontys LMS Prototype

**Project:** Bouw je eigen Learning Management System (LMS)
**Auteur:** Tijn Knapen
**Tool:** Git + GitHub
**Repository:** github.com/janvanhest/fontys-lms
**Bijgehouden vanaf:** Sprint 1 (maart 2026)

Dit document legt vast hoe versiebeheer is ingericht voor het LMS-prototype: welke strategie we hanteren, hoe commits zijn opgebouwd, en welke versies er zijn opgeleverd per sprint.

---

## Branch-strategie

| Branch | Doel |
|--------|------|
| `dev` | Lopende ontwikkeling, standaard werkbranch |
| `feature/*` | Nieuwe functionaliteit, wordt gemerged naar `dev` |

Alle wijzigingen gaan via `dev`. Naar een stabiele release-branch wordt pas gewerkt als er werkende code is om te beschermen.

---

## Commit-conventies

Commits schrijf ik in het Engels, in de vorm:
`[type]: korte omschrijving`

| Type | Wanneer |
|------|---------|
| `feat` | Nieuwe functionaliteit |
| `fix` | Bug of fout hersteld |
| `docs` | Documentatie toegevoegd of aangepast |
| `chore` | Onderhoud, configuratie, opruimen |

Voorbeeld: `docs: add LTI 1.3 technical exploration`

---

## Versie-overzicht

| Versie | Sprint | Datum | Inhoud |
|--------|--------|-------|--------|
| v0.1 | Sprint 1 | maart 2026 | Analysefase afgerond: technische verkenning (Canvas API + LTI 1.3), ecosysteemanalyse, RAG-verkenning, reflectie, feedback-log. Nog geen werkende code. |
| v0.2 | Sprint 2 | april 2026 | Adviesfase + start realisatie: chatbot-strategie herzien, gebruikersinterview verwerkt, chatbot-scope uitgewerkt, iteratie 1 voltooid (onderzoeksdocument, prototype, conclusie). Eerste werkende prototype: Qwen 2.5 14B via Ollama, twee-laagse JSON-context, drie testscenarios. |

---

## Model- en componentversies

Naast code worden ook de gebruikte AI-modellen bijgehouden als infrastructuurcomponent.

| Component | Versie | Vanaf | Reden wissel |
|-----------|--------|-------|--------------|
| Python | 3.10.6 | iteratie 1 | Runtime voor het prototype |
| Ollama | 0.20.0 | iteratie 1 | Local model serving |
| LLM | Llama 3.1 8B | iteratie 1 start | Initiële keuze op basis van context window (128k) |
| LLM | Qwen 2.5 14B | iteratie 1 conclusie | Llama hallucineert structureel, Qwen beter in instructieopvolging en Nederlands |

Hardware referentie: RTX 3080, ~9GB VRAM bij Q4 quantisatie. Package-dependencies worden bijgehouden in `requirements.txt` (volgt in iteratie 2).

## Afspraken

- Persoonlijke tokens en wachtwoorden worden nooit in de repository opgeslagen. Gevoelige waarden gaan in omgevingsvariabelen (`.env`), en `.env` staat in `.gitignore`.
- Wijzigingen van teamleden worden via pull requests samengevoegd, zodat er altijd een moment van review is.

---

## Competentieverantwoording

**Infrastructure (Infrastructure) - Manage & Control - Niveau 1**

In dit document leg ik vast hoe het versiebeheer van het LMS-prototype is ingericht. Ik beschrijf de branch-strategie, de commit-conventies en de afspraken rondom gevoelige gegevens. Per sprint houd ik bij welke versie is opgeleverd en wat daarin zit. Dit zorgt ervoor dat de infrastructuur van het project bewust beheerd wordt en dat wijzigingen traceerbaar blijven. Hiermee toon ik aan dat ik procedures volg om ICT-infrastructuurcomponenten beschikbaar en correct geconfigureerd te houden.
