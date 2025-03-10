---
id: quick-start
title: Quick Start
---

## Installation

There are many ways to install Monika. However, currently only x64 architecture is supported.

## Minimum Requirements

Monika is designed to be lightweight. It has successfully run on Digital Ocean's smallest droplet (0.5GB RAM, 1 vCPU, and 10GB storage). However, RAM requirements may vary and increase with the number of probes.

### Via Node.js

If you have installed Node.js in your machine, you can install Monika directly from [npm](https://npmjs.com):

```bash
npm i -g @hyperjumptech/monika
```

or [yarn](https://yarnpkg.com):

```bash
yarn global add @hyperjumptech/monika
```

## Download the configuration file

Once you have installed Monika, let's confirm that it's working by downloading the example configuration that uses Desktop notification called [config.desktop.example.yml](https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml) and rename it as monika.yml.

## Run Monika

Monika by default reads a yaml configuration file called `monika.yml` in the current working directory if it exists. To run monika with the configuration file that you have downloaded before, run this command in the Terminal from the directory that contains the monika.yml file:

```bash
monika
```

Otherwise, you can also specify a path to a YAML configuration file with `-c` flag if you didn't rename your configuration file as monika.yml:

```bash
monika -c <path_to_configuration_file>
```

Better yet, you can provide a URL that contains monika configuration

```bash
monika -c https://domain.com/path/to/your/configuration.yml
```

When using remote configuration file, you can use the `--config-interval` to tell Monika to check the configuration file periodically. For example, to check every 10 seconds:

```bash
monika -c https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml --config-interval 10
```

## Run Monika on Docker

```bash
docker run --name monika \
    --net=host \
    -d hyperjump/monika:latest \
    monika -c https://domain.com/path/to/your/configuration.yml
```

**On ARM / Apple Silicon chip**, you need to pass `--platform linux/amd64` to docker.

Congratulations, you have successfully run Monika in your machine!

## Next Step

Now it's time to [write your own configuration file](https://monika.hyperjump.tech/guides/configuration-file). You can use [VSCode with YAML extension for the auto completion feature](https://medium.com/hyperjump-tech/creating-monika-configuration-from-scratch-using-autocomplete-in-visual-studio-code-d7bc86c1d36a) or you can also use the[Monika Config Generator web app](https://monika-config.hyperjump.tech/) if you prefer using Graphical User Interface (GUI).

For advanced configuration such as configuring [notifications](https://monika.hyperjump.tech/guides/notifications), [probes](https://monika.hyperjump.tech/guides/probes), and [alerts](https://monika.hyperjump.tech/guides/alerts), you can find them on the sidebar menu.
