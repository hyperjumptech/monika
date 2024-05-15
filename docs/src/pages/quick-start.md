---
id: quick-start
title: Quick Start
---

## Installation

There are many ways to install Monika. However, currently only x64 architecture is supported.

### Windows

The recommended approach is to use [Chocolatey](https://community.chocolatey.org/packages/monika), a popular package manager for Windows. Check [Monika page on Chocolatey](https://community.chocolatey.org/packages/monika) for more detailed information.

If you have installed Chocolatey in your PC, then run the following command to install Monika:

```bash
choco install monika
```

If it does not work right away, try again on a command prompt or PowerShell with the Administrator permission.

Alternatively, Monika for Windows can be installed from its prebuilt binary. Head over to [Monika Releases page](https://github.com/hyperjumptech/monika/releases) and download the release archive marked with `win-x64`. Extract the contents of the archive and the executable `monika.exe` is ready to use.

### macOS

The recommended approach is to use [Homebrew](https://brew.sh/), a popular package manager for macOS. Check [Monika page on Homebrew](https://formulae.brew.sh/formula/monika) for more detailed information.

If you have installed Homebrew, then run the following command to install Monika:

```bash
brew install monika
```

Alternatively, Monika for macOS can be installed from its prebuilt binary. Head over to [Monika Releases page](https://github.com/hyperjumptech/monika/releases) and download the release archive marked with `macos-x64`. Extract the contents of the archive and the executable `monika` is ready to use. If necessary, make the file executable with `sudo chmod +x monika`.

### Linux

The recommended approach is to use [Snapcraft](https://snapcraft.io/), a universal package manager for Linux. Check [Monika page on Snapcraft](https://snapcraft.io/monika) for more detailed information.

Alternatively, Monika for Linux can be automatically downloaded and installed by running an installation script as follows:

```bash
curl https://raw.githubusercontent.com/hyperjumptech/monika/main/scripts/monika-install.sh | sh
```

The binary will be placed into `~/.local/bin`.

If you prefer to perform the installation manually, head over to [Monika Releases page](https://github.com/hyperjumptech/monika/releases) and download the release archive marked with `linux-x64`. Extract the contents of the archive and the executable `monika` is ready to use. If necessary, make the file executable with `sudo chmod +x monika`.

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

Now it's time to [write your own configuration file](https://monika.hyperjump.tech/guides/configuration-file). You can use [VSCode with YAML extension for the auto completion feature](https://medium.com/hyperjump-tech/creating-monika-configuration-from-scratch-using-autocomplete-in-visual-studio-code-d7bc86c1d36a) or you can also use the[ Monika Config Generator web app](https://monika-config.hyperjump.tech/) if you prefer using Graphical User Interface (GUI).

For advanced configuration such as configuring [notifications](https://monika.hyperjump.tech/guides/notifications), [probes](https://monika.hyperjump.tech/guides/probes), and [alerts](https://monika.hyperjump.tech/guides/alerts), you can find them on the sidebar menu.
