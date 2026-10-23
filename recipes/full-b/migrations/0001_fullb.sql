-- Consumer-owned synthetic data only. Run explicitly before starting HTTP.
-- Separate from Drizzle app and Better Auth migrations.
CREATE TABLE IF NOT EXISTS lego_app.fullb_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL,
  content text NOT NULL CHECK (octet_length(content) BETWEEN 1 AND 1024),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lego_app.fullb_jobs (
  note_id uuid NOT NULL REFERENCES lego_app.fullb_notes(id) ON DELETE CASCADE,
  owner_id text NOT NULL,
  job_id text NOT NULL,
  PRIMARY KEY (note_id, owner_id, job_id)
);
