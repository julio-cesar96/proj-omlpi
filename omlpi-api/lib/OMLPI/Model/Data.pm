package OMLPI::Model::Data;
use Mojo::Base 'MojoX::Model';

use Text::CSV;
use Number::Format;
use Excel::Writer::XLSX;
use File::Temp qw(tempfile);
use Mojo::Util qw(decode);
use OMLPI::Utils qw(mojo_home);
use IPC::Run qw(run);
use Archive::Zip qw( :ERROR_CODES :CONSTANTS );

use Data::Printer;

sub get {
    my ($self, %opts) = @_;

    my $year      = $opts{year};
    my $area_id   = $opts{area_id};
    my $locale_id = $opts{locale_id};
    my @binds     = ((($year) x 6), (($area_id) x 2), (($year) x 2), $locale_id);

    return $self->app->pg->db->query(<<"SQL_QUERY", @binds);
      SELECT
        locale.id,
        CASE
          WHEN locale.type = 'city' THEN CONCAT(locale.name, ', ', state.uf)
          ELSE locale.name
        END AS name,
        locale.type,
        locale.latitude,
        locale.longitude,
        COALESCE(
          (
            SELECT JSON_AGG("all".result)
            FROM (
              SELECT ROW_TO_JSON("row") result
              FROM (
                SELECT
                  indicator.id,
                  indicator.description,
                  indicator.base,
                  indicator.concept,
                  indicator.is_percentage,
                  ROW_TO_JSON(area.*) AS area,
                  (
                    SELECT ROW_TO_JSON(indicator_values)
                    FROM (
                      SELECT
                        indicator_locale.year           AS year,
                        indicator_locale.value_relative AS value_relative,
                        indicator_locale.value_absolute AS value_absolute
                      FROM indicator_locale
                        WHERE indicator_locale.indicator_id = indicator.id
                          AND indicator_locale.locale_id = locale.id
                          AND (?::int IS NULL OR indicator_locale.year = ?::int)
                      ORDER BY indicator_locale.year DESC, indicator_locale.indicator_id ASC
                      LIMIT 1
                    ) indicator_values
                  ) AS values,
                  (
                    SELECT JSON_AGG(ods.*)
                    FROM (
                      SELECT *
                      FROM ods
                      WHERE ods.id = ANY(indicator.ods)
                    ) ods
                  ) AS ods,
                  COALESCE(
                    (
                      SELECT ARRAY_AGG(subindicators)
                      FROM (
                        SELECT
                          subindicator.id,
                          subindicator.classification,
                          subindicator.description,
                          subindicator.is_percentage,
                          subindicator.is_big_number,
                          (
                            SELECT ROW_TO_JSON(subindicator_values)
                            FROM (
                              SELECT
                                subindicator_locale.year,
                                subindicator_locale.value_relative,
                                subindicator_locale.value_absolute
                              FROM subindicator_locale
                              WHERE subindicator_locale.indicator_id = indicator.id
                                AND subindicator_locale.subindicator_id = subindicator.id
                                AND subindicator_locale.locale_id = locale.id
                                AND (?::int IS NULL OR subindicator_locale.year = ?::int)
                              ORDER BY subindicator_locale.year DESC, subindicator_locale.indicator_id ASC
                              LIMIT 1
                            ) subindicator_values
                          ) AS values
                        FROM subindicator_locale
                        JOIN subindicator
                          ON subindicator.id = subindicator_locale.subindicator_id AND subindicator.indicator_id = indicator.id
                        WHERE subindicator_locale.locale_id = locale.id
                          AND subindicator_locale.indicator_id = indicator.id
                          AND (?::int IS NULL OR subindicator_locale.year = ?::int)
                        GROUP BY subindicator.id, subindicator.classification, subindicator.description, subindicator.is_percentage, subindicator.is_big_number
                      ) AS subindicators
                    ),
                    ARRAY[]::record[]
                  ) AS subindicators
                FROM indicator
                JOIN area
                  ON area.id = indicator.area_id
                WHERE (?::text IS NULL OR area.id = ?::int)
                  AND EXISTS (
                    SELECT 1
                    FROM indicator_locale
                    WHERE indicator_locale.indicator_id = indicator.id
                      AND indicator_locale.locale_id = locale.id
                      AND (?::int IS NULL OR indicator_locale.year = ?::int)
                  )
                ORDER BY indicator.id
              ) AS "row"
            ) "all"
          ),
          '[]'::json
        ) AS indicators
      FROM locale
      LEFT JOIN city
        ON locale.type = 'city' AND locale.id = city.id
      LEFT JOIN state
        ON locale.type = 'city' AND city.state_id = state.id
      WHERE locale.id = ?
      GROUP BY 1,2,3
SQL_QUERY
}

