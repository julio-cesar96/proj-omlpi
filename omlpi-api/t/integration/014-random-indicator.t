use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

#plan skip_all => 'skip for a while';

my $t = test_instance();
my $db = $t->app->pg->db;

subtest_buffered 'Get random indicator' => sub {

    # Test endpoint
    $t->get_ok("/v2/data/random_indicator")
      ->status_is(200)
      ->json_is('/locales/0/name', 'Brasil')
      ->json_has('/locales/0/indicators/0/area/name')
      ->json_has('/locales/0/indicators/0/description')
      ->json_has('/locales/0/indicators/0/values/year')
      ->json_has('/locales/0/indicators/0/values/value_absolute')
      ->json_has('/locales/0/indicators/0/values/value_relative')
      ->json_has('/locales/0/indicators/1/area/name')
      ->json_has('/locales/0/indicators/1/description')
      ->json_has('/locales/0/indicators/1/values/year')
      ->json_has('/locales/0/indicators/1/values/value_absolute')
      ->json_has('/locales/0/indicators/1/values/value_relative')
      ->json_has('/locales/1/name')
      ->json_has('/locales/1/indicators/0/area/name')
      ->json_has('/locales/1/indicators/0/description')
      ->json_has('/locales/1/indicators/0/values/year')
      ->json_has('/locales/1/indicators/0/values/value_absolute')
      ->json_has('/locales/1/indicators/0/values/value_relative')
      ->json_has('/locales/1/indicators/1/area/name')
      ->json_has('/locales/1/indicators/1/description')
      ->json_has('/locales/1/indicators/1/values/year')
      ->json_has('/locales/1/indicators/1/values/value_absolute')
      ->json_has('/locales/1/indicators/1/values/value_relative');
};

done_testing();
