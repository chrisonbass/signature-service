FROM node:15.7.0

COPY ./app /app

RUN apt install -y openssl

WORKDIR /app

RUN npm install -g express; \
    npm install -g mocha; \
    npm install -g couchbase; \
    npm install -g nodemon;

CMD [ "npm", "run", "debug" ]
