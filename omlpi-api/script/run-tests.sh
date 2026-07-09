#!/bin/bash -e
source $HOME/perl5/perlbrew/etc/bashrc

mkdir -p /data/log/;

cd /src;

if [ -f envfile_local.sh ]; then
    source envfile_local.sh
else
    source envfile.sh
fi

# Install deps
cpanm -n . --installdeps

# Migrations
sqitch deploy -t $SQITCH_DEPLOY

# Upsert data
perl script/import_data.pl

# Run tests
rm -f /src/test-logs/*
yath test -It/lib  -POMLPI::Preload --no-color -j 18 -T -L