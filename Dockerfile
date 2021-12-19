FROM node

COPY ./app /app

RUN apt update; \
    apt upgrade -y;

RUN apt install -y openssl

WORKDIR /app/openapi-generated-server

RUN npm install -g connect@^3.2.0; \
    npm install -g js-yaml@^3.3.0; \
    npm install -g oas3-tools@^2.2.3; \
    npm install -g mocha; \
    npm install -g couchbase; \
    npm install -g nodemon;

ENTRYPOINT [ "npm", "run", "debug" ]