sub get_max_year {
    my ($self, %opts) = @_;

    my $locale_id = $opts{locale_id};
    my @binds = (($locale_id) x 4);

    return $self->app->pg->db->query(<<"SQL_QUERY", @binds);
      SELECT MAX(years.max) AS year
      FROM (
        SELECT MAX(year)
        FROM indicator_locale
        WHERE (?::int IS NULL OR locale_id = ?)
        UNION SELECT MAX(year)
        FROM subindicator_locale
        WHERE (?::int IS NULL OR locale_id = ?)
      ) years
SQL_QUERY
}

sub get_resume {
    my ($self, %opts) = @_;

    my $locale_id = $opts{locale_id};
    my $template_type = $self->app->model('Locale')->get_resume_template_type($locale_id);

    # Get template
    my $home = mojo_home();
    my $template = $home->rel_file("resources/resume/${template_type}.html")->to_abs;
    my $mt = Mojo::Template->new(vars => 1);

    # Fix encoding issues
    my $slurp = decode('UTF-8', $template->slurp);

    my $log = $self->app->log;

    # Create temporary directory
    my $dir = File::Temp->newdir(CLEANUP => 0);
    #my $dir = File::Temp->newdir(CLEANUP => 0, DIR => '/data');
    $log->debug("Temporary dir: " . $dir->dirname);

    $log->debug('Creating symlinks...');
    symlink $home->rel_file("resources/resume/$_"), $dir->dirname . "/$_"
      or die $!
        for qw<css img header.html>;

    # Create temporary file
    $log->debug('Creating temporary file...');
    my $fh = File::Temp->new(UNLINK => 0, SUFFIX => '.html', DIR => $dir->dirname);
    binmode $fh, ':utf8';
    $log->debug('Temporary file: ' . $fh->filename);

    # Get indicator values
    #my $year = $self->get_max_year(locale_id => $locale_id)->hash->{year};
    my $indicator_values = $self->app->pg->db->query(<<"SQL_QUERY", $locale_id);
      select
        indicator_locale.indicator_id,
        indicator_locale.value_absolute,
        indicator_locale.value_relative,
        indicator_locale.year,
        indicator.is_percentage
      from indicator_locale
      join indicator
        on indicator.id = indicator_locale.indicator_id
      where locale_id = ?
      order by year asc
SQL_QUERY

    my $subindicator_values = $self->app->pg->db->query(<<"SQL_QUERY", $locale_id);
      select
        subindicator_locale.indicator_id,
        subindicator_locale.subindicator_id,
        subindicator_locale.value_absolute,
        subindicator_locale.value_relative,
        subindicator_locale.year,
        subindicator.is_percentage
      from subindicator_locale
      join subindicator
        on subindicator.id = subindicator_locale.subindicator_id
          and subindicator.indicator_id = subindicator_locale.indicator_id
      where locale_id = ?
      order by year asc
SQL_QUERY

    # Get locale
    my $locale = $self->app->pg->db->query(<<'SQL_QUERY', $locale_id)->hash;
       select
        case
          when type = 'city' then locale.name || '/' || state.uf
          else locale.name
        end as name
      from locale
      left join city
        on city.id = locale.id
      left join state
        on city.state_id = state.id
      where locale.id = ?
SQL_QUERY

    my $formatter = Number::Format->new(-thousands_sep   => '.', -decimal_point   => ',');
    my %data = (
        locale_name => $locale->{name},
        (
            map {
                my $value_absolute = 'N/A';
                my $value_relative = 'N/A';
                if (defined($_->{value_absolute})) {
                    $value_absolute = $formatter->format_number($_->{value_absolute});
                }
                if (defined($_->{value_relative})) {
                    $value_relative = $formatter->format_number($_->{value_relative});
                    $value_relative .= '%' if $_->{is_percentage};
                }
                (
                    sprintf("%d-D0_A", $_->{indicator_id}) => { value => $value_absolute, year => $_->{year} },
                    sprintf("%d-D0_R", $_->{indicator_id}) => { value => $value_relative, year => $_->{year} },
                )
            } $indicator_values->hashes()->each()
        ),
        (
            map {
                my $value_absolute = 'N/A';
                my $value_relative = 'N/A';
                if (defined($_->{value_absolute})) {
                    $value_absolute = $formatter->format_number($_->{value_absolute});
                }
                if (defined($_->{value_relative})) {
                    $value_relative = $formatter->format_number($_->{value_relative});
                    $value_relative .= '%' if $_->{is_percentage};
                }
                (
                    sprintf("%d-D%d_A", $_->{indicator_id}, $_->{subindicator_id}) => { value => $value_absolute, year => $_->{year} },
                    sprintf("%d-D%d_R", $_->{indicator_id}, $_->{subindicator_id}) => { value => $value_relative, year => $_->{year} },
                )
            } $subindicator_values->hashes()->each()
        ),
    );

    # Write to file
    $log->debug('Rendering the file...');
    print $fh $mt->render($slurp, {
        now         => $self->app->model('DateTime')->now(),
        locale_name => $locale->{name},
        #year        => $year,
        data        => \%data,
    });
    close $fh;

    # Generate another temporary file
    $log->debug('Running wkhtmltopdf...');
    my (undef, $base_file) = tempfile(SUFFIX => '.pdf');
    #my (undef, $base_file) = tempfile(SUFFIX => '.pdf', DIR => '/data');
    my $header_html = $dir->dirname . '/header.html';
    $log->debug("Header file: ${header_html}");

    my $out;
    my $err;
    run [
        'xvfb-run',
        'wkhtmltopdf',
        '--enable-local-file-access',
        qw(-T 0 -L 0 -R 0),
        '--margin-top', 23,
        '--header-html', $header_html,
        #'wkhtmltopdf', qw(--enable-local-file-access --margin-top 10 --margin-bottom 160),
        #'--footer-html', $footer_html,
        $fh->filename,
        $base_file,
    ], \undef, \$out, \$err;

    $log->debug('STDOUT:');
    $log->debug($out);
    $log->debug('STDERR:');
    $log->debug($err);

    #my (undef, $pdf_file) = tempfile(SUFFIX => '.pdf', DIR => '/data');
    my (undef, $pdf_file) = tempfile(SUFFIX => '.pdf');
    run [
        'pdfunite',
        $base_file,
        $home->rel_file("resources/resume/final.pdf"),
        $pdf_file,
    ], \undef, $out, $err;

    $log->debug('STDOUT:');
    $log->debug($out);
    $log->debug('STDERR:');
    $log->debug($err);

    $log->debug('Final file: ' . $pdf_file);

    return $pdf_file;
}

