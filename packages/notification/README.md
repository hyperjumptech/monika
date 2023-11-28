# About

This is the notification package used by [Monika](https://github.com/hyperjumptech/monika).

## How to Use

For details about the various notification channels supported, see the [notification documentations here](https://monika.hyperjump.tech/guides/notifications). Or visit the Monika repository on github to see the sources.

## Contributing

See the main `README.md` in the Monika repository for contributing details.

## Releasing

The notification package is released to npm. When creating a PR for the package, please ensure that:

1. Linter is run.
2. The changes work with the main Monika application.
3. The command `npm run build` from packages/notification ran and builds without error.
4. The versions in ./package.json are properly incremented.
5. Create a PR to merge to `main`.

If releasing Monika application:

1. Ensure that the notification dependency is updated:

```yaml
 "dependencies": {
 "@hyperjumptech/monika-notification": x.y.z // enter the correct version here

```

## References

For further details see:

1. [Turborepo](https://turbo.build/repo/docs/handbook/workspaces#workspaces-which-depend-on-each-other)
2. [Monika docs](https://monika.hyperjump.tech/overview)
3. [Notification documentations](https://monika.hyperjump.tech/guides/notifications)
