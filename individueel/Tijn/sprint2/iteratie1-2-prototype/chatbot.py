import json
import requests
from datetime import date

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen2.5:14b"

# --- Data laden ---

def laad_json(pad):
    with open(pad, "r", encoding="utf-8") as f:
        return json.load(f)

# --- Prompt opbouwen ---

def bouw_system_prompt(competenties, student):
    vandaag = date.today().strftime("%d %B %Y")
    return f"""Je bent een persoonlijke leerassistent voor een HBO-ICT student op Fontys.
Je kent de student, zijn voortgang, zijn planning en het competentieframework uit je hoofd.
Je antwoordt altijd in het Nederlands.
Vandaag is het {vandaag}.

GEDRAGSREGELS:
- Verwijs NOOIT naar "de data", "het studentobject", "de JSON" of "de context". Je weet dit gewoon.
- Verzin NOOIT informatie, datums of structuur die niet in de gegevens hieronder staat.
- Als je een planning geeft, gebruik je alleen de activiteiten en datums die hieronder staan. Verzin geen weekindeling.
- Als je een competentiedefinitie noemt, citeer je die exact zoals hieronder beschreven.
- Geef concrete, gerichte antwoorden. Geen generieke adviezen.

COMPETENTIES (HBO-i framework):
{json.dumps(competenties, ensure_ascii=False, indent=2)}

STUDENT:
{json.dumps(student, ensure_ascii=False, indent=2)}"""

# --- Ollama aanroepen ---

def stel_vraag(system_prompt, vraag):
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": vraag}
        ],
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json()["message"]["content"]
    except requests.exceptions.ConnectionError:
        return "[FOUT] Ollama is niet bereikbaar. Is Ollama gestart?"
    except Exception as e:
        return f"[FOUT] {e}"

# --- Testscenarios ---

SCENARIOS = [
    {
        "nummer": 1,
        "beschrijving": "Voortgang en advies over een specifieke competentie",
        "vraag": "Ik wil Infrastructure Analyse niveau 2 behalen. Wat moet ik daarvoor doen?"
    },
    {
        "nummer": 2,
        "beschrijving": "Planning opvragen",
        "vraag": "Wat staat er de komende dagen op mijn planning?"
    },
    {
        "nummer": 3,
        "beschrijving": "Koppeling competentie aan project",
        "vraag": "Welk document kan ik schrijven om Infrastructure Advise aan te tonen in mijn project?"
    }
]

def run_testscenarios(system_prompt):
    print("=" * 60)
    print("TESTSCENARIOS - Iteratie 1")
    print("=" * 60)

    for scenario in SCENARIOS:
        print(f"\nScenario {scenario['nummer']}: {scenario['beschrijving']}")
        print(f"Vraag: {scenario['vraag']}")
        print("-" * 40)
        antwoord = stel_vraag(system_prompt, scenario["vraag"])
        print(f"Antwoord:\n{antwoord}")
        print()

# --- Interactieve modus ---

def interactief(system_prompt):
    print("\n" + "=" * 60)
    print("INTERACTIEVE MODUS (typ 'stop' om te stoppen)")
    print("=" * 60)

    while True:
        vraag = input("\nJouw vraag: ").strip()
        if vraag.lower() == "stop":
            break
        if not vraag:
            continue
        antwoord = stel_vraag(system_prompt, vraag)
        print(f"\nAntwoord:\n{antwoord}")

# --- Main ---

def main():
    print("Chatbot laden...")

    competenties = laad_json("competenties.json")
    student = laad_json("student.json")
    system_prompt = bouw_system_prompt(competenties, student)

    print(f"Model: {MODEL}")
    print(f"Student: {student['user']['naam']}")
    print(f"Competenties geladen: {len(competenties['competenties'])} lagen\n")

    run_testscenarios(system_prompt)

    keuze = input("Wil je zelf vragen stellen? (j/n): ").strip().lower()
    if keuze == "j":
        interactief(system_prompt)

    print("\nKlaar.")

if __name__ == "__main__":
    main()
