---
id: installation
title: Installation
---

You can install Monika with [NPM](https://npmjs.com) or [Yarn](https://yarnpkg.com).

```bash
$ npm i -g @hyperjumptech/monika
# or
$ yarn global add @hyperjumptech/monika
```

## Run Monika using Docker

Monika is available as a docker image. Paste a copy of your configuration file `config.json` into the current directory.
From the same directoy, you can run:

```
docker run --name monika -v ${PWD}/config.json:/config/config.json --detach hyperjump/monika:latest
```

Once monika is up and running, you can see its log using

```
docker logs monika
```

Or you can stop the container with

```
docker stop monika
```
