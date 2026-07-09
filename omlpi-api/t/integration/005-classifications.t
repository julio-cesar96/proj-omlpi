use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

my $t = test_instance();
my $pg = $t->app->pg;

my $locale_id = 2803609;

subtest_buffered 'Classifications | GET' => sub {

    $t->get_ok("/v2/classifications")
      ->status_is(200)
      ->json_has('/classifications')
      ->json_has('/classifications/0');
    is ref $t->tx->res->json->{classifications}, 'ARRAY', 'classifications=array';
};

done_testing();
