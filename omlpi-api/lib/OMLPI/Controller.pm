package OMLPI::Controller;
use Mojo::Base 'Mojolicious::Controller';

use Scalar::Util qw(blessed);

sub reply_not_found {
    die {
        errors => [
            {
                message => "Page not found",
                path    => undef,
            }
        ],
        status => 404,
    };
}

sub reply_forbidden {
    die {
        errors => [
            {
                message => "Forbidden",
                path    => undef,
            }
        ],
        status => 403,
    };
}

sub reply_method_not_allowed {
    die {
        errors => [
            {
                message => "Method not allowed",
                path    => undef,
            }
        ],
        status => 405,
    };
}

sub reply_internal_server_error {
    die {
        errors => [
            {
                message => "Internal server error",
                path    => undef,
            }
        ],
        status => 500,
    };
}

sub reply_exception {
    my $c   = shift;
    my $err = shift;
    my $ret = eval { &_reply_exception($c, $err) };
    if ($@) {
        $c->app->log->fatal("reply_exception generated an exception!!!");
        $c->app->log->fatal($@);

    }
    return $ret if $ret;
}

sub _reply_exception {
    my $c        = shift;
    my $an_error = shift;

    if ($an_error) {

        if (ref $an_error eq 'HASH' && ref $an_error->{errors} eq 'ARRAY') {
            my $status = $an_error->{status} || 400;

            return $c->render(json => $an_error, status => $status);
        }

        $c->app->log->fatal(blessed($an_error)
              && UNIVERSAL::can($an_error, 'message') ? $an_error->message : $c->app->dumper($an_error));
    }
    return $c->render(
        json => {
            errors => [
                {
                    message => "Internal server error",
                    path    => undef,
                },
            ],
            status => 500,
        },
        status => 500,
    );
}

1;
