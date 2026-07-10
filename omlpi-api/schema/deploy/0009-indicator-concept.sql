-- Deploy omlpi:0009-indicator-name-description to pg
-- requires: 0008-add-ods

BEGIN;

ALTER TABLE indicator ADD COLUMN concept TEXT;

COMMIT;
