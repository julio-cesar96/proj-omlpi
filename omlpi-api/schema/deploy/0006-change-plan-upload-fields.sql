-- Deploy omlpi:0006-change-plan-upload-fields to pg
-- requires: 0005-array-intersect

BEGIN;

ALTER TABLE plan_upload
  DROP COLUMN locale_id,
  ADD COLUMN message TEXT;

COMMIT;
