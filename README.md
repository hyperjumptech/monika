![](https://raw.githubusercontent.com/hyperjumptech/monika/main/docs/public/monika.svg)

[![Build Status](https://github.com/hyperjumptech/monika/workflows/Node.js%20CI/badge.svg?event=push&branch=main)](https://github.com/hyperjumptech/monika/actions) [![codecov](https://codecov.io/gh/hyperjumptech/monika/branch/main/graph/badge.svg?token=O3WVT7DP6F)](https://codecov.io/gh/hyperjumptech/monika) [![npm-version](https://img.shields.io/npm/v/@hyperjumptech/monika)](https://www.npmjs.com/package/@hyperjumptech/monika) [![npm](https://img.shields.io/npm/dt/@hyperjumptech/monika?label=NPM%20Downloads)](https://www.npmjs.com/package/@hyperjumptech/monika) [![Docker](https://img.shields.io/docker/pulls/hyperjump/monika)](https://hub.docker.com/r/hyperjump/monika)

# About

Monika is a command line application for synthetic monitoring. The name Monika stands for "**Moni**toring Ber**ka**la", which means "periodic monitoring" in the Indonesian language.

## How to Use

You can find many ways to install Monika and how to start monitoring from the [Quick Start page](https://monika.hyperjump.tech/quick-start).

## Contributing

Monika is a Node.js application written in TypeScript using the [oclif framework](https://oclif.io/).  
It was developed on **node v18 (LTS)**, and **npm v9**.

To start developing, clone this repository, then install the dependencies:

```bash
git clone git@github.com:hyperjumptech/monika.git
npm ci
npm run build -w packages/notification
```

Then, to run Monika from the source,

- on Linux/Unix/Mac

```bash
npm start
```

- on Windows

```bash
.\bin\dev.cmd
```

To keep the formatting consistent, run the following command to format the source code:

```bash
npm run format
```

Finally you can also run `npm run test` to prevent regression.

Once you have made the changes, open a Pull Request and explain the issue your change will fix or the feature your change will add.

For contribution details on how to add custom notifications [see the New Notifications guide here](https://monika.hyperjump.tech/guides/new-notifications).

### Applying changes in monorepo workspaces folder (`packages/notification`)

If you are developing feature/fix related to notification by making changes inside the `packages/notification` folder, it's easier to temporarily change the dependency source in `package.json` to be like this

```
"@hyperjumptech/monika-notification": "*"
```

it will sync `@hyperjumptech/monika-notification` package `node_modules` to any changes in the `packages/notification` folder without running build on every code change.

See this [docs](https://turbo.build/repo/docs/handbook/workspaces#workspaces-which-depend-on-each-other) for further detail

### How to Test Probe Locally

If you need to test a probe locally, there are predefined services in /dev/docker-compose.yaml. You are **encouraged** to add other services that can be probed by Monika. Run `cd dev && docker compose up` to run those services.

#### Available Services

Use the following Monika config to probe the service.

##### MariaDB

```yaml
probes:
  - id: mariadb
    mariadb:
      - host: localhost
        port: 3306
        username: mariadb_user
        password: mariadb_password
        database:
```

##### MySQL

```yaml
probes:
  - id: mysql
    mysql:
      - host: localhost
        port: 3307
        username: mysql_user
        password: mysql_password
        database:
```

##### MongoDB

```yaml
probes:
  - id: mongo
    mongo:
      - uri: mongodb://mongo_user:mongo_password@localhost:27017
```

##### PostgreSQL

Use the following Monika config to probe the service.

```yaml
probes:
  - id: postgres
    postgres:
      - uri: postgres://postgres_user:postgres_password@localhost:5432/postgres_db
```

##### Redis

```yaml
probes:
  - id: redis
    redis:
      - uri: redis://:redis_password@localhost:6379
```

## Development References

The tools and frameworks we used in this project are listed below:

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

<a href="https://www.producthunt.com/posts/monika-2?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-monika&#0045;2" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=332404&theme=light" alt="Monika - Open&#0032;source&#0032;and&#0032;free&#0032;HTTP&#0032;monitoring&#0032;tool | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

## License

[MIT](./LICENSE.txt) License.