sub get_all_data {
    my $self = shift;

    $self->app->log->debug('Retriving data...');

    my $query = $self->app->pg->db->query_p(<<'SQL_QUERY');
      SELECT
        locale.id             AS locale_id,
        locale.name           AS locale_name,
        locale.type           AS locale_type,
        state.uf              AS locale_uf,
        area.name             AS area_name,
        indicator.id          AS indicator_id,
        indicator.description AS indicator_description,
        indicator_locale.year AS indicator_value_year,
        indicator_locale.value_relative AS indicator_value_relative,
        indicator_locale.value_absolute AS indicator_value_absolute,
        s.*
      FROM locale
      JOIN indicator_locale
        ON locale.id = indicator_locale.locale_id
      JOIN indicator
        ON indicator.id = indicator_locale.indicator_id
      JOIN area
        ON area.id = indicator.area_id
      LEFT JOIN city
        ON locale.id = city.id
      LEFT JOIN state
        ON city.state_id = state.id
      INNER JOIN LATERAL (
        SELECT
          indicator.id                       AS indicator_id,
          subindicator.description           AS subindicator_description,
          subindicator.id                    AS subindicator_id,
          subindicator.classification        AS subindicator_classification,
          subindicator_locale.value_relative AS subindicator_value_relative,
          subindicator_locale.value_absolute AS subindicator_value_absolute,
          subindicator_locale.year           AS subindicator_year
        FROM subindicator_locale
        JOIN subindicator
          ON subindicator.id = subindicator_locale.subindicator_id AND subindicator.indicator_id = indicator.id
        WHERE subindicator_locale.locale_id = locale.id
          AND subindicator_locale.indicator_id = indicator.id
          AND subindicator_locale.year = indicator_locale.year
        UNION
        SELECT
          indicator.id AS indicator_id,
          NULL AS subindicator_id,
          NULL AS subindicator_description,
          NULL AS subindicator_classification,
          NULL AS subindicator_value_absolute,
          NULL AS subindicator_value_relative,
          NULL AS subindicator_year
      ) s ON s.indicator_id = indicator.id
      ORDER BY
        indicator_locale.year ASC,
        (
          CASE locale.type
            WHEN 'country' THEN 1
            WHEN 'region'  THEN 2
            WHEN 'state'   THEN 3
            WHEN 'city'    THEN 4
          END
        ),
        locale.name, indicator.id, indicator_locale.year DESC,
        (s.subindicator_id IS NULL) DESC, s.subindicator_id, s.subindicator_year
SQL_QUERY

    return $query->then(sub {
        my $res = shift;

        my $create_workbook = sub {
            my $fh = File::Temp->new(UNLINK => 1, SUFFIX => '.xlsx');

            # Spreadsheet
            my $workbook = Excel::Writer::XLSX->new($fh->filename);
            $workbook->set_optimization();

            return ($fh, $workbook);
        };

        # Write data
        my %temp_files  = ();
        my %workbooks   = ();
        my %worksheets  = ();
        my %has_headers = ();
        my %lines       = ();
        while (my $r = $res->hash) {
            my $locale_type = $r->{locale_type};
            my $locale_uf = $r->{locale_uf};
            my $key = $locale_type eq 'city' ? $locale_uf : 'BR';

            # Get or create worksheet
            my $year = $r->{indicator_value_year};
            my $worksheet = $worksheets{$key}->{$year};
            my $workbook = $workbooks{$key};
            if (!defined($worksheet)) {
                if (!defined($workbook)) {
                    my $fh;
                    ($fh, $workbook) = $create_workbook->();
                    $workbooks{$key} = $workbook;
                    $temp_files{$key} = $fh;
                }
                $worksheets{$key}->{$year} = $worksheet = $workbook->add_worksheet($year);
            }

            # Write headers
            $lines{$key}->{$year} //= 0;
            if (!$has_headers{$key}->{$year}++) {
                my @headers = (
                    'LOCALIDADE', 'COD IBGE', qw(TEMA INDICADOR), 'VALOR RELATIVO', 'VALOR ABSOLUTO', qw(DESAGREGADOR CLASSIFICAÇÃO),
                    'VALOR RELATIVO', 'VALOR ABSOLUTO',
                );

                my $header_format = $workbook->add_format();
                $header_format->set_bold();

                for (my $i = 0; $i < scalar @headers; $i++) {
                    $worksheet->write($lines{$key}->{$year}, $i, $headers[$i], $header_format);
                }
                $lines{$key}->{$year}++;
            }

            # Write lines
            my @keys = qw(
                locale_name locale_id area_name indicator_description indicator_value_relative indicator_value_absolute
                subindicator_description subindicator_classification subindicator_value_relative
                subindicator_value_absolute
            );
            for (my $i = 0; $i < scalar @keys; $i++) {
                $worksheet->write($lines{$key}->{$year}, $i, $r->{$keys[$i]});
            }
            $lines{$key}->{$year}++;
        }

        # Add footer
        my $now = $self->app->model('DateTime')->now()
          ->set_time_zone('UTC')
          ->set_time_zone('America/Sao_Paulo');

        for my $uf (keys %workbooks) {
            my $workbook = $workbooks{$uf};

            my $footer_format = $workbook->add_format();
            $footer_format->set_italic();
            $footer_format->set_size(9);

            for my $year (keys %{$worksheets{$uf}}) {
                my $worksheet = $worksheets{$uf}->{$year};
                $lines{$uf}->{$year} += 3;

                $worksheet->write($lines{$uf}->{$year}++, 0, 'Dados extraídos pela plataforma Observa', $footer_format);
                $worksheet->write(
                    $lines{$uf}->{$year}++,
                    0,
                    sprintf(
                        "%02d/%02d/%02d às %02d:%02d horário de Brasília.",
                        $now->day, $now->month, $now->year,
                        $now->hour, $now->minute,
                    ),
                    $footer_format,
                );
            }
        }

        # Create output file
        $self->app->log->info('Creating zipfile...');
        my $zip = Archive::Zip->new();

        for my $uf (keys %temp_files) {
            # Close workbook and filehandle
            my $fh = $temp_files{$uf};
            my $workbook = $workbooks{$uf};
            $workbook->close();
            close $fh;

            # Add file
            my $filename = sprintf('Observa_Dados_%s.xlsx', $uf);
            $zip->addFile($fh->filename, $filename);
        }

        my $zipfile = File::Temp->new(UNLINK => 0, SUFFIX => '.zip');
        $zip->writeToFileNamed($zipfile->filename);

        close $zipfile;

        return $zipfile;
    });
}

