---
id: installation
title: Installation
---

## Installation

You can install Monika using [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

```bash
$ npm i -g @hyperjumptech/monika
# or
$ yarn global add @hyperjumptech/monika
```

## Run Monika using Docker

Monika is available as a docker image. Paste a copy of your configuration file `monika.json` into the current directory.
From the same directory, you can run:

```
docker run --name monika -v ${PWD}/monika.json:/config/monika.json --detach hyperjump/monika:latest
```

Once monika is up and running, you can see its log using

```
docker logs monika
```

Or you can stop the container with

```
docker stop monika
```

## Command-line Options

The common `-h` or `--help` displays all available options

```bash
monika -h
```

See the [CLI Options](https://hyperjumptech.github.io/monika/guides/cli-options) guide to see all the different options possible.
