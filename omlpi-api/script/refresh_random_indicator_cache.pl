#!/usr/bin/env perl
use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Logger qw(get_logger);
use OMLPI::DatabaseConnection;

use Data::Printer;
use Data::Dumper;
use OMLPI::Utils qw(nullif trim);

my $logger = get_logger();

$logger->info("Starting $0...");

my $pg = get_mojo_pg();
my $db = $pg->db;

$logger->info("Refreshing random_indicator_cache materialized view");
$db->query("REFRESH MATERIALIZED VIEW random_indicator_cache");
$logger->info("Materialized view refreshed!");

