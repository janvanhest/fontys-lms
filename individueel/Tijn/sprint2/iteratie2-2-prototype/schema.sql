-- Iteratie 2 databaseschema
-- Minimaal schema om de drie scenario's uit iteratie 1 te ondersteunen
-- plus een vierde scenario op basis van activiteitdatums.

CREATE TABLE student (
    id            SERIAL PRIMARY KEY,
    naam          TEXT NOT NULL,
    opleiding     TEXT NOT NULL,
    semester      INTEGER,
    project       TEXT
);

CREATE TABLE competentie (
    id            SERIAL PRIMARY KEY,
    code          TEXT NOT NULL UNIQUE,
    naam          TEXT NOT NULL,
    laag          TEXT NOT NULL,
    definities    JSONB NOT NULL
);

CREATE TABLE student_competentie_voortgang (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    competentie_id  INTEGER NOT NULL REFERENCES competentie(id) ON DELETE CASCADE,
    niveau_behaald  INTEGER,
    niveau_bezig    INTEGER,
    status          TEXT NOT NULL,
    toelichting     TEXT,
    UNIQUE (student_id, competentie_id)
);

CREATE TABLE activiteit (
    id            SERIAL PRIMARY KEY,
    student_id    INTEGER NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    titel         TEXT NOT NULL,
    type          TEXT NOT NULL,
    datum         DATE NOT NULL,
    afgerond      BOOLEAN NOT NULL DEFAULT FALSE,
    beschrijving  TEXT
);

CREATE INDEX idx_activiteit_student_datum ON activiteit(student_id, datum);
CREATE INDEX idx_voortgang_student ON student_competentie_voortgang(student_id);
