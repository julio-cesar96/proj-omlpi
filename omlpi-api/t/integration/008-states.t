use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

my $t = test_instance();
my $pg = $t->app->pg;

$t->get_ok("/v2/states")
  ->status_is(200)
  ->json_has('/states/0/id')
  ->json_has('/states/0/latitude')
  ->json_has('/states/0/longitude')
  ->json_is('/states/0/name', 'Acre');

is scalar @{$t->tx->res->json->{states}}, 27;

done_testing();
