#!/usr/bin/env bash -e
export DB_NAME='omlpi_dev_persistent'
export CONTAINER_NAME='omlpi_api'
export INSIDE_WORKSPACE=/var/jenkins_home/dev-persistent/$JOB_NAME

# confira o seu ip usando ifconfig docker0|grep 'inet addr:'
export DOCKER_LAN_IP=172.17.0.1

# porta que será feito o bind
export LISTEN_PORT=3453

mkdir -p $INSIDE_WORKSPACE/src
mkdir -p $INSIDE_WORKSPACE/data
chown 1000:1000 $INSIDE_WORKSPACE/data -R

rsync --exclude 'test-logs' --exclude '.git' -av $WORKSPACE/ $INSIDE_WORKSPACE/src;

cd $INSIDE_WORKSPACE/src;

# config do banco
cp envfile.sh envfile_local.sh
cat envfile_local.sh;
sed -i "s/omlpi_dev/$DB_NAME/g" envfile_local.sh
cat sqitch.conf;
sed -i "s/omlpi_dev/$DB_NAME/g" sqitch.conf

# troca o nome do omlpi_testing tambem, pois o teste pode ter rodado antes desse script
sed -i "s/omlpi_testing/$DB_NAME/g" sqitch.conf

# como estou rodando o jenkins dentro de um container,
# é necessário do path no lado do host para executar o mount corretamente
export REAL_WORKSPACE="/home/jenkins-data/dev-persistent/$JOB_NAME/"

if ! docker top $CONTAINER_NAME &>/dev/null
then
    # sobe a api
    docker run -d --name $CONTAINER_NAME -p $DOCKER_LAN_IP:$LISTEN_PORT:8080 -v $REAL_WORKSPACE/src:/src -v $REAL_WORKSPACE/data:/data --restart unless-stopped appcivico/omlpi_api
else
    docker exec -u app $CONTAINER_NAME /src/script/restart-services.sh
fi

