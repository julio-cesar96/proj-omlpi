#!/bin/sh

export OMLPI_API_LOG_DIR=/data/log/
mkdir -p /data/log/;
chown -R app:app /data/log/
chown -R app:app /src/

# Remove os arquivos de env do usuários para deixar as preferências do container
rm -f /src/envfile*.sh

# muda o sqitch.conf para usar as variáveis de ambiente
sed -i '/\[target "docker"\]/!b;n;c\   uri = db:pg://'"${POSTGRESQL_USER}:${POSTGRESQL_PASSWORD}@${POSTGRESQL_HOST}:${POSTGRESQL_PORT}/${POSTGRESQL_DBNAME}" /src/sqitch.conf

exec /sbin/setuser app /src/script/start-server.sh

