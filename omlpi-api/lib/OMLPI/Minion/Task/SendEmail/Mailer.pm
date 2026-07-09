package OMLPI::Minion::Task::SendEmail::Mailer;
use Mojo::Base -base;

use Email::Sender::Simple qw(sendmail);
use Email::Sender::Transport::SMTP::TLS;

use OMLPI::Utils;

has smtp_server   => $ENV{SMTP_SERVER};
has smtp_port     => $ENV{SMTP_PORT};
has smtp_username => $ENV{SMTP_USERNAME};
has smtp_password => $ENV{SMTP_PASSWORD};
has smtp_timeout  => 20;

has _transport => sub {
    my $self = shift;

    defined $self->smtp_server   or die "missing 'smtp_server'.";
    defined $self->smtp_port     or die "missing 'smtp_port'.";
    defined $self->smtp_username or die "missing 'smtp_username'.";
    defined $self->smtp_password or die "missing 'smtp_passwd'.";

    return Email::Sender::Transport::SMTP::TLS->new(
        helo     => "omlpi",
        host     => $self->smtp_server,
        timeout  => $self->smtp_timeout,
        port     => $self->smtp_port,
        username => $self->smtp_username,
        password => $self->smtp_password,
    );
};

sub send {
    my ($self, $email, $bcc) = @_;

    if (is_test()) {
        return 1;
    }

    sendmail($email, { transport => $self->_transport });
    sendmail($email, { transport => $self->_transport, to => $_ }) for @{$bcc || []};

    return 1;
}

1;
