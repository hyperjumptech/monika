FROM node:14-alpine

RUN mkdir /config

RUN npm i -g @hyperjumptech/monika

CMD [ "monika", "-c", "/config/config.json" ]