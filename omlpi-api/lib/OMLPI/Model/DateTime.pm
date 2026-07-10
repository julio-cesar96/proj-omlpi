package OMLPI::Model::DateTime;
use Mojo::Base 'MojoX::Model';

use DateTime::Format::DateParse;

sub now {
    my $self = shift;

    my $res = $self->app->pg->db->query("SELECT NOW()");

    return DateTime::Format::DateParse->parse_datetime($res->array->[0]);
}

1;
