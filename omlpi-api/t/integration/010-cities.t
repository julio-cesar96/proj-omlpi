use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

my $t = test_instance();
my $pg = $t->app->pg;

subtest_buffered 'Cities | GET' => sub {

    $t->get_ok("/v2/cities")
      ->status_is(200)
      ->json_has('/cities/0/id')
      ->json_has('/cities/0/name')
      ->json_has('/cities/0/latitude')
      ->json_has('/cities/0/longitude');
};

subtest_buffered 'Cities | filter by state' => sub {

    my $state_id = 35;
    $t->get_ok("/v2/cities", form => { state_id => $state_id })
      ->status_is(200)
      ->json_has('/cities/0/name');

    is scalar @{$t->tx->res->json->{cities}}, 645;
};

done_testing();
