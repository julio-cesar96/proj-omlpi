package OMLPI::Controller::Classifications;
use Mojo::Base 'OMLPI::Controller';

sub get {
    my $c = shift;

    $c->render_later();
    $c->model('Classification')->list()
      ->then(sub {
          my $results = shift;

          return $c->render(json => { classifications => $results->arrays->map(sub { $_->[0] } ) }, status => 200);
      })
      ->catch(sub {
          my $err = shift;
          $c->app->log->error($err);
          $c->reply_exception();
      });
}

1;
