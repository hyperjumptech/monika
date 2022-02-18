---
id: quick-start
title: Quick Start
---

At the center of Monika is a configuration file. Follow the steps below to quickly setup monitoring and get notification when a website is down via Desktop notifications.

## Installation

There are four ways to install Monika

1. Install using [npm](https://npmjs.com) or [yarn](https://yarnpkg.com) (**Windows/Linux/Mac**).

   If you're using NPM or Yarn, you can simply run this command in your terminal:

   ```bash
   $ npm i -g @hyperjumptech/monika
   # or
   $ yarn global add @hyperjumptech/monika
   ```

2. Install script (Linux)

   1. Download and install Monika pre-built binaries.

   ```bash
   $ curl https://raw.githubusercontent.com/hyperjumptech/monika/main/scripts/monika-install.sh | sh
   ```

   You will be able to run the latest monika by the time it is done. This script will install monika to path `~/.local/bin`.

3. Download and run standalone binary (Windows/Linux)

   Head over to [Monika Release](https://github.com/hyperjumptech/monika/releases) page, download the Monika file according to your operating system, and rename it to `monika`.

   UNIX-based users may have to run `sudo chmod +x monika` in order to execute Monika binary file. Please note that currently, only x64 architecture is supported.

   In order to run Monika binary file, you must download the `node_sqlite3-<os>-<arch>.node` file according to your OS, rename it to `node_sqlite3.node` and put it in one folder with the Monika binary file.

4. Install via [Chocolatey](https://community.chocolatey.org/packages/monika) (**Windows**)

   If you are using Windows and familliar with chocolatey, you can search the monika package in [Chocolatey Community Repository](https://community.chocolatey.org/). Type in `monika` in the search bar and you will find the package, then you can see the package detail and install it with just this command in Windows Power Shell (With Administrator permission)

   ```
   choco install monika
   ```

## Download the configuration file

Download the example configuration that uses Desktop notification [here](https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml) and rename it as monika.yml

## Run Monika

Monika by default reads a yaml configuration file called `monika.yml` in the current working directory if it exists. To run monika with the configuration file that you have downloaded before, run this command in the Terminal from the directory that contains the monika.yml file:

```bash
monika
```

You can specify a path to a YAML configuration file with `-c` flag if you didn't rename your configuration file as monika.yml, as follows

```bash
monika -c <path_to_configuration_file>
```

Better yet, you can provide a URL that contains monika configuration

```bash
monika -c https://domain.com/path/to/your/configuration.yml
```

Congratulations, you have successfully run Monika in your machine!

## Next Step

For advanced configuration such as configuring [notifications](https://monika.hyperjump.tech/guides/notifications), [probes](https://monika.hyperjump.tech/guides/probes), and [alerts](https://monika.hyperjump.tech/guides/alerts), you can find them on the sidebar menu.
