package OMLPI::Model::City;
use Mojo::Base 'MojoX::Model';

sub list {
    my ($self, %opts) = @_;

    my $state_id = $opts{state_id};

    return $self->app->pg->db->select_p(
        "city",
        [qw(id name latitude longitude)],
        {
            (
                defined $state_id
                ? ( 'state_id' => $state_id )
                : ()
            ),
        },
        { order_by => {'-asc' => 'name'} },
    );
}

sub get_name_with_uf {
    my ($self, $city_id) = @_;

    return $self->app->pg->db->select(
        ['city', ['state', id => 'state_id']],
        [\"city.name || ' — ' || state.uf AS name"],
    );
}

1;
