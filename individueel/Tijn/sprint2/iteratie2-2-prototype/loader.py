"""Eager loader voor de chatbot.

Haalt per sessie de complete context van een student op uit PostgreSQL en
geeft die terug in een dict-structuur die qua opzet lijkt op de student.json
uit iteratie 1. Zo hoeft de chatbot-code zelf nauwelijks te veranderen.

Gebruik:
    from loader import laad_student_context
    context = laad_student_context(student_id=1)
"""

import psycopg
from psycopg.rows import dict_row

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "lms",
    "user": "admin",
    "password": "admin",
}

def laad_student_context(student_id):
    """Haalt student, voortgang en activiteiten op. Geeft een dict terug."""
    with psycopg.connect(**DB_CONFIG, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            user = _haal_user(cur, student_id)
            if user is None:
                raise ValueError(f"Student met id {student_id} bestaat niet.")

            voortgang = _haal_voortgang(cur, student_id)
            activiteiten = _haal_activiteiten(cur, student_id)

    return {
        "user": user,
        "student_progress": voortgang,
        "activities": activiteiten,
    }

def lijst_studenten():
    """Geeft een lijst van alle studenten terug (id en naam). Handig voor de CLI."""
    with psycopg.connect(**DB_CONFIG, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, naam FROM student ORDER BY id")
            return cur.fetchall()

# --- Private helpers ---

def _haal_user(cur, student_id):
    cur.execute(
        """
        SELECT id, naam, opleiding, semester, project
        FROM student
        WHERE id = %s
        """,
        (student_id,),
    )
    return cur.fetchone()

def _haal_voortgang(cur, student_id):
    cur.execute(
        """
        SELECT c.laag AS competentie,
               c.naam AS activiteit,
               v.niveau_behaald,
               v.niveau_bezig,
               v.status,
               v.toelichting
        FROM student_competentie_voortgang v
        JOIN competentie c ON c.id = v.competentie_id
        WHERE v.student_id = %s
        ORDER BY c.laag, c.naam
        """,
        (student_id,),
    )
    return cur.fetchall()

def _haal_activiteiten(cur, student_id):
    cur.execute(
        """
        SELECT titel, type, datum, afgerond, beschrijving
        FROM activiteit
        WHERE student_id = %s
        ORDER BY datum
        """,
        (student_id,),
    )
    rijen = cur.fetchall()
    # Datum als string serialiseerbaar maken voor JSON-dump in de prompt
    for r in rijen:
        r["datum"] = r["datum"].isoformat()
    return rijen

# --- Quick-test als je het script direct runt ---

if __name__ == "__main__":
    import json
    for student in lijst_studenten():
        print(f"--- Student {student['id']}: {student['naam']} ---")
        context = laad_student_context(student["id"])
        print(json.dumps(context, ensure_ascii=False, indent=2, default=str))
        print()
