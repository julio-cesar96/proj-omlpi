use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

my $t = test_instance();
my $pg = $t->app->pg;

$t->get_ok("/v2/data/download")
  ->status_is(200);

my $headers = $t->tx->res->content->headers;
like $headers->header('content-disposition'), qr{^attachment;\s*filename="};

done_testing();
