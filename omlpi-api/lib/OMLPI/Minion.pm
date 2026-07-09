package OMLPI::Minion;
use Mojo::Base 'Mojolicious::Plugin';

use Minion;
use Mojo::Loader qw(find_modules load_class);
use OMLPI::DatabaseConnection;

my $minion;

sub register {
    my ($self, $app, $conf) = @_;

    push @{$app->commands->namespaces}, 'Minion::Command';
    my $pg = $app->pg;
    $minion = Minion->new(Pg => $pg)->app($app);
    $app->helper(minion => sub { $minion });

    # Loading tasks
    my $namespace = __PACKAGE__ . "::Task";
    for my $module (find_modules $namespace) {
        $app->log->debug("Loading task '$module'");
        my $err = load_class $module;
        die(qq{Can't load task "$module" failed: $err}) if ref $err;

        $app->plugin($module);
        $app->log->debug("Task '$module' registered successfully!");
    }
}

sub instance {
    return $minion if defined $minion;
    my $pg = OMLPI::DatabaseConnection->get_mojo_pg();
    $minion = Minion->new(Pg => $pg);

    return $minion;
}

1;
