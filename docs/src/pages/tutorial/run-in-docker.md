---
id: run-monika-in-docker
title: Run Monika in Docker
---

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
