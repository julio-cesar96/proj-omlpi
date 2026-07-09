package OMLPI::Controller::Areas;
use Mojo::Base 'OMLPI::Controller';

sub list {
    my $c = shift;

    $c->render_later();
    $c->model('Area')->list()
      ->then(sub {
          my $results = shift;

          return $c->render(json => { areas => $results->hashes }, status => 200);
      })
      ->catch(sub {
          my $err = shift;
          $c->app->log->error($err);
          $c->reply_exception();
      });
}

1;
