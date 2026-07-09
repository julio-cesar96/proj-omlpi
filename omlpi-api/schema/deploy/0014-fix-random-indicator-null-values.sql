-- Deploy omlpi:0014-fix-random-indicator-null-values to pg
-- requires: 0013-indicator-subindicator-percent

BEGIN;

drop materialized view random_indicator_cache;
drop materialized view random_locale_indicator;

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
                  UNION
                  SELECT MAX(year)
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
                AND ( indicator_locale.value_relative IS NOT NULL OR indicator_locale.value_absolute IS NOT NULL )
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

create materialized view random_indicator_cache AS
  WITH random_data AS (
    SELECT
      locale_id,
      random_pick(area_a1) AS a1,
      random_pick(area_a2) AS a2,
      random_pick(area_a3) AS a3
    FROM random_locale_indicator
  ),
  max_year AS (
    SELECT MAX(year.max) AS year
    FROM (
      SELECT MAX(year)
      FROM indicator_locale
      UNION
      SELECT MAX(year)
      FROM subindicator_locale
    ) year
  )
  SELECT
    random_data.locale_id,
    (
      SELECT JSON_AGG("result")
      FROM (
        SELECT
          locale.id,
          CASE
            WHEN locale.type = 'city' THEN CONCAT(locale.name, ', ', state.uf)
            ELSE locale.name
          END AS name,
          locale.type,
          locale.latitude,
          locale.longitude,

          (
            SELECT JSON_AGG("all".result)
            FROM (
              SELECT ROW_TO_JSON("row") result
              FROM (
                SELECT
                  indicator.id,
                  indicator.description,
                  indicator.base,
                  indicator.concept,
                  indicator.is_percentage,
                  ROW_TO_JSON(area.*) AS area,
                  (
                    SELECT JSON_BUILD_OBJECT(
                      'year', indicator_locale.year,
                      'value_relative', indicator_locale.value_relative,
                      'value_absolute', indicator_locale.value_absolute
                    )
                    FROM indicator_locale
                      WHERE indicator_locale.indicator_id = indicator.id
                        AND indicator_locale.locale_id    = locale.id
                        AND indicator_locale.year         = ( SELECT year FROM max_year )
                    ORDER BY indicator_locale.year DESC
                    LIMIT 1
                  ) AS values
                FROM indicator
                JOIN area
                  ON area.id = indicator.area_id
                JOIN indicator_locale
                  ON indicator.id = indicator_locale.indicator_id
                    AND indicator_locale.locale_id = locale.id
                WHERE indicator.id IN (random_data.a1, random_data.a2, random_data.a3)
                  AND indicator_locale.year = ( SELECT year FROM max_year )
                ORDER BY indicator.id
              ) AS "row"
            ) AS "all"
          ) AS indicators

        FROM locale
        LEFT JOIN city
          ON locale.id = city.id
        LEFT JOIN state
          ON city.state_id = state.id
        WHERE locale.id = random_data.locale_id
          OR locale.id = 0
        ORDER BY locale.id ASC
      ) AS result
    ) "locales"
  FROM random_data;

COMMIT;
