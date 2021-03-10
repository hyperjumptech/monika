# MONIKA

Monika is a Node.js command line application for synthetic monitoring. The name Monika stands for "**Moni**toring Ber**ka**la", which means "periodic monitoring" in Indonesian language.

## Installation

```bash
npm i -g @hyperjumptech/monika
```

## Getting Started

To start monitoring URLs, you need to create a configuration file (JSON file). The configuration file contains the probes, alerts, and notification configurations. You can check the sample configuration file in [config.json.example](https://github.com/hyperjumptech/monika/blob/main/config.json.example) or from our [docs](https://github.com/hyperjumptech/monika/quick-start).

When you have created the configuration file, you can run monika as follows

```bash
monika -c <path_to_your_configuration.json>
```

## Documentation

For more information, please refer to the [documentation](https://github.com/hyperjumptech/monika/overview).

## Discussion

If you need help, or have an idea to improve Monika, please let us know in the [Github discussions](https://github.com/hyperjumptech/monika/discussions).

## Development

This project is a Node.js application written in TypeScript. The tools we use in this project are as follows.

- [oclif](https://oclif.io/) to scaffold the CLI.
- [Prettier](https://prettier.io/) to format the code.
- [ESLint](https://eslint.org/) to statically analyze the code to quickly find problems.
- [Mocha](https://mochajs.org/) for testing.
- [Istanbul](https://istanbul.js.org/) for code coverage.

## License

MIT License.
