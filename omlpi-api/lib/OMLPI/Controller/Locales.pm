package OMLPI::Controller::Locales;
use Mojo::Base 'OMLPI::Controller';

sub list {
    my $c = shift;

    $c->render_later();
    $c->model('Locale')->list()
      ->then(sub {
          my $results = shift;

          return $c->render(json => { locales => $results->hashes }, status => 200);
      })
      ->catch(sub {
          my $err = shift;
          $c->app->log->error($err);
          $c->reply_exception();
      });
}

1;
