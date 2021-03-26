# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

### [1.0.0] - 2021-03-10

#### Added

- CLI application to start HTTP probe for monitor HTTP server status.
- HTTP-Probe is executed with mandatory argument for probe execution configurations
- Notify an email in the event for unacceptable response code and response time.
- Email notification to an SMTP server, Mailgun or Sendgrid
- Support multiple probes and multiple notification channel
- Configuration using JSON upon start
- JSON configuration validation

### [1.1.0] - 2021-03-22

#### Added

- Counter threshold to make sure false positives
- Flags to make sure notification only send once for a failure series or success series.
- Record of events
- Slack notification channel
- Documentation improvements
- Preinstall script to enforce npm version lower than 7
- Probe persistent log

#### Changed

- Enhanced error message
- Interval now per-probe instead of for all probe

### [1.1.0] - 2021-03-26

#### Added

- Whatsapp Notification Channel
- Docs: add example to simulate HTML form submission POST request
- Docs: add instruction on how to run Monika in background

#### Changed

- Made Notifications optional in the configuration
- Improved log output
- Improved notification message

## [Planned]

### [1.2.0] - 2021-04-05

#### Add

- Web service for retrieving probe ids and probe data in time range
- Record of events in minute-to-minute and hour-to-hour bucket.
- Request chaining, where the result of 1st Probe HTTP resposne to be used in 2nd Probe HTTP request.
- Whatsapp notification channel
- MS Teams notification channel
- Telegram notification channel

### [1.2.0] - 2021-??-??

#### Add

- Monitor GRPC endpoint
- Monitor ICMP
