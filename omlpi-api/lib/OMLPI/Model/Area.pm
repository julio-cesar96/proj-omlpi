package OMLPI::Model::Area;
use Mojo::Base 'MojoX::Model';

sub list {
    my $self = shift;

    return $self->app->pg->db->select_p("area", [qw<id name>]);
}

1;
