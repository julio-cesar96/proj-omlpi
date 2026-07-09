#!/bin/bash -e
cd $WORKSPACE;
. ./build-container.sh

export DB_NAME='omlpi_testing'

mkdir -p $WORKSPACE/tmp-data
chown 1000:1000 $WORKSPACE/tmp-data -R
chown 1000:1000 $WORKSPACE/ -R

# Database config
cp envfile.sh envfile_local.sh
sed -i "s/omlpi_dev/$DB_NAME/g" envfile_local.sh
cat envfile_local.sh;
sed -i "s/omlpi_dev/$DB_NAME/g" sqitch.conf
cat sqitch.conf;

export REAL_WORKSPACE="/home/jenkins-data/workspace/$JOB_NAME/"

# Drop (if exists) and recreate database
#docker run --rm -i -u app -v $REAL_WORKSPACE:/src appcivico/omlpi_api /src/script/ci/resetdb.sh $DB_NAME

# Run tests
docker run --rm -i -u app -v $REAL_WORKSPACE:/src -v $REAL_WORKSPACE/tmp-data:/data appcivico/omlpi_api /src/script/run-tests.sh

# Drop database
#rm -rf $WORKSPACE/tmp-data
#docker run --rm -i -u app -v $REAL_WORKSPACE:/src appcivico/omlpi_api /src/script/ci/dropdb.sh $DB_NAME
