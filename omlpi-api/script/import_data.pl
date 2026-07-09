#!/usr/bin/env perl
use Mojo::Base -strict;
use FindBin qw($RealBin);
use lib "$RealBin/../lib";

use OMLPI::Logger qw(get_logger);
use OMLPI::DatabaseConnection;

use Text::CSV;
use Tie::Handle::CSV;
use Scope::OnExit;
use Archive::Zip;
use File::Temp qw(:POSIX);
use Data::Printer;
use Data::Dumper;
use OMLPI::Utils qw(nullif trim);
use Digest::MD5;
use DB_File;

my $logger = get_logger();

$logger->info("Starting data import...");
my $dataset = 'latest';

my $filepath = "$RealBin/../resources/dataset/${dataset}";
if (!-e $filepath) {
    $logger->logdie("File '$filepath' not found.");
}

$logger->info("Getting the file checksum");
open my $fh, '<', $filepath or $logger->logdie($!);
binmode($fh);
my $checksum = Digest::MD5->new->addfile($fh)->hexdigest;
close $fh;
$logger->info("Dataset checksum: $checksum");

# Get the last database update checksum
my $pg            = get_mojo_pg();
my $db            = $pg->db;
my $last_checksum = $db->query("select value from config where name = 'DATASET_CHECKSUM'")->hash;
if (defined($last_checksum)) {
    my $last_checksum_value = $last_checksum->{value};
    $logger->info(sprintf "Last checksum: $last_checksum_value");
    if ($checksum eq $last_checksum_value) {
        $logger->info("There is nothing to update on your database!");
        exit 0;
    }
}
$logger->info("New dataset! Let's import data!");

$logger->info("Uncompressing file '$dataset'...");
my $zip = Archive::Zip->new($filepath);
$logger->info("File uncompressed!");

$logger->info("Loading areas");
my %areas = map { $_->{name} => $_->{id} } @{$pg->db->select('area', [qw<id name>])->hashes};

my %locales = map { $_->{id} => 1 } @{$pg->db->select('locale', [qw(id)])->hashes};

