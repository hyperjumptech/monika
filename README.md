# MONIKA

[![Build Status](https://github.com/hyperjumptech/monika/workflows/Node.js%20CI/badge.svg?event=push&branch=main)](https://github.com/hyperjumptech/monika/actions)

Monika is a command line application for synthetic monitoring. The name Monika stands for "**Moni**toring Ber**ka**la", which means "periodic monitoring" in the Indonesian language.

## Installation

Install from the npm package manager (you need to install Node.js first)

```bash
npm i -g @hyperjumptech/monika
```

You can also use `Monika` from source. Clone this repository then install the dependencies.

```bash
git clone git@github.com:hyperjumptech/monika.git
npm ci
```

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
