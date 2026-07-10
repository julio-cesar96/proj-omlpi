package OMLPI::Utils;
use Mojo::Base -strict;

use Mojo::Util qw(trim);
use vars qw(@ISA @EXPORT);

@ISA    = (qw(Exporter));
@EXPORT = qw(is_test env nullif mojo_home trim);

state $_home;

sub is_test {
    if ($ENV{HARNESS_ACTIVE} || $0 =~ m{forkprove}) {
        return 1;
    }
    return 0;
}

sub nullif {
    my $value = shift;
    return defined $value && $value eq shift ? undef : $value;
}

sub env { return $ENV{${\shift}} }

sub mojo_home {
    return $_home if defined $_home;

    my $home = Mojo::Home->new();
    return $_home = $home->detect;
}

1;
