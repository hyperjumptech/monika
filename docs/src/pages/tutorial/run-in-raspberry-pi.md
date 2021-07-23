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

Next, download NodeJS for particular architecture. Example for architecture `arm v7`:

```bash
wget https://nodejs.org/dist/v14.17.3/node-v14.17.3-linux-armv7l.tar.xz
```

![uname example](/tutorials/raspberry-pi/uname-and-wget-node-arm-v7.png)

Untar the file:

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

## Run Monika in Raspbian

You can install Monika by source using git clone and npm install:

```bash
cd ~
git clone https://github.com/hyperjumptech/monika.git
cd monika/
npm install
```

![nodejs & npm version](/tutorials/raspberry-pi/git-clone-and-npm-install.png)

Finally, run Monika using this command:

```bash
./bin/run -c monika.example.json
```

![nodejs & npm version](/tutorials/raspberry-pi/run-monika-example-json.png)
