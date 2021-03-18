FROM node:10-alpine

RUN mkdir /config
COPY . /app
WORKDIR /app

RUN npm ci
RUN npm link

CMD [ "monika", "-c", "/config/config.json" ]