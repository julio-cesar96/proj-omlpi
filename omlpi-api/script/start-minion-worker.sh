#!/bin/bash -e
source /home/app/perl5/perlbrew/etc/bashrc

mkdir -p /data/log/;

export OMLPI_API_LOG_DIR=/data/log/

cd /src;
if [ -f envfile_local.sh ]; then
    source envfile_local.sh
else
    source envfile.sh
fi

APP_NAME=MINION perl /src/script/omlpi-api minion worker
