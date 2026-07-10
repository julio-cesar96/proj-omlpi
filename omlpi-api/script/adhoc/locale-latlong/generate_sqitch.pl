#!/usr/bin/env perl
use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../../../lib";

use Tie::Handle::CSV;
use Data::Printer;
use Data::Dumper;

my $csv = Tie::Handle::CSV->new("$RealBin/municipios.csv", header => 1);
while (my $r = <$csv>) {
    my $id = $r->{"\x{feff}codigo_ibge"};
    printf
        "UPDATE city SET latitude = '%f', longitude = '%f', capital = %d::boolean WHERE id = %d AND state_id = %d;\n",
        @{$r}{qw(latitude longitude capital)}, $id, $r->{codigo_uf};
}
close $csv;
