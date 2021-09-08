---
id: quick-start
title: Quick Start
---

At the center of Monika is a configuration file. Follow the following steps to quickly setup monitoring and get notification when a website is down via Desktop notifications.

## Installation

You can install Monika using [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

```bash
$ npm i -g @hyperjumptech/monika
# or
$ yarn global add @hyperjumptech/monika
```

## Download the configuration file

Download the example configuration that uses Desktop notification [here](https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.json) and rename it as monika.json

## Run Monika

Monika by default reads a configuration file called `monika.json` in the current working directory if it exists. To simply run previously downloaded the configuration, run this command on the Terminal in the same path you saved `monika.json` file:

```bash
monika
```

You can specify a path to a JSON configuration file with `-c` flag if you didn't rename your configuration file as monika.json, as follows

```bash
monika -c <path_to_configuration_json_file>
```

Better yet, you can provide an URL that contains monika configuration

```bash
monika -c https://domain.com/path/to/your/configuration.json
```

Congratulations, you have successfully run Monika in your machine!

## Next Step

For advanced configuration such as configuring notifications, probes, and alerts, you can find them on the sidebar menu for more details.
