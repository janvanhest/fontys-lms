# ADR-log - Fontys LMS Prototype

**Project:** Bouw je eigen Learning Management System (LMS)
**Auteur:** Tijn Knapen
**Bijgehouden vanaf:** Sprint 1 (maart 2026)

Een ADR (Architecture Decision Record) legt een infrastructuur- of architectuurbeslissing vast: wat is de keuze, waarom, welke alternatieven zijn overwogen, en wat zijn de gevolgen.

---

## ADR-001: LTI 1.3 boven LTI 1.1

**Status:** Geaccepteerd
**Datum:** maart 2026

**Context:**
Om ons prototype als tab of tool in Canvas in te sluiten hebben we een koppelstandaard nodig. Twee opties zijn beschikbaar: LTI 1.1 (oud) en LTI 1.3 (nieuw).

**Beslissing:**
We gebruiken LTI 1.3.

**Overwogen alternatieven:**
- LTI 1.1: nog ondersteund door Canvas maar wordt uitgefaseerd. Gebruikt OAuth 1.0a met een gedeeld geheim, kwetsbaar voor replay-aanvallen.

**Reden:**
LTI 1.3 gebruikt OIDC + JWT + OAuth 2.0, heeft nonce- en CSRF-bescherming, en geeft toegang tot LTI Advantage services (AGS, NRPS, Deep Linking). Nieuwe tools moeten LTI 1.3 gebruiken - LTI 1.1 is geen serieuze optie meer.

**Gevolgen:**
- Vereist een asymmetrisch RSA-sleutelpaar (publieke sleutel beschikbaar via JWK-endpoint)
- Vereist een Developer Key bij de Fontys Canvas-beheerder
- Tool moet drie endpoints aanbieden: `oidc_initiation_url`, `redirect_uri`, publiek JWK-endpoint

---

## ADR-002: Combinatie van LTI 1.3 en Canvas REST API

**Status:** Geaccepteerd
**Datum:** maart 2026

**Context:**
Voor de koppeling met Canvas zijn twee technische benaderingen mogelijk: alleen LTI 1.3 gebruiken voor insluiting en data, of LTI combineren met de Canvas REST API voor rijkere data.

**Beslissing:**
We combineren LTI 1.3 met de Canvas REST API.

**Overwogen alternatieven:**
- Alleen LTI 1.3: geeft gebruikerscontext en cursuscontext mee bij lancering, maar biedt geen toegang tot rijkere data zoals activiteitenstreams, opdrachten of modules.
- Alleen Canvas REST API: vereist aparte authenticatie en geeft geen native insluiting in Canvas.

**Reden:**
LTI verzorgt de authenticatie en insluiting (single sign-on, geen extra login). De REST API levert rijkere data die LTI alleen niet geeft. Samen zijn ze krachtiger dan elk afzonderlijk.

**Gevolgen:**
- De LTI-lancering levert het gebruikers-ID mee waarmee de REST API-aanroepen worden gedaan
- OAuth2 Developer Key nodig voor multi-user gebruik van de REST API
- Voor prototyping met eigen account kan een persoonlijk token worden gebruikt

---

## ADR-003: Canvas testomgeving boven betaomgeving voor ontwikkeling

**Status:** Geaccepteerd
**Datum:** maart 2026

**Context:**
Canvas biedt drie omgevingen: productie, beta en test. Tijdens ontwikkeling moet een niet-productieomgeving worden gebruikt.

**Beslissing:**
We gebruiken de Canvas testomgeving (`fontys.test.instructure.com`) voor ontwikkeling en integratieontwikkeling.

**Overwogen alternatieven:**
- Betaomgeving (`fontys.beta.instructure.com`): wordt elke zaterdag gereset naar de nieuwste Canvas-versie. Niet geschikt als stabiele ontwikkelomgeving.
- Productieomgeving: risico op verstoring van live data en gebruikers.

**Reden:**
De testomgeving is een stabiele kopie van productie en wordt niet wekelijks gereset. Dit maakt het geschikt voor consistente integratieontwikkeling.

**Gevolgen:**
- Testdata in de testomgeving kan afwijken van productie
- Developer Key moet ook in de testomgeving worden aangemaakt

---

## ADR-004: Persoonlijk toegangstoken voor prototyping

**Status:** Geaccepteerd (tijdelijk)
**Datum:** maart 2026

**Context:**
Toegang tot de Canvas REST API vereist authenticatie. Voor een multi-user applicatie is OAuth2 vereist, maar dat heeft een Developer Key nodig die door de Fontys Canvas-beheerder aangemaakt moet worden.

**Beslissing:**
Voor de prototypingfase gebruiken we een persoonlijk toegangstoken.

**Overwogen alternatieven:**
- OAuth2 meteen opzetten: vereist medewerking van de Canvas-beheerder en een publiek bereikbare server. Vertraagt de start van de prototypingfase.

**Reden:**
Studenten kunnen zelf een persoonlijk token aanmaken in hun Canvas-profiel, zonder afhankelijkheid van een beheerder. Dit is voldoende om de API te verkennen en een prototype te bouwen voor eigen gebruik.

**Gevolgen:**
- Prototype werkt alleen voor de eigen Canvas-account
- Vóór multi-user gebruik moet OAuth2 worden opgezet en een Developer Key worden aangevraagd
- Persoonlijke tokens mogen niet in code worden opgeslagen (gebruik omgevingsvariabelen)

---

*Dit document wordt bijgehouden gedurende het project. Nieuwe beslissingen worden hier toegevoegd als ze worden genomen.*

---

## Competentieverantwoording

**Infrastructure (Infrastructure) - Manage & Control - Niveau 1**

In dit document houd ik infrastructuurbeslissingen bij in de vorm van Architecture Decision Records. Per beslissing leg ik vast wat de keuze is, waarom die is gemaakt, welke alternatieven zijn overwogen en wat de gevolgen zijn. Dit zorgt ervoor dat de infrastructuur bewust en controleerbaar wordt opgebouwd en dat keuzes later terug te vinden en te verantwoorden zijn. Hiermee toon ik aan dat ik infrastructuurcomponenten beheers en configureer op een gestructureerde en herleidbare manier.
