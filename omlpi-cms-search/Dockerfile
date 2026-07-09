FROM node:16-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/

EXPOSE 1337

ENTRYPOINT ["docker-entrypoint.sh"]