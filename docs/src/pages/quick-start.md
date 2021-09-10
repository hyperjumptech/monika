---
id: quick-start
title: Quick Start
---

At the center of Monika is a configuration file. Follow the steps below to quickly setup monitoring and get notification when a website is down via Desktop notifications.

## Installation

There are two ways to install Monika::

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

Monika by default reads a configuration file called `monika.json` in the current working directory if it exists. To run monika with the configuration file that you have downloaded before, run this command in the Terminal from the directory that contains the monika.json file:

```bash
monika
```

You can specify a path to a JSON configuration file with `-c` flag if you didn't rename your configuration file as monika.json, as follows

```bash
monika -c <path_to_configuration_json_file>
```

Better yet, you can provide a URL that contains monika configuration

```bash
monika -c https://domain.com/path/to/your/configuration.json
```

Congratulations, you have successfully run Monika in your machine!

## Next Step

For advanced configuration such as configuring [notifications](https://monika.hyperjump.tech/guides/notifications), [probes](https://monika.hyperjump.tech/guides/probes), and [alerts](https://monika.hyperjump.tech/guides/alerts), you can find them on the sidebar menu.
