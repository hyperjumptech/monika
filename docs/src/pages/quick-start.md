---
id: quick-start
title: Quick Start
---

At the center of Monika is a configuration file. Follow the following steps to quickly setup monitoring and get notification when a website is down via Desktop notifications.

## Installation

You can install Monika two methods:

1. Install using [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

   If you're using NPM or Yarn, you can simply run this command in your terminal:

   ```bash
   $ npm i -g @hyperjumptech/monika
   # or
   $ yarn global add @hyperjumptech/monika
   ```

2. Download and run standalone binary

   Head over to [Monika Release](https://github.com/hyperjumptech/monika/releases) page, download the Monika file according to your operating system, and rename it to `monika`.

   UNIX-based users may have to run `sudo chmod +x monika` in order to execute Monika binary file.

   In order to run Monika binary file, you must download the node_sqlite3-<os>-<arch>.node file according to your OS, rename it as node_sqlite3.node and put it in one folder with the Monika binary file.

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
