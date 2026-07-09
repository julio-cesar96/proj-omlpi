#!/bin/bash -e
cp Makefile.PL docker/Makefile_local.PL

docker build -t appcivico/omlpi_api docker/
