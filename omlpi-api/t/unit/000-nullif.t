use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use Test2::V0;
use OMLPI::Utils;

is nullif('foo', 'bar'), 'foo';
is nullif('', ''), undef;
is nullif(undef), undef;
is nullif(undef, undef), undef;
is nullif('foobar', ''), 'foobar';

done_testing();
