package OMLPI::Minion::Task::SendEmail::Mailer::Template;
use Mojo::Base -base;

use Template;
use File::MimeInfo;
use MIME::Lite;
use Encode;

has to          => undef;
has subject     => undef;
has from        => undef;
has template    => undef;
has attachments => sub { [] };
has vars        => sub { {} };

sub build_email {
    my ($self) = @_;

    my $tt = Template->new(EVAL_PERL => 0);

    my $content ;
    $tt->process(
        \$self->template,
        $self->vars,
        \$content,
    );

    utf8::encode($content);
    my $email = MIME::Lite->new(
        To       => $self->to,
        Subject  => Encode::encode("MIME-Header", $self->subject),
        From     => $self->from,
        Type     => "text/html",
        Data     => $content,
        Encoding => 'base64',
    );

    for my $attachment (@{ $self->attachments }) {
        if (!ref($attachment->{fh}) || !$attachment->{fh}->isa("IO::Handle")) {
            die "invalid attachment.";
        }

        $email->attach(
            Path        => $attachment->{fh}->filename,
            Type        => mimetype($attachment->{fh}->filename),
            Filename    => $attachment->{name},
            Disposition => "attachment",
            Encoding    => "base64",
        );
    }

    return $email;
}

1;

