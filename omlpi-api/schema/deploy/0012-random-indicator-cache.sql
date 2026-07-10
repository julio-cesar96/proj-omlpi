-- Deploy omlpi:0012-random-indicator-cache to pg
-- requires: 0011-add-indexes

BEGIN;

create extension tsm_system_rows;

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
      UNION SELECT MAX(year)
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
