package OMLPI::Controller::States;
use Mojo::Base 'OMLPI::Controller';

sub list {
    my $c = shift;

    $c->render_later();
    $c->model('State')->list()
      ->then(sub {
          my $results = shift;

          return $c->render(json => { states => $results->hashes }, status => 200);
      })
      ->catch(sub {
          my $err = shift;
          $c->app->log->error($err);
          $c->reply_exception();
      });
}

1;
