#!/bin/bash -e

# Arquivo de exemplo para iniciar o container
export SOURCE_DIR="$HOME/projects/omlpi-api"
export DATA_DIR='/tmp/omlpi/data/'

mkdir -p $DATA_DIR

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Directory '$SOURCE_DIR' does not exists";
    exit 1;
fi

# Confira o seu ip usando ifconfig docker0|grep 'inet addr:'
export DOCKER_LAN_IP=172.17.0.1

# Porta que será feito o bind
export LISTEN_PORT=8080

docker run --name omlpi_api \
 -v $SOURCE_DIR:/src -v $DATA_DIR:/data \
 -p $DOCKER_LAN_IP:$LISTEN_PORT:8080 \
 --cpu-shares=512 \
 --memory 1800m -d --restart unless-stopped appcivico/omlpi_api
