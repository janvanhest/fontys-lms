"""Seed-script voor de iteratie 2 database.

Leest competenties.json (uit iteratie 1) en students.json (deze map) en vult
daarmee de PostgreSQL database. Is idempotent: kan meerdere keren gedraaid
worden, leegt de tabellen eerst.

Gebruik:
    python seed.py
"""

import json
from pathlib import Path

import psycopg

# --- Configuratie ---

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "lms",
    "user": "admin",
    "password": "admin",
}

HIER = Path(__file__).parent
COMPETENTIES_JSON = HIER.parent / "iteratie1-2-prototype" / "competenties.json"
STUDENTS_JSON = HIER / "students.json"

LAAG_CODES = {
    "Infrastructure": "INF",
    "Software": "SW",
    "User Interaction": "UI",
    "Organisational Processes": "OP",
    "Hardware Interfacing": "HW",
}

ACTIVITEIT_CODES = {
    "Analyse": "An",
    "Advise": "Ad",
    "Design": "De",
    "Realise": "Re",
    "Manage & Control": "MC",
}

# --- Helpers ---

def laad_json(pad):
    with open(pad, "r", encoding="utf-8") as f:
        return json.load(f)

def competentie_code(laag, activiteit):
    return f"{LAAG_CODES[laag]}-{ACTIVITEIT_CODES[activiteit]}"

def bepaal_status(niveau_behaald, niveau_bezig):
    if niveau_behaald and not niveau_bezig:
        return "behaald"
    return "bezig"

# --- Seed-functies ---

def leeg_tabellen(cur):
    cur.execute("""
        TRUNCATE TABLE
            activiteit,
            student_competentie_voortgang,
            student,
            competentie
        RESTART IDENTITY CASCADE;
    """)

def seed_competenties(cur, competenties_data):
    rijen = 0
    for comp in competenties_data["competenties"]:
        laag = comp["naam"]
        for activiteit_naam, niveaus in comp["activiteiten"].items():
            cur.execute(
                """
                INSERT INTO competentie (code, naam, laag, definities)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    competentie_code(laag, activiteit_naam),
                    activiteit_naam,
                    laag,
                    json.dumps(niveaus, ensure_ascii=False),
                ),
            )
            rijen += 1
    return rijen

def seed_student(cur, student_data):
    cur.execute(
        """
        INSERT INTO student (naam, opleiding, semester, project)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """,
        (
            student_data["naam"],
            student_data["opleiding"],
            student_data.get("semester"),
            student_data.get("project"),
        ),
    )
    student_id = cur.fetchone()[0]

    for v in student_data["voortgang"]:
        cur.execute(
            "SELECT id FROM competentie WHERE code = %s",
            (competentie_code(v["laag"], v["activiteit"]),),
        )
        competentie_id = cur.fetchone()[0]
        cur.execute(
            """
            INSERT INTO student_competentie_voortgang
                (student_id, competentie_id, niveau_behaald, niveau_bezig, status, toelichting)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                student_id,
                competentie_id,
                v["niveau_behaald"],
                v["niveau_bezig"],
                bepaal_status(v["niveau_behaald"], v["niveau_bezig"]),
                v.get("toelichting"),
            ),
        )

    for a in student_data["activiteiten"]:
        cur.execute(
            """
            INSERT INTO activiteit
                (student_id, titel, type, datum, afgerond, beschrijving)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                student_id,
                a["titel"],
                a["type"],
                a["datum"],
                a["afgerond"],
                a.get("beschrijving"),
            ),
        )

    return student_id

# --- Main ---

def main():
    print("Seed-script gestart.")
    competenties_data = laad_json(COMPETENTIES_JSON)
    students_data = laad_json(STUDENTS_JSON)

    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            print("Tabellen leegmaken...")
            leeg_tabellen(cur)

            print("Competenties seeden...")
            aantal = seed_competenties(cur, competenties_data)
            print(f"  {aantal} competentie-activiteit combinaties toegevoegd")

            for i, student in enumerate(students_data["students"], start=1):
                print(f"Student {i} ({student['naam']}) seeden...")
                seed_student(cur, student)

        conn.commit()

    print("Klaar.")

if __name__ == "__main__":
    main()
