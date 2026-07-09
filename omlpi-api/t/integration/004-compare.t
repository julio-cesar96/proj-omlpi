use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

plan skip_all => 'skip for a while';

my $t = test_instance();
my $pg = $t->app->pg;

subtest_buffered 'Compare the locales' => sub {

    my $city_id = 2803609;

    $t->get_ok("/v2/data/compare", form => { locale_id => $city_id })
      ->status_is(200)
      ->json_has('/comparison/0/id')
      ->json_has('/comparison/0/name')
      ->json_has('/comparison/0/type')
      ->json_has('/comparison/0/indicators')
      ->json_has('/comparison/0/indicators/0/id')
      ->json_has('/comparison/0/indicators/0/base')
      ->json_has('/comparison/0/indicators/0/description')
      ->json_has('/comparison/0/indicators/0/values/0/year')
      ->json_has('/comparison/0/indicators/0/values/0/value_relative')
      ->json_has('/comparison/0/indicators/0/values/0/value_absolute')
      ->json_has('/comparison/1/id')
      ->json_has('/comparison/1/name')
      ->json_has('/comparison/1/type')
      ->json_has('/comparison/1/indicators')
      ->json_has('/comparison/1/indicators/0/id')
      ->json_has('/comparison/1/indicators/0/base')
      ->json_has('/comparison/1/indicators/0/description')
      ->json_has('/comparison/1/indicators/0/values/0/year')
      ->json_has('/comparison/1/indicators/0/values/0/value_relative')
      ->json_has('/comparison/1/indicators/0/values/0/value_absolute');
};

subtest_buffered 'Compare a country' => sub {

    $t->get_ok("/v2/data/compare", form => { locale_id => 0 })
      ->status_is(200)
      ->json_has('/comparison/0/id')
      ->json_has('/comparison/0/name')
      ->json_has('/comparison/0/type')
      ->json_has('/comparison/0/indicators')
      #->json_has('/comparison/0/indicators/0/id')
      #->json_has('/comparison/0/indicators/0/base')
      #->json_has('/comparison/0/indicators/0/description')
      #->json_has('/comparison/0/indicators/0/values/0/year')
      #->json_has('/comparison/0/indicators/0/values/0/value_relative')
      #->json_has('/comparison/0/indicators/0/values/0/value_absolute')
      ->json_has('/comparison/1/id')
      ->json_has('/comparison/1/name')
      ->json_has('/comparison/1/type')
      ->json_has('/comparison/1/indicators');
      #->json_has('/comparison/1/indicators/0/id')
      #->json_has('/comparison/1/indicators/0/base')
      #->json_has('/comparison/1/indicators/0/description')
      #->json_has('/comparison/1/indicators/0/values/0/year')
      #->json_has('/comparison/1/indicators/0/values/0/value_relative')
      #->json_has('/comparison/1/indicators/0/values/0/value_absolute');
};

done_testing();
