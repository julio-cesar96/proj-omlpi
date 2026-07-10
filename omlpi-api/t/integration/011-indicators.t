use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

my $t = test_instance();
my $pg = $t->app->pg;

subtest_buffered 'Indicators | list' => sub {

    $t->get_ok("/v2/indicators")
      ->status_is(200)
      ->json_has('/indicators/0/id')
      ->json_has('/indicators/0/description')
      ->json_has('/indicators/0/ods/0/id')
      ->json_has('/indicators/0/ods/0/name')
      ->json_has('/indicators/0/ods/0/filename')
      ->json_has('/indicators/0/area/id')
      ->json_has('/indicators/0/area/name');
};

done_testing();
