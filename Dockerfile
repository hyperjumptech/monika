FROM node:14-alpine

WORKDIR /monika

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run prepack

RUN npm pack

RUN npm install -g --unsafe-perm ./hyperjumptech-monika-*.tgz

WORKDIR /

RUN mkdir /config

CMD [ "monika", "-c", "/config/monika.json" ]