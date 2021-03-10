# Monika

Monika is a monitoring utility. We believe monitoring should be simple, well-made and open sourced. Monika is a set a tools and services being developed to implement synthetic monitoring.

## How it works

Monika systematically performs http request to a url you specify. It reads a configuration file `config.json`. Based on the configuration file, Monica repeatedly sends http requests. The interval, url, payloads, headers and subsequent alerts and notification options are read from this configuration files.

Further reading how Monica works can be found here:

1. [Probes](probes.md) : How monica models requests, how to setup requests.
2. [Alerts](alerts.md) : How to setup alerts conditions.
3. [Notifications](notifications.md) : How to redeive notifications when alerts occurs.

## Requirements

Requirements are very basic. You only need:

- node.js
- npm

## Installation

There are two methods where you can install Monika monitoring.

### From Source

You can clone the repository. You will need the git utility.

```bash
git clone https://github.com/hyperjumptech/monika
```

Install dependencies and example configuration.

```bash
npm ci
cp config.json.example
```

Running is just calling the binary in the bin/ directory:

```
./bin/run
```

### From npm

You can install from npm

<!-- usage -->

```sh-session
$ npm install -g @hyperjumptech/monika
$ monika COMMAND

running command...
$ monika (-v|--version|version)
@hyperjumptech/monika/0.0.0 linux-x64 node-v10.22.1
$ monika --help [COMMAND]
USAGE
  $ monika COMMAND
```

<!-- usagestop -->

### Commands

For help type

```bash
./bin/run -h
```

or

```bash
monika -h
```

To run and specify a custom config file

```bash
./bin/run -c /yourdir/config.json
```

or

```bash
monika -c /yourdir/config.json
```

<!-- commands -->

<!-- commandsstop -->

## Contributing

Find an issue? Like to add something? Report a bug? Get involved!  
Start a discussion here at `https://github.com/hyperjumptech/monika/discussions`.

Please abide by the [Contributor Code of Conduct](./code_of_conduct.md)

## License

[License File](License.md)
