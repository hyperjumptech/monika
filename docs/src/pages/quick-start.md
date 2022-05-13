---
id: quick-start
title: Quick Start
---

At the center of Monika is a configuration file. Follow the steps below to quickly setup monitoring and get notification when a website is down via Desktop notifications.

## Installation

There are many ways to install Monika.

Please note that currently, only x64 architecture is supported.

### Windows

The recommendeded approach is to use [Chocolatey](https://community.chocolatey.org/packages/monika), a popular package manager for Windows. Please check [Monika page on Chocolatey](https://community.chocolatey.org/packages/monika) for more detailed information.

If Chocolatey is already available, then run the following command to install Monika:

```
choco install monika
```

If it does not work right away, try again on a command prompt or PowerShell with the Administrator permission.

Alternatively, Monika for Windows can be installed from its prebuilt binary. Head over to [Monika Releases page](https://github.com/hyperjumptech/monika/releases) and download the release archive marked with `win-x64`. Extract the contents of the archive and the executable `monika.exe` is ready to use.

### macOS

The recommended approach is to use [Homebrew](https://brew.sh/), a popular package manager for macOS. Please check [Monika page on Homebrew](https://formulae.brew.sh/formula/monika) for more detailed information.

If Homebrew is already available, then run the following command to install Monika:

```
brew install monika
```

Alternatively, Monika for macOS can be installed from its prebuilt binary. Head over to [Monika Releases page](https://github.com/hyperjumptech/monika/releases) and download the release archive marked with `macos-x64`. Extract the contents of the archive and the executable `monika` is ready to use. If necessary, make the file executable with `sudo chmod +x monika`.

### Linux

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/monika)

The recommended approach is to use [Snapcraft](https://snapcraft.io/), a universal package manager for Linux. Please check [Monika page on Snapcraft](https://snapcraft.io/monika) for more detailed information.

Alternatively, Monika for Linux can be automatically downloaded and installed by running an installation script as follows:

```
$ curl https://raw.githubusercontent.com/hyperjumptech/monika/main/scripts/monika-install.sh | sh
```

The binary will be placed in placed into `~/.local/bin`.

If you prefer to perform the installation manually, head over to [Monika Releases page](https://github.com/hyperjumptech/monika/releases) and download the release archive marked with `linux-x64`. Extract the contents of the archive and the executable `monika` is ready to use. If necessary, make the file executable with `sudo chmod +x monika`.

### via Node.js

With Node.js, Monika is also installable with [npm](https://npmjs.com):

```bash
$ npm i -g @hyperjumptech/monika
```

or [yarn](https://yarnpkg.com):

```bash
$ yarn global add @hyperjumptech/monika
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
