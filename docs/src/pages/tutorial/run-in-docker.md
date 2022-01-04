---
id: run-monika-in-docker
title: Run Monika in Docker
---

Monika is available as a docker image. You can find the image in the docker hub as `hyperjump/monika`, or pull the image with the following command:

```bash
docker pull hyperjump/monika
```

Once you've pulled the latest image, pass it your monika yaml configuration to the container. From the same directory, you can run:

```bash
# Run Monika in foreground
docker run --name monika -v ${PWD}/monika.yml:/config/monika.yml -it hyperjump/monika:latest

# Or, if you prefer to run Monika in the background
docker run --name monika -v ${PWD}/monika.yml:/config/monika.yml --detach hyperjump/monika:latest
```

In the example above, we create a container from the monika image, map the current directory with a yaml config into the container, and let it run in the backround using the `--detach` switch.

Once monika is up and running, you can see its log using

```bash
docker logs monika
```

Or you can stop the container with

```bash
docker stop monika
```

For more complex containers, you can pass it monika parameters. Using prometheus with monika in a docker, you would pass the parameters like so:

```bash
docker run --name monika_interactive \
    -v ${PWD}/myConfig.yml:/config/monika.yml \
    -d hyperjump/monika:latest \
    monika -c /config/monika.yml --prometheus 3001
```

## Troubleshooting

Genererally when facing issues with your container, try the parameters using regular monika. For instance:

```bash
monika -c /config/monika.yml --prometheus 3001
```

Ensure your container is up and running by running simple commands/parameters:

```bash
docker run --name monika_interactive \
    -v ${PWD}/myConfig.yml:/config/monika.yml \
    -d hyperjump/monika:latest monika --help
```

For further docker commands and documentation, visit the official Docker [documentation here](https://docs.docker.com/engine/reference/commandline/run/).

If all else fails, hit us up at [monika discussions](https://github.com/hyperjumptech/monika/discussions) or [file an issue](https://github.com/hyperjumptech/monika/issues).
