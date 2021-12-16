---
id: run-monika-in-docker
title: Run Monika in Docker
---

Monika is available as a docker image. Paste a copy of your configuration file `monika.yml` into the current directory.
From the same directory, you can run:

```bash
docker run --name monika -v ${PWD}/monika.yml:/config/monika.yml --detach hyperjump/monika:latest
```

Once monika is up and running, you can see its log using

```bash
docker logs monika
```

Or you can stop the container with

```bash
docker stop monika
```
