---
id: run-monika-in-raspberry-pi
title: Run Monika in Raspberry Pi
---

Raspberry Pi is a good hardware to run Monika. For [Raspbian OS](https://en.wikipedia.org/wiki/Raspberry_Pi_OS) user, you need to install NodeJS >= 14 manually since Raspbian package manager (apt) only install for NodeJS 8.

## Install Node 14 in Raspbian

Monika needs NodeJS >= 14 and npm ~= 6 to run.To install NodeJS 14 in Raspberry Pi (Raspbian OS), you need to get CPU architecture by running `uname`:

```bash
uname -a
```

Next, download NodeJS package that matches your architecture. For example, if your architecture is `arm v7`:

```bash
# Other architectures are available at https://nodejs.org/dist/v14.17.3
wget https://nodejs.org/dist/v14.17.3/node-v14.17.3-linux-armv7l.tar.xz
```

![uname example](/tutorials/raspberry-pi/uname-and-wget-node-arm-v7.png)

Un-tar the file:

```bash
tar xf node-v14.17.3-linux-armv7l.tar.xz
```

And install NodeJS globally:

```bash
sudo cp -R node-v14.17.3-linux-armv7l/* /usr/local/
```

![install nodejs](/tutorials/raspberry-pi/untar-and-install-node.png)

Check NodeJS and NPM version using this command:

```bash
node -v
npm -v
```

![nodejs & npm version](/tutorials/raspberry-pi/node-version-and-npm-version.png)

## Install and Run Monika in Raspbian

For now, the way to install Monika in Raspbian is to install from source code.

There are two ways to get Monika in Raspbian, from archive file and via Git.

- Download Monika source code archive

```bash
cd ~
mkdir monika-src
cd monika-src
# Download latest tarball and directly extract it to current directory
wget -c `wget -S -O - https://api.github.com/repos/hyperjumptech/monika/releases/latest | grep -o -E "https://(.*)tarball(.*)/([^\"]+)"` -O - | tar -xz --strip-components=1

```

- Get Monika from our Git repository

```bash
cd ~
git clone --depth 1 --branch `git -c 'versionsort.suffix=-' ls-remote --exit-code --refs --sort='version:refname' --tags https://github.com/hyperjumptech/monika.git '*.*.*' | tail -1 | cut -d'/' -f 3` https://github.com/hyperjumptech/monika.git
cd monika/
```

Looking for **other versions?** Check [here](https://github.com/hyperjumptech/monika/releases)

- Download Monika dependencies and prepack

```bash
npm install && npm run prepack
```

### Run Monika

To run Monika, use this command

```bash
./bin/run -c monika.example.yml
```

![nodejs & npm version](/tutorials/raspberry-pi/run-monika-example-json.png)
