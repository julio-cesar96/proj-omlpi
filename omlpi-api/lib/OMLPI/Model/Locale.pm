package OMLPI::Model::Locale;
use Mojo::Base 'MojoX::Model';

sub list {
    my $self = shift;

    return $self->app->pg->db->query_p(<<'SQL_QUERY');
      SELECT
        locale.id,
        CASE
          WHEN locale.type = 'city' THEN CONCAT(locale.name, ', ', state.uf)
          ELSE locale.name
        END AS name,
        locale.type,
        locale.latitude,
        locale.longitude
      FROM locale
      LEFT JOIN city
        ON locale.type = 'city' AND locale.id = city.id
      LEFT JOIN state
        ON locale.type = 'city' AND city.state_id = state.id
      ORDER BY (
        CASE locale.type
          WHEN 'country' THEN 1
          WHEN 'region'  THEN 2
          WHEN 'state'   THEN 3
          WHEN 'city'    THEN 4
        END
      )
SQL_QUERY
}

sub get_state_or_city_name_with_uf {
    my ($self, $id) = @_;

    return $self->app->pg->db->query(<<'SQL_QUERY', $id);
      SELECT
        locale.id,
        CASE
          WHEN locale.type = 'city' THEN CONCAT(locale.name, ' — ', state.uf)
          ELSE locale.name
        END AS name,
        locale.type
      FROM locale
      LEFT JOIN city
        ON locale.type = 'city' AND locale.id = city.id
      LEFT JOIN state
        ON locale.type = 'city' AND city.state_id = state.id
      WHERE locale.id = ?
SQL_QUERY
}

sub get_type {
    my ($self, $locale_id) = @_;

    my $type = $self->app->pg->db->select("locale", [qw(type)], { id => $locale_id })
      ->hash->{type};

    return $type;
}

sub get_locales_of_the_same_scope {
    my ($self, $locale_id) = @_;

    return $self->app->pg->db->query(<<'SQL_QUERY', $locale_id)->array->[0];
      SELECT
        ARRAY(
          SELECT *
          FROM UNNEST(ARRAY[city.id, state.id, region.id, region.country_id]) EXCEPT SELECT NULL
        )
      FROM locale
      LEFT JOIN city
        ON city.id = locale.id
      LEFT JOIN state
        ON state.id = city.state_id OR state.id = locale.id
      LEFT JOIN region
        ON region.id = state.region_id OR region.id = locale.id
      WHERE locale.id = ?
        AND locale.type IN('city', 'state', 'region');
SQL_QUERY
}

sub get_regions_of_a_country {
    my ($self, $country_id) = @_;

    return $self->app->pg->db->query(<<'SQL_QUERY', $country_id);
      SELECT *
      FROM region
      WHERE country_id = ?
SQL_QUERY
}

sub get_resume_template_type {
    my ($self, $locale_id) = @_;

    my $template_type = $self->app->pg->db->query(<<'SQL_QUERY', $locale_id)->hash->{template_type};
select
  case
    when locale.type in('region', 'state', 'country') or city.capital then 'full'
    else 'simple'
  end as template_type
from locale
left join city
  on locale.id = city.id and locale.type = 'city'
where locale.id = ?
SQL_QUERY

    return $template_type;
}

1;
