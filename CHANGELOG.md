# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
