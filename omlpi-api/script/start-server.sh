#!/bin/bash -e
source /home/app/perl5/perlbrew/etc/bashrc

mkdir -p /data/log/;

export OMLPI_API_LOG_DIR=/data/log/

cd /src;
if [ -f envfile_local.sh ]; then
    source envfile_local.sh
else
    if [ -f envfile.sh ]; then
        source envfile.sh
    fi
fi

export SQITCH_DEPLOY=${SQITCH_DEPLOY:=docker}

cpanm -nv . --installdeps
sqitch deploy -t $SQITCH_DEPLOY

#perl script/omlpi-api data_spreadsheet

LIBEV_FLAGS=4 MOJO_IOLOOP_DEBUG=1 hypnotoad script/omlpi-api

sleep infinity