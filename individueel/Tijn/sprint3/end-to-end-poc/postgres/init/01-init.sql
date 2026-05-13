CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS student (
  id SERIAL PRIMARY KEY,
  naam TEXT NOT NULL,
  opleiding TEXT,
  semester INTEGER,
  project_beschrijving TEXT
);

CREATE TABLE IF NOT EXISTS voortgang (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  laag TEXT NOT NULL,
  activiteit TEXT NOT NULL,
  niveau_behaald INTEGER,
  niveau_bezig INTEGER,
  toelichting TEXT
);

CREATE INDEX IF NOT EXISTS voortgang_student_idx ON voortgang(student_id);

CREATE TABLE IF NOT EXISTS activiteit (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  titel TEXT NOT NULL,
  type TEXT,
  datum DATE,
  afgerond BOOLEAN DEFAULT false,
  beschrijving TEXT
);

CREATE INDEX IF NOT EXISTS activiteit_student_datum_idx ON activiteit(student_id, datum);

CREATE TABLE IF NOT EXISTS hbo_chunk (
  id SERIAL PRIMARY KEY,
  laag TEXT,
  activiteit TEXT,
  niveau INTEGER,
  content TEXT NOT NULL,
  embedding vector(768)
);

-- Geen ivfflat index hier: die wordt op een lege tabel aangemaakt en heeft dan
-- 0 centroids, waardoor cosine-search 0 rijen vindt na seeding. Voor 15 rijen
-- is sequential scan instant. Bij meer data kan een HNSW index toegevoegd
-- worden NA het seeden, of de ivfflat-index opnieuw gebouwd worden met REINDEX.
