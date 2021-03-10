# MONIKA

Monika is a command line application for synthetic monitoring. The name Monika stands for "**Moni**toring Ber**ka**la", which means "periodic monitoring" in the Indonesian language.

## Installation

Just install from the npm package manager

```bash
npm i -g @hyperjumptech/monika
```

You can also use `Monika` from source. Just clone the repository, pull dependencies.

```bash
git clone git@github.com:hyperjumptech/monika.git
npm ci
```

## Getting Started

To start monitoring URLs, you need to create a configuration file (JSON file). The configuration file contains the probes, alerts, and notification configurations. You can check the sample configuration file in [config.json.example](https://github.com/hyperjumptech/monika/blob/main/config.json.example) or from our [docs](https://github.com/hyperjumptech/monika/quick-start).

When you have created the configuration file, you can run `monika` as follows

```bash
monika -c <path_to_your_configuration.json>
```

Options and parameters can be seen by entering `monika -h` or `bin/run -h`

## How it works

Monika operates by reading everything from the config file. From the configurations it will build and send http requests. After each requests it checks against any alerts and notifications it needs to perform.

For more information, please refer to the detailed documenntations below.

| Topic                                                    |                    Description                     |
| :------------------------------------------------------- | :------------------------------------------------: |
| [Probes](./docs/src/pages/guides/probes.md)              |       How requests are set up and dispatched       |
| [Alerts](./docs/src/pages/guides/alrts.md)               | How alerts are triggered and how to setup an alert |
| [Notifcations](./docs/src/pages/guides/notifications.md) |  Receive notifications when alerts are triggered   |

## Discussions

If you need help, want to give feedback, or have a great idea to improve Monika, get involved! Let us know in the [Github discussions](https://github.com/hyperjumptech/monika/discussions).

Please abide by the [Contributor's Code of Conduct](CODE_OF_CONDUCTS.md)

## Development

This project is a Node.js application written in TypeScript. The tools we use in this project are as follows.

- [oclif](https://oclif.io/) to scaffold the CLI.
- [Prettier](https://prettier.io/) to format the code.
- [ESLint](https://eslint.org/) to statically analyze the code to quickly find problems.
- [Mocha](https://mochajs.org/) for testing.
- [Istanbul](https://istanbul.js.org/) for code coverage.

## License

MIT License.
