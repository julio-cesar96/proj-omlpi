package OMLPI::Model::Historical;
use Mojo::Base 'MojoX::Model';

use Data::Printer;

sub get_historical {
    my ($self, %opts) = @_;

    my $area_id   = $opts{area_id};
    my $locale_id = $opts{locale_id};
    my @binds     = ((($area_id) x 2), $locale_id);

    return $self->app->pg->db->query(<<"SQL_QUERY", @binds);
      SELECT
        locale.id,
        CASE
          WHEN locale.type = 'city' THEN CONCAT(locale.name, ', ', state.uf)
          ELSE locale.name
        END AS name,
        locale.type,
        locale.latitude,
        locale.longitude,
        COALESCE(
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
                    SELECT ARRAY_AGG(indicator_values)
                    FROM (
                      SELECT
                        indicator_locale.year           AS year,
                        indicator_locale.value_relative AS value_relative,
                        indicator_locale.value_absolute AS value_absolute
                      FROM indicator_locale
                        WHERE indicator_locale.indicator_id = indicator.id
                          AND indicator_locale.locale_id = locale.id
                      ORDER BY indicator_locale.year DESC, indicator_locale.indicator_id ASC
                    ) indicator_values
                  ) AS values,

                  COALESCE(
                    (
                      SELECT ARRAY_AGG(subindicators)
                      FROM (
                        SELECT
                          subindicator.id,
                          subindicator.classification,
                          subindicator.description,
                          subindicator.is_percentage,
                          subindicator.is_big_number,
                          (
                            SELECT ARRAY_AGG(subindicator_values)
                            FROM (
                              SELECT
                                subindicator_locale.year,
                                subindicator_locale.value_relative,
                                subindicator_locale.value_absolute
                              FROM subindicator_locale
                              WHERE subindicator_locale.locale_id = locale.id
                                AND subindicator_locale.indicator_id = indicator.id
                                AND subindicator_locale.subindicator_id = subindicator.id
                              ORDER BY subindicator_locale.year DESC, subindicator_locale.indicator_id ASC
                            ) subindicator_values
                          ) AS values
                        FROM subindicator_locale
                        JOIN subindicator
                          ON subindicator.id = subindicator_locale.subindicator_id AND subindicator.indicator_id = indicator.id
                        WHERE subindicator_locale.locale_id = locale.id
                          AND subindicator_locale.indicator_id = indicator.id
                        GROUP BY subindicator.id, subindicator.classification, subindicator.description, subindicator.is_percentage, subindicator.is_big_number
                      ) AS subindicators
                    ),
                    ARRAY[]::record[]
                  ) AS subindicators
                FROM indicator
                JOIN area
                  ON area.id = indicator.area_id
                WHERE (?::text IS NULL OR area.id = ?::int)
                  AND EXISTS (
                    SELECT 1
                    FROM indicator_locale
                    WHERE indicator_locale.indicator_id = indicator.id
                      AND indicator_locale.locale_id = locale.id
                  )
                ORDER BY indicator.id
              ) AS "row"
            ) "all"
          ),
          '[]'::json
        ) AS indicators
      FROM locale
      LEFT JOIN city
        ON locale.type = 'city' AND locale.id = city.id
      LEFT JOIN state
        ON locale.type = 'city' AND city.state_id = state.id
      WHERE locale.id = ?
      GROUP BY 1,2,3
SQL_QUERY
}

1;
