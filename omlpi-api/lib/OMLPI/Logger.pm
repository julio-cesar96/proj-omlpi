package OMLPI::Logger;
use Mojo::Base -strict;

use DateTime;
use IO::Handle;
use Log::Log4perl qw(:levels);
use OMLPI::Utils qw(is_test);

our @ISA = qw(Exporter);

our @EXPORT = qw(log_info log_fatal log_error get_logger log_trace);

our $instance;

sub get_logger {

    return $instance if $instance;

    my $test_is_folder;
    if (@ARGV) {
        $test_is_folder = $ARGV[-1] eq 't' || $ARGV[-1] eq 't/' || $ARGV[-1] eq './t' || $ARGV[-1] eq './t/';
    }

    if ($ENV{OMLPI_API_LOG_DIR}) {
        if (-d $ENV{OMLPI_API_LOG_DIR}) {
            my $date_now = DateTime->now->ymd('-');

            # vai ter q rever isso, quando é mojo..
            my $app_type = $0 =~ /\.psgi/ ? 'api' : &_extract_basename($0);

            my $log_file = $app_type eq 'api' ? "api.$date_now.$$" : "$app_type.$date_now";

            $ENV{OMLPI_API_LOG_DIR} = $ENV{OMLPI_API_LOG_DIR} . "/$log_file.log";
            print STDERR "Redirecting STDERR/STDOUT to $ENV{OMLPI_API_LOG_DIR}\n";
            close(STDERR);
            close(STDOUT);
            autoflush STDERR 1;
            autoflush STDOUT 1;
            open(STDERR, '>>', $ENV{OMLPI_API_LOG_DIR}) or die 'cannot redirect STDERR';
            open(STDOUT, '>>', $ENV{OMLPI_API_LOG_DIR}) or die 'cannot redirect STDOUT';

        }
        else {
            print STDERR "OMLPI_API_LOG_DIR is not a dir\n";
        }
    }
    else {
        print STDERR "OMLPI_API_LOG_DIR not configured\n";
    }

    Log::Log4perl->easy_init(
        {
            level  => $DEBUG,
            layout => (is_test() && $test_is_folder ? '' : '[%d{dd/MM/yyyy HH:mm:ss.SSS}] [%P] [%p] %m{indent=1}%n'),
            ($ENV{OMLPI_API_LOG_DIR} ? (file => '>>' . $ENV{OMLPI_API_LOG_DIR}) : ()),
            'utf8'    => 1,
            autoflush => 1,

        }
    );

    return $instance = Log::Log4perl::get_logger;
}

# logs
sub log_info {
    my (@texts) = @_;
    get_logger()->info(join ' ', @texts);
}

sub log_error {
    my (@texts) = @_;
    get_logger()->error(join ' ', @texts);
}

sub log_fatal {
    my (@texts) = @_;
    get_logger()->fatal(join ' ', @texts);
}

sub _extract_basename {
    my ($path) = @_;
    my ($part) = $path =~ /.+(?:\/(.+))$/;
    return lc($part);
}

sub log_trace {
    return unless is_test();

    push @ANDI::Test::trace_logs, @_;
}

1;
