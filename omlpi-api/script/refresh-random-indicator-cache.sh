#!/bin/bash -e
#cd /src;
#source /home/app/perl5/perlbrew/etc/bashrc;

if [ -f envfile_local.sh ]; then
    source envfile_local.sh
else
    source envfile.sh
fi

perl script/refresh_random_indicator_cache.pl
