package OMLPI::Controller::UploadPlan;
use Mojo::Base 'OMLPI::Controller';

use DDP;

sub post {
    my $c = shift;

    $c->openapi->valid_input() or return;

    my $plan_upload = $c->model('PlanUpload')->create(%{ $c->req->params->to_hash });

    return $c->render(json => { id => $plan_upload }, status => 200);
}

1;
