![](https://raw.githubusercontent.com/hyperjumptech/monika/main/docs/public/monika.svg)

[![Build Status](https://github.com/hyperjumptech/monika/workflows/Node.js%20CI/badge.svg?event=push&branch=main)](https://github.com/hyperjumptech/monika/actions) [![codecov](https://codecov.io/gh/hyperjumptech/monika/branch/main/graph/badge.svg?token=O3WVT7DP6F)](https://codecov.io/gh/hyperjumptech/monika)

# About

Monika is a command line application for synthetic monitoring. The name Monika stands for "**Moni**toring Ber**ka**la", which means "periodic monitoring" in the Indonesian language.

## How to Use

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/monika)

Please see the [overview](https://hyperjumptech.github.io/monika/overview) to see documentations on how to install and how to use Monika.

## Contributing

You can install Monika from the npm package manager:

```bash
npm i -g @hyperjumptech/monika
```

Monika is basically a node.js application written in typescript built around the oclif framework.  
It was developed on **node v14 (LTS)**, and **npm v6**. You can run `npm version` for a complete version list.

You can fetch, build, and use `Monika` from source. Clone this repository then install the dependencies like below:

```bash
git clone git@github.com:hyperjumptech/monika.git
npm ci
```

run `Monika`

- on Linux/Unix/Mac

```bash
npm start
```

- on Windows

```bash
.\bin\run.cmd
```

Keep your codes formatted with **npm scripts** and ensure **eslint plugin** is installed and allowed to make changes in your IDE.

```bash
npm run format
```

Finally you can also run `npm run test` to ensure changes do not break the code.

## Development References

The tools and frameworks we used in this project are listed below.

- [oclif](https://oclif.io/) to scaffold the CLI.
- [Prettier](https://prettier.io/) to format the code.
- [ESLint](https://eslint.org/) to statically analyze the code to quickly find problems.
- [Mocha](https://mochajs.org/) for testing.
- [Istanbul](https://istanbul.js.org/) for code coverage.

## Discussions

If you need help, want to give feedback, or have a great idea to improve Monika, get involved! Let us know in the [Github discussions](https://github.com/hyperjumptech/monika/discussions).

Please abide by the [Contributor's Code of Conduct](CODE_OF_CONDUCTS.md)

## Further information

For detailed information, you can click on any of the specific docs below:

- [Quick Start](https://hyperjumptech.github.io/monika/quick-start)
- [Installations](https://monika.hyperjump.tech/quick-start#installation)
- [How it works](https://hyperjumptech.github.io/monika/guides/probes)

## License

[MIT](./LICENSE.txt) License.
