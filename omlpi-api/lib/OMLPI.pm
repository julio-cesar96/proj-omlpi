package OMLPI;
use Mojo::Base 'Mojolicious';

use OMLPI::Config;
use OMLPI::Controller;
use OMLPI::Logger;
use OMLPI::Utils;
use OMLPI::DatabaseConnection;

sub startup {
    my $self = shift;

    # Config
    OMLPI::Config::setup($self);
    $self->controller_class('OMLPI::Controller');

    # Logger
    get_logger();
    $self->plugin('Log::Any' => {logger => 'Log::Log4perl'});

    # Plugins
    $self->plugin('Model');
    $self->plugin('RenderFile');
    $self->plugin('ParamLogger');

    # OpenAPI
    $self->plugin(OpenAPI => {
        plugins => [qw(+SpecRenderer)],
        spec    => $self->static->file("openapi.yaml")->path,
    });

    # Helpers
    $self->helper(pg => sub { state $pg = OMLPI::DatabaseConnection->get_mojo_pg() });
    $self->helper('reply.exception' => sub { OMLPI::Controller::reply_exception(@_) });
    $self->helper('reply.not_found' => sub { OMLPI::Controller::reply_not_found(@_) });

    # Minion
    $self->plugin('OMLPI::Minion');
}

1;

