use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Test;

my $t = test_instance();
my $pg = $t->app->pg;
my $db = $pg->db;

eval {
    $db->query(qq{truncate "$_" restart identity})
      for qw(plan_upload minion_jobs minion_locks minion_workers);
};
ok $@ eq '' || $@ =~ m{relation "minion_(jobs|locks|workers)" does not exist at};

subtest_buffered 'UploadPlan | post' => sub {

    my $message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur dignissim lorem sit amet.';

    $t->post_ok("/v2/upload_plan", form => {
        name      => 'Junior M',
        message   => $message,
        email     => 'carlos@appcivico.com',
        file      => { file => "$RealBin/../data/logo.pdf" },
      })
      ->status_is(200);

    $t->post_ok("/v2/upload_plan", form => {
        name      => 'Junior M',
        message   => $message,
        email     => 'carlos@appcivico.com',
        file      => { file => "$RealBin/../data/logo.pdf" },
      })
      ->status_is(200);

    ok $t->app->minion->perform_jobs();
    my $stats = $t->app->minion->stats;
    is $stats->{failed_jobs},   0, 'failed_jobs=0';
    is $stats->{finished_jobs}, 1, 'finished_jobs=1';
};


done_testing();
