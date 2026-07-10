package OMLPI::Model::Indicator;
use Mojo::Base 'MojoX::Model';

sub list {
    my $self = shift;

    return $self->app->pg->db->query_p(<<'SQL_QUERY');
      SELECT
        indicator.id,
        indicator.description,
        indicator.base,
        indicator.concept,
        ROW_TO_JSON(area.*) AS area,
        (
          SELECT JSON_AGG(ods.*)
          FROM (
            SELECT *
            FROM ods
            WHERE ods.id = ANY(indicator.ods)
          ) ods
        ) AS ods
      FROM indicator
      JOIN area
        ON area.id = indicator.area_id
      ORDER BY indicator.id
SQL_QUERY
}

1;
