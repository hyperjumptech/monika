# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.13] - 2022-02-17

## Fixed

- Insomnia flag error without -c default in CWD (#602)
- Auto reload monika for non-default configuration (#604)

## Added

- Docs: revamp landing page (#598)
- Docs: send cta click events to google analytics (#609)

## [1.6.12] - 2022-02-07

## Added

- Install script (#590)
- Support yaml for request payload (#596)
- Release Checksum (#595)
- Multipart/form-data content type support (#588)
- --symonLocationId flag for Symon handshake process (#589)
- Ping feature (#579)
- Docs: Deploy to Fly.io (#587)

## Fixed

- Not send recovery status when running on Symon mode (#594)

## Updated

- Update Cron Documentation (#592)

## [1.6.11] - 2022-01-24

## Added

- Pager Duty integration (#569)

## Fixed

- Crash when stun server is inaccessible (#576)
- Github actions (#570)

## Updated

- Typescript to Version 4 (#571)

## [1.6.10] - 2022-01-11

## Added

- Support for form-urlencoded (#565)
- Insomnia support (#560)
- Bats cli test (#542) (#548)

## Updated

- Creating config from Postman or Har results in yaml format now (#543)
- Docs: docker use (#557)
- Docs: config file yaml description (#559)
- Docs: running in background (#550)

## Fixed

- Stuck after finish all repetition (#547)
- Docs: handle get rss feed using getStaticProps (#545)

## [1.6.9] - 2021-12-14

## Fixed

- Error when showing version (#538)

## Added

- Docs: Show Medium articles in the docs (#539)

## Updated

- Docs: Update Request and Probe Alerts (#534)

## [1.6.8] - 2021-11-22

### Added

- Add Google chat notification channel (#523)
- Tweet status notification (#514)

### Fixed

- Docs: Update documentations for alert notification and old json examples (#525)
- Docs: update examples and documentation to you yaml (#519)
- Zero probes in status notification (#524)

### Updated

- Add send status when initiated, terminated and exited (#530)
- Add version to handshake data (#529)

## [1.6.7] - 2021-11-03

### Fixed

- Fix reported requests not deleted in symon mode (#520)

## [1.6.6] - 2021-11-02

### Fixed

- Fix windows desktop notification doesn't show (#517)
- Fix issue with symon reporting (#516)

### Updated

- Prevent status notification when in symon mode (#513)

## [1.6.5] - 2021-10-27

### Fixed

- Fix STUN interval bug (#509)
- Fix various issues with symon connection (#505 #508)

## [1.6.4] - 2021-10-25

### Fixed

- Missing host in monika status notification (#496)
- Empty message in incident/recovery notification (#488)
- Tests not running (#474 #475)
- Request chain not setting header (#472)
- Running average, max, and min response time in status notification (#442)
- Docs: broken links in overview (#481)

### Added

- Codecov for code coverage (#478 #480)
- Slack message update (#479)
- Prettify email notification with mailgen (#463)
- Incident duration in notification (#477)

### Updated

- Docs: Update Seo.js (#482)

## [1.6.3] - 2021-10-07

### Fixed

- Docs: minor url path installation (#462)
- Using yaml format with remote configuration (#459)
- In notification message, move Monika's version to new line (#452)
- Config file changes not detected (#447)

### Added

- Show which config is being used (#460)
- Limit database size (#444)
- Show summary of currently running Monika (#440)

## [1.6.2] - 2021-09-28

### Fixed

- Fix undefined app version when not running use npm (#432)
- Fix a TLS check issue with domain objects (#433)
- Fix resolve default config as array (#438)
- Fix Notification was sent when no state transition happen (#445)

### Added

- isEmpty alert query helper (#435)
- documentation for status notification schedule (#436)

### Changed

- make probe request response interface leaner (#439)

## [1.6.1] - 2021-09-22

### Added

- Update Raspberry Pi tutorial (#380)
- Add city and ISP in notification (#387)
- Docs: Update Monika Documentation Structure (#393)
- Compress binaries as ZIP when Releasing (#396)
- Tests: Add stub getPublicNetworkInfo to make test run faster (#401)
- Add alert for individual request (#390)
- Support an object for TLS check domains (#388)
- Docs: Add Yaml example configs (#404)
- Validate symon configuration (#413)
- Add support multiple args to config flag (#407)
- Add Larksuite notification (#425)
- Add Monika and OS Version in Notification Message (#429)
- Allow merge from --postman and --har with --config (#427)

### Changed

- Clean up average response time in the status summary (#398)
- Offload and centralized side effect only function (#392)
- Reorganize Event Emitter (#399)
- Attach incident and recovery thresholds calculation to each request and per alert (#410)
- Convert all test config files from .json to .yml (#421)
- Refactor: Change implementation of request log printing (#418)
- Changed: Database-less mode (#426)

### Fixed

- Stop STUN check loop on provided repeat flag (#375)
- Fix TLS check showing empty message (#386)
- Chain request header is not set on chaining request (#385)
- Change error message for non-http error (#405)
- Prometheus histogram in seconds, but response time is in milliseconds (#408)
- Double logs on multiple alerts (#402)
- Fix docs build (#411)
- Reorganize Cron Jobs (#417)
- Prevent Command with logs or flush Flag to Load Unneeded Function (#420)

## [1.6.0] - 2021-09-07

### Added

- Send Monika's status periodically (#354, #363)
- YAML file config support (#353)
- Templating feature for alert message configuration, and improvement in handling of alert in old format (#366)
- Secondary proof by periodically checking to STUN server (#357)
- City and ISP information on sent notifications (#369)
- ECONNRESET event detection (#368)
- Detect timeout and uri not found (#358)
- Add project and organization ID for symon configuration (#376)

### Changed

- alert notification message wording (#359)

### Fixed

- fatal error when config is updated because of wrong cron task destroy (#356)
- whatsapp.hyperjump.tech notification (#371)

### Removed

- `subject` property from alert config (#374)

## [1.5.1] - 2021-08-20

## Added

- Upload Binary Files when New Release (#345)

## [1.5.0] - 2021-08-19

### Added

- Added: Alert/Notification messages sent to Sendgrid channel (#324)
- Added: TLS Checker (#315)
- Added: Improve Alert/Notification messages sent to SMTP & mailgun channel (#317)
- Added: Improve Alert/Notification messages sent to channels (#309)
- Feature(config): [295] return after create configuration file (#302)
- feature(config): [297] fix monika json generated (#301)
- Add cli documentations (#298)
- feat: use native notifications and remove node-notifier (#329)
- Functional Suitability : Add More Methods to Monika (#299)
- Feat: Flexible user defined alert trigger (#333)
- Use vercel/pkg to generate single binaries (#338)

### Fixed

- Fix: 228 mailgun vulnerability (#325)
- Fix: do not overwrite existing config (#307)
- Fix issue #304 (#305)

### Changed

- refactor: simplified send desktop notification function (#342)
- refactor: improves message sent to monika whatsapp notifier (#340)
- refactor: update typings for notifications data and remove unused codes (#343)
- refactor: improves message sent to FB workplace (#339)
- refactor: improves message sent to webhook, slack, and discord (#337)
- refactor: improves message sent to telegram (#336)
- update monika config site (#334)
- chore: update response code (#327)
- Update Documentation with --force (#312)
- Chore/308 update status (#341)

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
