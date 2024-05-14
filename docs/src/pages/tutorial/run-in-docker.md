---
id: run-monika-in-docker
title: Run Monika in Docker
---

Monika is available as a docker image. You can find the image in the docker hub as `hyperjump/monika`, or pull the image with the following command

```bash
docker pull hyperjump/monika
```

## Running Monika on Apple Silicon

Monika docker image only supports amd64 architecture, you have to pass `--platform linux/amd64` when using `hyperjump/monika` docker image

```bash
docker pull --platform linux/amd64 hyperjump/monika
```

Once you've pulled the latest image, you can run it using

```bash
# Run Monika in foreground
docker run --name monika --net=host -it hyperjump/monika:latest

# Or, if you prefer to run Monika in the background
docker run --name monika --net=host --detach hyperjump/monika:latest

# On Apple Silicon chip, pass --platform linux/amd64
docker run --name monika --net=host --platform linux/amd64 -it hyperjump/monika:latest
docker run --name monika --net=host --platform linux/amd64 --detach hyperjump/monika:latest
```

In the example above, we create a container from the hyperjump/monika base image naming it with`--name monika`, indicate we'll use the host machine's network configuration with `--net=host` and let it run in the backround using the `--detach` switch (or interactively with `-it`).

Once monika is up and running, you can see its log using

```bash
docker logs monika
```

Or you can stop the container with

```bash
docker stop monika
```

For more complex probing, for example to use your existing customized configuration and have the prometheus plugin. First copy your personalized config to a directory, say /config. Then create your container with the directory mounted as a `--volume (-v)` for the container to use, like so:

```bash
docker run --name monika_interactive \
    --net=host \
    -v ${PWD}/config:/config \
    -d hyperjump/monika:latest \
    monika -c /config/myConfig.yml --prometheus 3001

# On Apple Silicon
docker run --name monika_interactive \
    --net=host \
    --platform linux/amd64 \
    -v ${PWD}/config:/config \
    -d hyperjump/monika:latest \
    monika -c /config/myConfig.yml --prometheus 3001
```

## Troubleshooting

Genererally when facing issues with your container or configuration, try the same configuration YAML using regular monika. For instance:

```bash
monika -c myConfig.yml --prometheus 3001
```

Ensure your container is up and running by issuing simple commands/parameters:

```bash
docker run --name monika_interactive \
    -it hyperjump/monika:latest monika --help
```

For further docker commands and documentation, visit the official Docker [documentation here](https://docs.docker.com/engine/reference/commandline/run/).

If all else fails, hit us up at [monika discussions](https://github.com/hyperjumptech/monika/discussions) or [file an issue](https://github.com/hyperjumptech/monika/issues).
