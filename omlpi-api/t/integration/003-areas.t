use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

my $t = test_instance();
my $pg = $t->app->pg;

$t->get_ok("/v2/areas")
  ->status_is(200)
  ->json_has('/areas')
  ->json_has('/areas/0/id')
  ->json_has('/areas/0/name');

done_testing();
