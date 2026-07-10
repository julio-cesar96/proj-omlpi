#!/usr/bin/env bash

dropdb -h 172.17.0.1 -U postgres $1 || true
