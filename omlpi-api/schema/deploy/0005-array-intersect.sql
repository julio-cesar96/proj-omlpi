-- Deploy omlpi:0005-array-intersect to pg
-- requires: 0004-state-country

BEGIN;

CREATE OR REPLACE FUNCTION random_pick(p_items anyarray)
RETURNS anyelement AS
$$
  SELECT unnest(randomize.v)
  FROM (
    SELECT ARRAY_AGG(item ORDER BY RANDOM()) v
    FROM unnest(p_items) item
  ) randomize
  LIMIT 1;
$$ LANGUAGE SQL;

CREATE MATERIALIZED VIEW random_locale_indicator AS
  SELECT
    data.r AS locale_id,
    data.area_a1,
    data.area_a2,
    data.area_a3
  FROM
  (
    SELECT
      x.r,
      ARRAY_AGG(DISTINCT x.a1) FILTER (WHERE x.a1 IS NOT NULL) AS area_a1,
      ARRAY_AGG(DISTINCT x.a2) FILTER (WHERE x.a2 IS NOT NULL) AS area_a2,
      ARRAY_AGG(DISTINCT x.a3) FILTER (WHERE x.a3 IS NOT NULL) AS area_a3
      FROM (
        SELECT
          a1.indicator_id AS a1,
          a2.indicator_id AS a2, a3.
          indicator_id    AS a3,
          x.locale_id     AS r
            FROM (
              WITH max_year AS (
                SELECT MAX(year.max) AS year
                FROM (
                  SELECT MAX(year)
                  FROM indicator_locale
                  UNION SELECT MAX(year)
                  FROM subindicator_locale
                ) year
              )
              SELECT
                indicator.area_id,
                indicator_locale.indicator_id,
                indicator_locale.locale_id
              FROM indicator_locale
              JOIN indicator
                ON indicator.id = indicator_locale.indicator_id
              JOIN indicator_locale il2
                ON il2.indicator_id = indicator_locale.indicator_id
                  AND il2.locale_id = 1
                  AND il2.year = ( SELECT year FROM max_year )
              JOIN locale
                ON locale.id = indicator_locale.locale_id
              WHERE locale.type = 'city'
                AND indicator_locale.year = ( SELECT year FROM max_year )
            ) x
            LEFT JOIN indicator i1
              ON i1.id = x.indicator_id
                AND i1.area_id = 1
            LEFT JOIN indicator_locale a1
              ON a1.locale_id = x.locale_id AND a1.indicator_id = i1.id
            LEFT JOIN indicator i2
              ON i2.id = x.indicator_id
                AND i2.area_id = 2
            LEFT JOIN indicator_locale a2
              ON a2.locale_id = x.locale_id AND a2.indicator_id = i2.id
            LEFT JOIN indicator i3
              ON i3.id = x.indicator_id
                AND i3.area_id = 3
            LEFT JOIN indicator_locale a3
              ON a3.locale_id = x.locale_id AND a3.indicator_id = i3.id
      ) x
      GROUP BY x.r
  ) data
  WHERE data.area_a1 IS NOT NULL
    AND data.area_a2 IS NOT NULL
    AND data.area_a3 IS NOT NULL
;

COMMIT;
