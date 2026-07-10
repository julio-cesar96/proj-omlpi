package Mojo::Transaction::Role::PrettyDebug {
    use Mojo::Base -role;
    use Mojo::Util 'term_escape';

    use constant PRETTY => $ENV{TRACE} || $ENV{MOJO_CLIENT_PRETTY_DEBUG} || 0;

    after client_read => sub {
        my ($self, $chunk) = @_;
        my $url = $self->req->url->to_abs;
        my $err = $chunk =~ /1\.1\s[45]0/ ? '31' : '32';
        warn "\x{1b}[${err}m" . term_escape("-- Client <<< Server ($url)\n$chunk") . "\x{1b}[0m\n" if PRETTY;
    };

    around client_write => sub {
        my $orig  = shift;
        my $self  = shift;
        my $chunk = $self->$orig(@_);
        my $url   = $self->req->url->to_abs;
        warn "\x{1b}[32m" . term_escape("-- Client >>> Server ($url)\n$chunk") . "\x{1b}[0m\n" if PRETTY;
        return $chunk;
    };
};

package OMLPI::Test;
use Mojo::Base -strict;
use FindBin qw($RealBin);
use Test2::V0;
use Test2::Tools::Subtest qw(subtest_buffered subtest_streamed);
#use Test::Mojo;
use Test2::MojoX;
use OMLPI::Logger;

#use DateTime;
use OMLPI::Utils;
#use Data::Fake qw/ Core Company Dates Internet Names Text /;
use Data::Printer;
#use Mojo::Util qw(monkey_patch);
use JSON;

our @trace_logs;

sub trace_popall {
    my @list = @trace_logs;

    @trace_logs = ();

    return join ',', @list;
}

sub import {
    strict->import;

    $ENV{DISABLE_RPS_LIMITER} = 1;
    srand(time() ^ ($$ + ($$ << 15)));
    no strict 'refs';

    my $caller = caller;

    while (my ($name, $symbol) = each %{__PACKAGE__ . '::'}) {
        next if $name eq 'BEGIN';
        next if $name eq 'import';
        next unless *{$symbol}{CODE};

        my $imported = $caller . '::' . $name;
        *{$imported} = \*{$symbol};
    }
}

#my $t = Test::Mojo->with_roles('+StopOnFail')->new('OMLPI');
my $t = Test2::MojoX->new('OMLPI');
$t->ua->on(
    start => sub {
        my ($ua, $tx) = @_;
        $tx->with_roles('Mojo::Transaction::Role::PrettyDebug');
    }
);

sub test_instance {$t}
sub app           {$t->app}

1;
