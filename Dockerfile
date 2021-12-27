FROM node:15.7.0

ARG INTERNAL_PORT=3000
ARG EXTERNAL_PORT=3000
ARG DEBUG_PORT=9229

COPY ./app /app

RUN apt install -y openssl
RUN npm install -g couchbase

WORKDIR /app

RUN npm install -g express mocha nodemon

ENV INTERNAL_PORT=${INTERNAL_PORT}
ENV EXTERNAL_PORT=${EXTERNAL_PORT}}
ENV DEBUG_PORT=${DEBUG_PORT}}

CMD [ "npm", "run", "debug" ]