eval {
    my $tx = $db->begin();
    {
        my $file = 'indicadores.csv';
        $logger->info("Loading indicators...");
        my $member = $zip->memberNamed($file) or $logger->logdie("File '${file}' not found");
        my $tmp    = tmpnam();
        on_scope_exit { unlink $tmp };
        $member->extractToFileNamed($tmp);

        my $sql_query = 'INSERT INTO indicator (id, description, area_id, base, ods, concept, is_percentage) VALUES ';
        my @binds     = ();
        my $csv       = Tie::Handle::CSV->new($tmp, header => 0, sep_char => ';');
        <$csv>;    # Skip header
        while (my $line = <$csv>) {
            my @ods = split m{\D+}, trim($line->[5]);
            my $ods;
            $ods = '{' . join(',', @ods) . '}' if scalar @ods > 0;

            $sql_query .= "(?, ?, ?, ?, ?, ?, ?), ";

            push @binds, $line->[0], $line->[1], $line->[2], $line->[3], $ods, $line->[4], $line->[6];
        }
        close $csv;

        $sql_query =~ s{, $}{};
        $sql_query .= <<'SQL_QUERY';
          ON CONFLICT (id)
          DO UPDATE
            SET description   = EXCLUDED.description,
                base          = EXCLUDED.base,
                area_id       = EXCLUDED.area_id,
                ods           = EXCLUDED.ods,
                concept       = EXCLUDED.concept,
                is_percentage = EXCLUDED.is_percentage
SQL_QUERY

        $pg->db->query($sql_query, @binds);
        $logger->info("Indicators loaded!");
    }

    {
        $logger->info("Loading subindicators...");
        my $file   = 'desagregadores.csv';
        my $member = $zip->memberNamed($file) or $logger->logdie("File '${file}' not found");
        my $tmp    = tmpnam();
        on_scope_exit { unlink $tmp };
        $member->extractToFileNamed($tmp);

        my $sql_query
          = 'INSERT INTO subindicator (id, indicator_id, description, classification, is_percentage, is_big_number) VALUES ';
        my @binds = ();
        my $csv   = Tie::Handle::CSV->new($tmp, header => 1, sep_char => ';');

        my %dedup_subindicators;
        while (my $line = <$csv>) {
            my $id           = int($line->{ID}) or next;
            my $indicator_id = trim($line->{Indicador});
            next if $id == 0 || $dedup_subindicators{$indicator_id}->{$id}++;
            $sql_query .= '(?, ?, ?, ?, ?, ?), ';
            my $classification = trim($line->{Classificador});
            my $name           = trim($line->{Nome});
            push @binds,
              ($id, $indicator_id, $name, $classification, $line->{'É porcentagem'}, $line->{'É Big Number'});
        }

        $sql_query =~ s{, $}{};
        $sql_query .= <<"SQL_QUERY";
          ON CONFLICT (id, indicator_id)
          DO UPDATE
            SET description    = EXCLUDED.description,
                classification = EXCLUDED.classification,
                is_percentage  = EXCLUDED.is_percentage,
                is_big_number  = EXCLUDED.is_big_number
SQL_QUERY

        $pg->db->query($sql_query, @binds);
        $logger->info("Subindicators loaded!");
    }

    {
        $logger->info("Loading data...");
        my $file   = 'dados.csv';
        my $member = $zip->memberNamed($file) or $logger->logdie("File '${file}' not found");
        my $tmp    = tmpnam();
        on_scope_exit { unlink $tmp };
        $member->extractToFileNamed($tmp);

        $logger->info("Loading indicator data...");

        $logger->debug("Creating indicator_locale_bulk temporary table...");
        $db->query("CREATE TEMPORARY TABLE indicator_locale_bulk ( LIKE indicator_locale INCLUDING ALL )");

        $logger->debug("COPY to indicator_locale_bulk...");
        $db->query(<<'SQL_QUERY');
          COPY indicator_locale_bulk
            (indicator_id, locale_id, year, value_relative, value_absolute)
          FROM STDIN
          WITH CSV QUOTE '"' ENCODING 'UTF-8'
SQL_QUERY

        my $dbh = $db->dbh;
        my $csv = Tie::Handle::CSV->new($tmp, header => 1, sep_char => ';');

        #my $text_csv = *$csv->{opts}{csv_parser};
        #$text_csv->eol("\n");
        my $text_csv = Text::CSV->new(
            {
                binary => 1,
                eol    => "\n",
            }
        );

        my %dedup_indicators_data;
        open my $tmp_fh, '>:raw', '/tmp/indicators_data';

        my $line_num = 0;
        while (my $line = <$csv>) {
            $line_num++;
            $line = {%$line};
            my $area_id      = trim(delete $line->{Tema});
            my $year         = trim(delete $line->{Ano});
            my $indicator_id = trim(delete $line->{Indicador});
            my $locale_id    = trim(delete($line->{Localidade}));
            next if $indicator_id == 0;

            if ($indicator_id !~ m{^\d+$} || $locale_id !~ m{^\d+$} || $year !~ m{^\d+$} || $area_id !~ m{^\d+$}) {
                $logger->error("Há algo de errado com essa linha:\n" . Dumper $line);
                $logger->error("Skipping...");
                next;
            }

            if (!$locales{$locale_id}) {
                $logger->warn(sprintf "A locale id '%d' não existe no banco!", $locale_id);
                next;
            }

            my $dedup_key = "${locale_id}:${indicator_id}:${year}";
            if ($dedup_indicators_data{$dedup_key}) {
                $logger->warn(
                    sprintf(
                        "O indicador %d já foi carregado para a localidade %d no ano %d!",
                        $indicator_id,
                        $locale_id,
                        $year
                    )
                );
                next;
            }

            if ($line_num % 10000 == 0) {
                $logger->debug("indicator: row $line_num");
            }

            # Get indicator values
            my $value_relative = $line->{'D0_R'};
            my $value_absolute = $line->{'D0_A'};

            if (defined $value_relative) {
                $value_relative = trim($value_relative);
                $value_relative =~ s/\.//g;
                $value_relative = "0$value_relative" if $value_relative =~ /^,/;

                if ($value_relative =~ m{^[0-9+-]+,[0-9]+$}) {
                    $value_relative =~ s/,/./;
                    $value_relative = sprintf('%.1f', $value_relative);
                    $value_relative =~ s/\.0$//;
                }
                elsif ($value_relative =~ /[Ee]/) {
                    $value_relative =~ s/,/./;
                    $value_relative = sprintf('%.1f', $value_relative);
                    $value_relative =~ s/\.0$//;
                }
                else {
                    $value_relative = nullif(trim($value_relative), '');
                }
            }

            if (defined $value_absolute) {
                $value_absolute = trim($value_absolute);
                $value_absolute =~ s/\.//g;
                $value_absolute = "0$value_absolute" if $value_absolute =~ /^,/;

                if ($value_absolute =~ m{^[0-9+-]+,[0-9]+$}) {
                    $value_absolute =~ s/,/./;
                    $value_absolute = sprintf('%.1f', $value_absolute);
                    $value_absolute =~ s/\.0$//;
                }
                elsif ($value_absolute =~ /[Ee]/) {
                    $value_absolute =~ s/,/./;
                    $value_absolute = sprintf('%.1f', $value_absolute);
                    $value_absolute =~ s/\.0$//;
                }
                else {
                    $value_absolute = nullif(trim($value_absolute), '');
                }
            }

            # Insert data
            if (defined($value_relative) || defined($value_absolute)) {

                $logger->warn(
                    sprintf 'A linha %s ainda ficou com virgula %s %s', $line_num, $value_relative,
                    $dedup_key
                ) if defined $value_relative && $value_relative =~ /,/;
                $logger->warn(
                    sprintf 'A linha %s ainda ficou com virgula %s %s', $line_num, $value_absolute,
                    $dedup_key
                ) if defined $value_absolute && $value_absolute =~ /,/;

                $text_csv->combine($indicator_id, $locale_id, $year, $value_relative, $value_absolute);
                print $tmp_fh $text_csv->string();

                $dedup_indicators_data{$dedup_key} = 1;
            }
        }
        close $tmp_fh;

        open my $tmp_fh, '<:raw', '/tmp/indicators_data';
        while (my $l = <$tmp_fh>) {
            $dbh->pg_putcopydata($l);
        }
        close $tmp_fh;
        unlink '/tmp/indicators_data';

        $dbh->pg_putcopyend() or $logger->logdie("Error on pg_putcopyend()");
        $logger->debug("COPY ended!");

        $logger->debug("Copying rows from indicator_locale_bulk to indicator_locale");
        $db->query(<<'SQL_QUERY');
          INSERT INTO indicator_locale (indicator_id, locale_id, year, value_relative, value_absolute)
          SELECT indicator_id, locale_id, year, value_relative, value_absolute FROM indicator_locale_bulk
          ON CONFLICT (indicator_id, locale_id, year)
            DO UPDATE
            SET value_relative = EXCLUDED.value_relative,
                value_absolute = EXCLUDED.value_absolute
SQL_QUERY
        $logger->info("Indicators data loaded!");

        # Subindicators values
        $logger->debug("Creating subindicator_locale_bulk temporary table...");
        $db->query("CREATE TEMPORARY TABLE subindicator_locale_bulk ( LIKE subindicator_locale INCLUDING ALL )");

        $logger->debug("COPY to subindicator_locale_bulk...");
        $db->query(<<'SQL_QUERY');
          COPY subindicator_locale_bulk
            (indicator_id, subindicator_id, locale_id, year, value_relative, value_absolute)
          FROM STDIN
          WITH CSV QUOTE '"' ENCODING 'UTF-8'
SQL_QUERY

        # Seek and skip first line
        seek($csv, 0, 0) or $logger->logdie($!);
        <$csv>;

        unlink '/tmp/dedup_subindicators_data';
        dbmopen(my %dedup_subindicators_data, '/tmp/dedup_subindicators_data', 0666);


        $line_num = 0;
        while (my $line = <$csv>) {
            $line_num++;
            $line = {%$line};
            my $area_id      = delete $line->{Tema};
            my $year         = delete $line->{Ano};
            my $indicator_id = delete $line->{Indicador};
            my $locale_id    = delete $line->{Localidade};
            if (!$locales{$locale_id}) {
                $logger->warn(sprintf "A locale id '%d' não existe no banco!", $locale_id);
                next;
            }

            if ($line_num % 10000 == 0) {
                $logger->debug("subindicator: row $line_num");
            }

            my %subindicators = map { s{(_[RA])$}{}; $_ => 1 } grep {m{^D}} keys %{$line};
            for my $k (keys %subindicators) {
                my ($subindicator_id) = $k =~ m{^D([0-9]+)};
                next if $subindicator_id == 0;

                my $dedup_key = "${locale_id}:${indicator_id}:${subindicator_id}:${year}";
                if ($dedup_subindicators_data{$dedup_key}) {
                    $logger->warn(
                        sprintf(
                            "O desagregador id %d do indicador %d já foi carregado para a localidade %d no ano %d!",
                            $subindicator_id,
                            $indicator_id,
                            $locale_id,
                            $year
                        )
                    );
                    next;
                }

                # Get indicator values
                my $value_relative = $line->{"D${subindicator_id}_R"};
                my $value_absolute = $line->{"D${subindicator_id}_A"};
                if (defined $value_relative) {
                    $value_relative = trim($value_relative);
                    $value_relative =~ s/\.//g;
                    $value_relative = "0$value_relative" if $value_relative =~ /^,/;

                    if ($value_relative =~ m{^[0-9+-]+,[0-9]+$}) {
                        $value_relative =~ s/,/./;
                        $value_relative = sprintf('%.1f', $value_relative);
                        $value_relative =~ s/\.0$//;
                    }
                    elsif ($value_relative =~ /[Ee]/) {
                        $value_relative =~ s/,/./;
                        $value_relative = sprintf('%.1f', $value_relative);
                        $value_relative =~ s/\.0$//;
                    }
                    else {
                        $value_relative = nullif(trim($value_relative), '');
                    }
                }

                if (defined $value_absolute) {

                    $value_absolute = trim($value_absolute);
                    $value_absolute =~ s/\.//g;
                    $value_absolute = "0$value_absolute" if $value_absolute =~ /^,/;

                    if ($value_absolute =~ m{^[0-9+-]+,[0-9]+$}) {
                        $value_absolute =~ s/,/./;
                        $value_absolute = sprintf('%.1f', $value_absolute);
                        $value_absolute =~ s/\.0$//;
                    }
                    elsif ($value_absolute =~ /[Ee]/) {
                        $value_absolute =~ s/,/./;
                        $value_absolute = sprintf('%.1f', $value_absolute);
                        $value_absolute =~ s/\.0$//;
                    }
                    else {
                        $value_absolute = nullif(trim($value_absolute), '');
                    }
                }

                # Insert data if has data
                if (defined($value_relative) || defined($value_absolute)) {

                    $logger->warn(
                        sprintf 'A linha %s ainda ficou com virgula %s %s', $line_num, $value_relative,
                        $dedup_key
                    ) if defined $value_relative && $value_relative =~ /,/;
                    $logger->warn(
                        sprintf 'A linha %s ainda ficou com virgula %s %s', $line_num, $value_absolute,
                        $dedup_key
                    ) if defined $value_absolute && $value_absolute =~ /,/;

                    $text_csv->combine(
                        $indicator_id, $subindicator_id, $locale_id, $year, $value_relative,
                        $value_absolute
                    );
                    $dbh->pg_putcopydata($text_csv->string());
                    $dedup_subindicators_data{$dedup_key} = 1;
                }
            }
        }
        dbmclose %dedup_subindicators_data;

        $dbh->pg_putcopyend() or $logger->logdie("Error on pg_putcopyend()");
        $logger->debug("COPY ended!");

        $logger->debug("Copying rows from subindicator_locale_bulk to subindicator_locale");
        $db->query(<<'SQL_QUERY');
          INSERT INTO subindicator_locale (indicator_id, subindicator_id, locale_id, year, value_relative, value_absolute)
          SELECT indicator_id, subindicator_id, locale_id, year, value_relative, value_absolute
          FROM subindicator_locale_bulk
          ON CONFLICT (indicator_id, subindicator_id, locale_id, year)
            DO UPDATE
            SET value_relative = EXCLUDED.value_relative,
                value_absolute = EXCLUDED.value_absolute
SQL_QUERY
        $logger->info("Subindicators data loaded!");
    }

    # Wildcard
    $logger->info('Updating the wildcard values to NULL...');
    my $wildcard = 0x80000000 * -1;
    $db->query('UPDATE indicator_locale    SET value_absolute = NULL WHERE value_absolute = ?', $wildcard);
    $db->query('UPDATE indicator_locale    SET value_relative = NULL WHERE value_relative = ?', $wildcard);
    $db->query('UPDATE subindicator_locale SET value_absolute = NULL WHERE value_absolute = ?', $wildcard);
    $db->query('UPDATE subindicator_locale SET value_relative = NULL WHERE value_relative = ?', $wildcard);
    $logger->info('Wildcard values updated!');

    # Refresh random locale indicator materialized view
    $logger->info("Updating random_locale_indicator materialized view...");
    $db->query("REFRESH MATERIALIZED VIEW random_locale_indicator");
    $db->query("REFRESH MATERIALIZED VIEW random_indicator_cache");
    $logger->info("Materialized view refreshed!");

    # Update database checksum
    $logger->info("Updating the dataset checksum...");
    $db->query(<<'SQL_QUERY', $checksum);
      INSERT INTO config (name, value) VALUES ('DATASET_CHECKSUM', ?)
      ON CONFLICT (name) WHERE valid_to = 'infinity' DO
        UPDATE SET
          value = EXCLUDED.value,
          valid_to = 'infinity';
SQL_QUERY
    $logger->info("Dataset checksum updated!");

    # Update flag to update the all data file
    $logger->info("Need to generate the file...");
    $db->query(<<'SQL_QUERY');
      INSERT INTO config (name, value) VALUES ('GENERATE_DATA_FILE', 1)
      ON CONFLICT (name) WHERE valid_to = 'infinity' DO
        UPDATE SET
          value = EXCLUDED.value,
          valid_to = 'infinity';
SQL_QUERY
    $logger->info("File will be generated!");

    $tx->commit();
    $logger->info("Data loaded!");
};
if ($@) {
    $logger->fatal($@);
    exit 255;
}