sub download_indicator {
    my ($self, %opts) = @_;

    my $locale_id    = $opts{locale_id};
    my $indicator_id = $opts{indicator_id};

    my $query_p = $self->app->pg->db->query_p(<<'SQL_QUERY', $indicator_id, $locale_id);
      SELECT
        locale.id                        AS locale_id,
        locale.name                      AS locale_name,
        indicator.description            AS indicator_description,
        indicator_locale.year            AS year,
        area.name                        AS area_name,
        indicator_locale.value_relative  AS average_relative,
        indicator_locale.value_absolute  AS average_absolute,
        subs.description                 AS subindicator_description,
        subs.classification              AS subindicator_classification,
        subs.value_relative              AS subindicator_value_relative,
        subs.value_absolute              AS subindicator_value_absolute,
        indicator.base                   AS base,
        indicator.concept                AS concept
      FROM indicator_locale
      JOIN indicator
        ON indicator_locale.indicator_id = indicator.id
      JOIN area
        ON area.id = indicator.area_id
      JOIN locale
        ON locale.id = indicator_locale.locale_id
      LEFT JOIN LATERAL (
        SELECT
          subindicator.description,
          subindicator.classification,
          subindicator_locale.value_absolute,
          subindicator_locale.value_relative,
          subindicator_locale.indicator_id
        FROM subindicator_locale
        JOIN subindicator
          ON subindicator.id = subindicator_locale.subindicator_id AND subindicator.indicator_id = indicator.id
        WHERE subindicator_locale.locale_id = locale.id
          AND subindicator_locale.year = indicator_locale.year
        ORDER BY subindicator_locale.indicator_id, subindicator_locale.subindicator_id
      ) subs ON subs.indicator_id = indicator.id
      WHERE indicator.id = ?
        AND indicator_locale.locale_id = ?
      ORDER BY indicator.id, indicator_locale.year
SQL_QUERY

    my $locale_p = $self->app->pg->db->select_p("locale", [qw(name)], { id => $locale_id });

    return Mojo::Promise->all($query_p, $locale_p)
      ->then(sub {
        my $res = shift;
        my $locale = shift;

        # Create temporary file
        my $fh = File::Temp->new(UNLINK => 0, SUFFIX => '.xlsx');

        # Spreadsheet
        my $workbook = Excel::Writer::XLSX->new($fh->filename);
        $workbook->set_optimization();

        # Formats
        my $header_format = $workbook->add_format();
        $header_format->set_bold();

        # Worksheet
        my $worksheet = $workbook->add_worksheet();

        # Headers
        my @headers = (
            'LOCALIDADE', 'COD IBGE', qw(TEMA INDICADOR ANO), 'MÉDIA RELATIVA', 'MÉDIA ABSOLUTA', qw(DESAGREGADOR CLASSIFICAÇÃO),
            'VALOR RELATIVO', 'VALOR ABSOLUTO', 'FONTE',
        );

        for (my $i = 0; $i < scalar @headers; $i++) {
            $worksheet->write(0, $i, $headers[$i], $header_format);
        }

        # Write data
        my $line = 1;
        while (my $r = $res->[0]->hash) {
            # Write lines
            my @keys = qw(
                locale_name locale_id area_name indicator_description year average_relative average_absolute
                subindicator_description subindicator_classification subindicator_value_relative
                subindicator_value_absolute base
            );
            for (my $i = 0; $i < scalar @keys; $i++) {
                my $key   = $keys[$i];
                my $value = $r->{$key};

                if ($key =~ m{_(relative|absolute)$}) {
                    $value =~ s{\.}{,}g;
                }
                $worksheet->write_string($line, $i, $value);
            }
            $line++;
        }

        # Add timestamp
        my $footer_format = $workbook->add_format();
        $footer_format->set_italic();
        $footer_format->set_size(9);

        $line += 5;
        $worksheet->write($line++, 0, 'Dados extraídos pela plataforma Observa', $footer_format);
        my $now = $self->app->model('DateTime')->now()
          ->set_time_zone('UTC')
          ->set_time_zone('America/Sao_Paulo');

        $worksheet->write(
            $line++,
            0,
            sprintf(
                "%02d/%02d/%02d às %02d:%02d horário de Brasília.",
                $now->day, $now->month, $now->year,
                $now->hour, $now->minute,
            ),
            $footer_format,
        );

        close $fh;
        return $fh, $locale->[0]->hash->{name};
    });
}

sub get_random_indicator {
    my ($self, %args) = @_;

    my $locale_id_ne = $args{locale_id_ne};

    my $db = $self->app->pg->db;

    # Get some random locale which contains data
    my $cond_locale = '';
    $cond_locale = "WHERE locale_id NOT IN(@{[join ',', map '?', @{ $locale_id_ne }]})\n"
      if defined $locale_id_ne && scalar @{$locale_id_ne} > 0;

    return $db->query(<<"SQL_QUERY", @{ $locale_id_ne || [] });
      SELECT locales
      FROM random_indicator_cache
      TABLESAMPLE SYSTEM_ROWS(3)
      ${cond_locale}
      LIMIT 1
SQL_QUERY
}

1;
