-- Deploy omlpi:0010-dataset-v8 to pg
-- requires: 0009-indicator-concept

BEGIN;

alter table indicator drop constraint indicator_description_key;
alter table indicator add column is_percentage boolean;

alter table subindicator
  add column is_percentage boolean,
  add column is_big_number boolean;

COMMIT;
