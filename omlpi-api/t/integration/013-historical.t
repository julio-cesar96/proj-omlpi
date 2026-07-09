use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

my $t = test_instance();
my $pg = $t->app->pg;

subtest_buffered 'Get historical series' => sub {

    my $locale_id = 1100122;
    $t->get_ok("/v2/data/historical", form => { locale_id => $locale_id })
      ->json_has('/historical')
      ->status_is(200)
      ->json_has('/historical/0/id')
      ->json_has('/historical/0/indicators')
      ->json_has('/historical/0/indicators/0/id')
      ->json_has('/historical/0/indicators/0/description')
      ->json_has('/historical/0/indicators/0/base')
      ->json_has('/historical/0/indicators/3/subindicators')
      ->json_has('/historical/0/indicators/3/subindicators/0/classification')
      ->json_has('/historical/0/indicators/3/subindicators/0/data')
      ->json_has('/historical/0/indicators/3/subindicators/0/data/0/description')
      ->json_has('/historical/0/indicators/3/subindicators/0/data/0/values');
};

done_testing();
