# Need to use 16.15 because npm ci fails with 16.15
FROM node:16.14-alpine AS builder

WORKDIR /monika

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run prepack
RUN npm pack

FROM node:16.14-alpine AS runner

COPY --from=builder /monika/hyperjumptech-monika-*.tgz ./
RUN npm install -g --unsafe-perm ./hyperjumptech-monika-*.tgz

WORKDIR /
RUN mkdir /config

CMD ["monika"]