package Mojolicious::Command::data_spreadsheet;
use Mojo::Base 'Mojolicious::Command';

use File::Copy;

has description => 'Generate data spreadsheet file on public directory';

sub run {
    my $self = shift;

    my $app = $self->app;
    $app->log->info("Generating file...");
    $app->model('Data')->get_all_data()
      ->then(sub {
        my $file = shift;

        my $home = $app->home;
        move($file->filename, $home->rel_file('public/data_spreadsheet.zip')) or die $!;

        $app->log->info("File generated!");
  });

  Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
}

1;
