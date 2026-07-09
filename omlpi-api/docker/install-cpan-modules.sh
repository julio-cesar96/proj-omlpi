#!/bin/bash -e
export USER=app

source /home/app/perl5/perlbrew/etc/bashrc

# install once XS and other basic modules

cpanm -n \
    App::Sqitch \
    Archive::Zip \
    Carp \
    Config::General \
    DBD::Pg \
    DB_File \
    Data::Printer \
    DateTime \
    DateTime::Format::DateParse \
    Digest::SHA \
    EV \
    Email::Sender::Simple \
    Email::Sender::Transport::SMTP::TLS \
    Encode \
    Excel::Writer::XLSX \
    Exporter \
    File::Copy \
    File::MimeInfo \
    File::Temp \
    IO::Handle \
    IPC::Run \
    JSON::XS \
    Log::Log4perl \
    MIME::Lite \
    Net::DNS::Native \
    Scalar::Util \
    Scope::OnExit \
    Template \
    Test2::Harness \
    Text::CSV \
    Text::CSV_XS \
    YAML::XS \
    common::sense \
    strict \
    vars \
    warnings