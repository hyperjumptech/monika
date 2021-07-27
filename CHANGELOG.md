# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2021-07-27

### Added

- Add google analytics with consent
- Add Prometheus Metric Server
- Add HAR file config definition
- Add support for postman config file
- Add termination notif
- Write config file from har or postman

### Fixed

- Cleanup log display in comand line (CLI)
- Move validate response to core plugin
- Fix iphone se 2 visuals on zoomed ui
- Move notification and store from probe to event emitter
- Fix throw error when bad id
- Add dockerignore to reduce size
- Fix footer deadlink
- Fix undefined bug in CLI logs

### Changed

- Change favicons

## [1.4.0] - 2021-06-30

### Added

- Emit event on receiving response
- Add Desktop Notifications for Notification Channel
- Check configuration from URL periodically
- Troubleshoot docs
- Tests for the production built
- Terminate event

### Changed

- Log messages
- Revamp landing page
- Docs: revamp design
- Append /v1/monika to symon url (**BREAKING CHANGE**). With this version, symon URL in Monika configuration now only use the base URL.

### Fixed

- Initial report to symon fails if the logs db is big
- Updated alerts is not displayed when config is updated with new alert options
- Array index error
- Fix spelling and some grammar
- Responsive mobile home page
- Move sanitizeConfig out of looper and add event emitter

## [1.3.7] - 2021-06-14

### Added

- Docs: Monika Whatsapp Notifier information
- Reload probes on config change
- Facebook workplace integration. [@adeyahya](https://github.com/adeyahya) in [#219](https://github.com/hyperjumptech/monika/pull/219)
- Read configuration from url

## [1.3.6] - 2021-06-02

### Added

- Add Monika Whatsapp Notifier documentation (#209)

### Changed

- Monika now does not save response body to database by default to save space (#198)
- Improved How-To Documentation (#205)

### Fixed

- Improved Probe ID checking when ID is user specified (#200)
- Fixed DB error when URL is unreachable (#201)
- Fixed sending incident notification to monika notification failure (#207)

## [1.3.5] - 2021-05-21

## Fixed

- Monika failed to write to database.

## [1.3.4] - 2021-05-21

### Added

- Store alerts and notifications events to database
- Ability to customize sequence of probe id to run

### Changed

- Docs: README, overview, installation, and quick-start
- Used [Joi](https://joi.dev/) library to validate notification configuration

### Fixed

- Flushing logs in monika-logs.db doesn't reduce the db size

## [1.3.3] - 2021-04-30

### Added

- Show the response size in the command line output.

## [1.3.2] - 2021-04-23

### Added

- Show link to [Monika config generator](https://github.com/hyperjumptech/monika-config-generator) when Monika cannot find the configuration file.
- Docs: Added links to Monika config generator on the landing page.

### Changed

- Default configuration file's name is now `monika.json`. Monika will search for `monika.json` first in the current directory. If it couldn't be found, Monika will search for `config.json`.
- Docs: Readme, Overview, and Notifications.

### Fixed

- Slow log prints when Monika is run with `-l` flag.

## [1.3.1] - 2021-04-09

### Added

- Discord notification. [@galanggg](https://github.com/galanggg) in [#125](https://github.com/hyperjumptech/monika/pull/125)

### Changed

- Docs and Readme are updated.

## [1.3.0] - 2021-04-01

### Added

- Chaining Requests (**BREAKING CHANGE**). Now you can use headers or body from the previous response in the next request. With this version, the `request` key in configuration is no longer used. The new `requests` key is used instead.
- Telegram Notification.
- Microsoft Teams Notification.
- Docs: Configuration examples for each notification channels.

### Removed

- The `request` key is no longer used.

### Changed

- Run Monika with minimum configuration. Now Monika can run with just a single URL.

### Fixed

- Start up email has no body when sent using SMTP.
- Error when the width of terminal/console is small.
- Docs: Broken links

## [1.1.0] - 2021-03-26

### Added

- Whatsapp Notification Channel
- Sends notifications when Monika starts to check the notification settings
- Docs: add example to simulate HTML form submission POST request
- Docs: add instruction on how to run Monika in background

### Changed

- Made Notifications optional in the configuration
- Improved log output
- Improved notification message

## [1.1.0] - 2021-03-22

### Added

- Counter threshold to make sure false positives
- Flags to make sure notification only send once for a failure series or success series.
- Record of events
- Slack notification channel
- Documentation improvements
- Preinstall script to enforce npm version lower than 7
- Probe persistent log

### Changed

- Enhanced error message
- Interval now per-probe instead of for all probe

## [1.0.0] - 2021-03-10

### Added

- CLI application to start HTTP probe for monitor HTTP server status.
- HTTP-Probe is executed with mandatory argument for probe execution configurations
- Notify an email in the event for unacceptable response code and response time.
- Email notification to an SMTP server, Mailgun or Sendgrid
- Support multiple probes and multiple notification channel
- Configuration using JSON upon start
- JSON configuration validation
