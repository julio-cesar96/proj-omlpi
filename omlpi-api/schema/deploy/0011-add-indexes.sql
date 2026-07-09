-- Deploy omlpi:0011-add-indexes to pg
-- requires: 0010-dataset-v8

BEGIN;

create extension btree_gin;

create index idx_indicator_locale_year on indicator_locale using gin(indicator_id, locale_id, year);
create index idx_subindicator_locale_year on subindicator_locale using gin(indicator_id, subindicator_id, locale_id, year);

COMMIT;
