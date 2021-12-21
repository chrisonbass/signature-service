FROM node:15.7.0

COPY ./app /app

RUN apt update; \
    apt upgrade -y;

RUN apt install -y openssl

WORKDIR /app/openapi-generated-server

RUN npm install -g express; \
    npm install -g mocha; \
    npm install -g couchbase; \
    npm install -g nodemon;

ENTRYPOINT [ "npm", "run", "debug" ]