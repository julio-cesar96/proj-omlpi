-- Deploy omlpi:0004-state-country to pg
-- requires: 0003-plan-upload

BEGIN;

ALTER TABLE region ADD COLUMN country_id INTEGER REFERENCES country(id);
UPDATE region SET country_id = 0;
ALTER TABLE region ALTER COLUMN country_id SET NOT NULL;

COMMIT;