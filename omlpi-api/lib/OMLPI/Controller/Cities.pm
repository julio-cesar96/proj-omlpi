package OMLPI::Controller::Cities;
use Mojo::Base 'OMLPI::Controller';

sub list {
    my $c = shift;

    $c->openapi->valid_input() or return;
    my $state_id = $c->param('state_id');

    $c->render_later();
    $c->model('City')->list(state_id => $state_id)
      ->then(sub {
          my $results = shift;

          return $c->render(json => { cities => $results->hashes }, status => 200);
      })
      ->catch(sub {
          my $err = shift;
          $c->app->log->error($err);
          $c->reply_exception();
      });
}

1;
