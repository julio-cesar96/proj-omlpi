package OMLPI::Model::Classification;
use Mojo::Base 'MojoX::Model';

sub list {
    my $self = shift;

    return $self->app->pg->db->query_p(<<'SQL_QUERY');
      SELECT DISTINCT(classification) AS classification
      FROM subindicator
      ORDER BY classification
SQL_QUERY
}


1;
