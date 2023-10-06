# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.15.9 2023-10-06

## Fixed

- Fix: Monika Handshake to Symon Crashes If There is No Internet Connection (#1135)
- Fix: Monika Can not Send Alert to Symon (#1130)
- Fix: Monika exits when connected to Symon with an empty probe (#1123)
- Fix: change 20000 to 2000 for response time default alert log (#1120)

## Changed

- Add: custom http response from axios in docs (#1133)
- Deprecate: Incident and Recovery Threshold (#1129)
- Removed: isProbeResponsive Field (#1128)
- Docs: Remove incident and recovery threshold (#1127)
- Test: Set repeat flag to 1 for Monika command test (#1126)
- Restructure: PING request (#1125)
- Add: A new flag to use the Symon API version (#1124)
- Refactor: Set the Probe Alert ID as a Mandatory Type (#1122)
- Feat: Replace Incident and Recovery Threshold Mechanism with Backoff (#1119)

## 1.15.8 2023-09-05

## Fixed

- Monika Install (#1116)

## 1.15.7 2023-09-04

## Fixed

- Remove change empty array fallback for requests (#1113)
- Mailgun notification handle node 18 (#1105)

## Changed

- Make the Probe Result a Mandatory Type (#1111)
- Remove node_options environment variable when running test (#1112)
- Adding sendWithCustomContent in sendgrid (#1109)

## 1.15.6 2023-08-28

## Fixed

- Undefined Notification Message (#1103)
- Webhook Notification is Not Working (#1102)
- Make Probe Requests Property Optional (#1096)

## Changed

- Make HTTP Prober a Subclass (#1107)
- Test the Packages Directory (#1106)
- Update chaining request docs (#1101)
- Improve Disconnect Notification (#1095)
- Add simple success/fail result to each probe and new prometheus metric (#1061)

## 1.15.5 2023-08-14

## Fixed

- Fix permision for docs deployment (#1085)
- Fixed: Broken Docker Release Pipeline (#1086)
- Fix binary upload workflow (#1087)
- Fixed: Broken Publish Snapcraft Pipeline (#1088)
- Fixed: Empty Request Info for Non HTTP Probe (#1091)
- Fix doc build workflow (#1097)
- Fix default maxRedirect too shallow (#1070)
- Fix: Prevent Non-HTTP Probe to Create Prometheus Metrics (#1093)

## Changed

- Refactor: Add Base Class for Non HTTP Prober (#0174)
- Chore: Upgrade Node.js Version to 18 (#986)

## [1.15.4] - 2023-07-24

## Added

Feat: Improve Error Message When Request URL is not Using Protocol (#1063)
update readme to import exported notification package (#1054)
Doc/1050 update whatsapps docs (#1051)
update guides doc on payload (#1048)

## Fixed

chore: bump typescript and clean up (#1082)
tweak teams notification (#1080)
Fix broken Nightly Workflow (#1076)
Fixed: Confusing Notification Message for Non-HTTP Probe (#1072)
Clean error msg when failed to load config file (#1057)
Fix: crashes when some of the probe is removed from the configuration (#1067)
fix: move instatus to notification workspace and register it as a notification channel (#1056)
Fix: Probe Doesn't Run After Change Config (#1059)

## Changed

Chore: Upgrade Pino Version (#1079)
update workflows (#1073)
Limit workflow permissions and use environment vars to prevent injection. (#1071)
(origin/main, origin/HEAD) Refactor: Add Test for doProbe Function (#1064)
refactor: add abort controller to cancel running probe (#1058)
update workflows to build the notification package (#1055)
Chore: extract notification to workspace package (#1028)

## [1.15.3] - 2023-05-22

## Added

- Add redis url support (#1039)
- Allow unauthenticated SMTP (#1017)

## Fixed

- prometheus collector reassign on config change (#1021)

## Changed

- Docs: content footer (#1038)
- Remove Pako as it is no longer needed (#1044)
- Separate Initialize and Update Config (#1037)
- Drop node.js 14 support (#1041)
- Split the sanitize flag, get config, and update config phase and extract the get config function (#1035)
- Test out the built binaries from PKG in CI (#1033)

## [1.15.2] - 2023-04-13

## Fixed

- Update warning messages (#1022)
- Fix: Downgrade Axios to be able to build binary using PKG (#1029)

## Changed

- Refactor: Simplify Send Notification Interface (#1019)

## Docs

- Docs: update pagerduty notification and json schema (#1020)
- Docs: Update Deploy to Fly.io documentation (#1024)

## [1.15.1] - 2023-03-24

## Added

- Add mention of json schema in documentations (#1003)
- Instastatus integration (#971)
- Add Probe Fail Notification (#947)
- Add complementary prod_test using cli-testing library (#985)

## Changed

- Refactor: Reduce Code Complexity on run Function (#1006)
- Refactor: reduce function complexity (#998)
- Move the db operations to worker (#988)
- Refactor complex functions in validate.ts (#995)

## Updated

- Update schema testing workflow (#1005)
- Update Axios (#1014)
- Improves `package.json` keywords (#997)

## Fixed

- Loading multiple config files does not work (#1011)
- Reduce function complexity by separate and centralized all the prober in one directory (#1009)
- Loading Remote Config (#993)
- Create validate statuspage (#996)
- Fix Node.js version matrix (#992)
- Fix error when running -v and remove the unnecessary message (#984)

## [1.15.0] - 2023-01-20

## Added

- Report Limit and Report Interval Flags in Symon Mode (#961)

## Changed

- Use Node.js v16 for all release version of Monika (#968)
- SymonClient: Use Bree for Reporting to Symon (#972)

## Updated

- Improve History Log Type (#965)
- Improve Monika config type (#964)
- Add Monika flags type (#963)

## Fixed

- Fix GitHub checks warnings (#966)
- Make MSW Run on Node.js v18 (#967)
- Monika crashes when send incident/recovery event (#960)

## [1.14.1] - 2022-12-12

## Added

- Add Pushbullet notification channel (#946)

## Fixed

- Re-add query support (#956)
- Enable some eslint rules (#955) (#953)
- Fix Monika always send recovery at first time run in Symon mode (#952)
- Fix Config schema PR (#945) (#944)
- Improve config validation error message (#939)

## [1.14.0] - 2022-11-07

## Added

- Add Mariaor MySQL DB probe (#928)
- Add Atlassian Statuspage integration (#919)

## Updated

- Make timeout explicit for all probe and http requests (#917)
- Enable no-useless-catch rule (#935)

## Fixed

- Sending notifications when Monika is started (#934)
- Parses integer to string (#929)
- Auto PR JSON schema workflow (#926)

## [1.13.3] - 2022-10-17

## Added

- Add PostgreSQL probe type (#892)
- Add MongoDB Probe Request (#918)
- Add new Notification Gotify (#916)
- Add option to allow probing invalid ssl endpoint (#910)
- Verify config file with json schema (#882)
- Sonar-cloud workflow (#905)

## Fixed

- Repeating test failure (#909)
- Update source path for sonar cloud (#911)
- Test paths in SonarCloud workflow (#912)

## Updated:

- Update fake date test (#908)
- Update sonar cloud project name (#915)
- Update wget path (#920)

## Docs

- Update docs workflow (#904)
- Update Algolia JSON (#906)

## [1.13.2] - 2022-09-29

## Added

- Added: Import from simple Text File
- Added: Docs from Medium blog posts
- Added: Push docker Image any version

## Fixed

- Fixed: edit search UI
- Fixed: reduce complexity
- Fixed: Change repository name on Docker Publish from Tag github workflow
- Fixed: update workflow jq
- Fixed: deprecationHandler and sanitizeProbe alert bugs

## [1.13.1] - 2022-09-22

## Fixed

- Fix: Cannot compile alerts query (#887)

## [1.13.0] - 2022-09-19

## Added

- Redis Monitoring (#872)
- Generate a single probe from Sitemap (#883)

## Fixed

- Cannot send alert on first threshold (#881)

## Updated

- JSON Schema for Redis/Postgres Requests (#876)
- Implemented new probe mechanism (#861)
- Changed alerts.query into alerts.assertion (#880)

## [1.12.1] - 2022-09-02

## Fixed

- Monika doesn't save requests to local db and can't send report to Symon (#873)
- Pause probing when cannot report to Symon (#870)
- Docs: Grammar in docs (#868)

## Updated

- Request and response in verbose mode (#844)

## [1.12.0] - 2022-08-29

## Added

- Fake Data in URL, body, headers (#862)

## Fixed

- summary bug (#866)
- Make STUN non blocking (#856)
- Fix test timeout/repeatability when testing (#860)
- Docs: fix request chaining example (#850)

## Updated

- Refactor the probes (#863)
- Removes 'bats-support' from deps and update the Bats tests (#855)

## [1.11.0] - 2022-08-05

## Added

- Validation for timeout value (#832)
- Auto pr to schema store workflow (#839) (#838) (#836) (#829) (#837)
- TLS Certificate validation for JSON Schema (#831)

## Fixed

- Cannot run in symon mode via docker (#845)
- Docs: Examples in Notification page (#835)
- Wrong minimum response time in status notification (#822)

## Updated

- Docs: change link color in docs to purple (#840)
- Docs: configuration examples on probe page (#825)
- Docs: alert example (#823)
- Probe and Notification in JSON Schema (#820)

## [1.10.0] - 2022-07-26

## Added

- Add max-start-delay flag to prevent probes from starting at the same time (#817)
- Add follow-redirects flag (#819)
- Add status notification validation for JSON Schema (#816)

## Updated

- Docs: overview with list of features (#814)
- Docs: timeout information in probes page (#806)
- Docs: comments on all interval, timeout, and response time (#810)
- Docs: configuration file page (#787)

## Fixed

- chaining body response (#792)
- Docs: TOC obscured by header when scrolling down (#788) (#802)

## [1.9.3] - 2022-07-21

## Added

- Add test to validate example configs (#773)
- Integration test for auto reload on config change (#785)
- Docs: Add example for request chaining in body payload (#780)
- Docs: Add link to Hyperjump's Medium in the footer (#790)

## Updated

- Update config-schema (#778)
- Docs: fix yaml examples (#775)
- Docs: The alerts in Enabling Notification page still uses the old way (#781)

## Fixed

- TCP request doesn't make any request (#784)

## [1.9.2] - 2022-07-06

## Added

- JSON Schema for Monika configuration (#743)
- Prometheus Alert Metric (#761)
- Support reading sitemap (#751)
- Docs: copy code to clipboard (#772)

## Updated

- Check body type when parse the Postman collection file (#765)
- Docs: Various landing page refinement (#749)

## Fixed

- Postman parser doesn't parse correctly when contains body (#762)
- Docs: Wrong language in the code blocks in Configuration File page (#768) (#774)
- Docs: Fix Whatsapp toc link in notification page (#776)
- Docs: Change link in Notification page(#767) (#771)
- Docs: Improve documentation details (#758)
- Docs: Redundant title in New Notifications page(#754) (#759)
- Docs: Wrong tags in Alert and Raspberry pi pages (#753) (#760)

## [1.9.1] - 2022-07-06

## Updated

- Symon: send monika ID during handshake if available (#755)

## [1.9.0] - 2022-07-04

## Added

- support request chaining for body (#738)

## Updated

- Docs: the badges in README.md

## [1.8.2] - 2022-06-7

## Fixed

- Docker deployment (#737)

## [1.8.1] - 2022-06-7

## Fixed

- Fix not running all requests in the Postman collection (#731)
- Fix dockerfile and docs (#717)
- Add docker tag when pushing image to dockerhub (#704)
- Fix Mailgen Emails Breaks in iOS Email App when there is more than 1 recipients (#699)
- Docs: fix wrong options in docs workflow (#686)
- Docs: responsive table of content placement (#702) (#733)
- Docs: Fix docs build error (#734)
- Docs: Fix documentations erros (#732)
- Docs: Add missing entries to Table of Content (#729)
- Docs: Search Algolia error on mobile view (#728)
- Docs: Add Missing Documentation (#718)
- Docs: fix search-popup (#721)

## Updated

- Docs: Show list of integrations in the landing page (#707)
- Docs: Add Notification contributing how-to (#703)

## Removed

- Remove deprecated cli-ux and oclif packages (#693)

## [1.8.0] - 2022-06-06

## Added

- Nightly release script (#682)
- Deployment pipeline for Homebrew (#669)
- Docs: Algolia for searching docs (#668)
- Opsgenie integration (#677)
- Dingtalk notification (#673)
- Pushover notification (#671)

## Fixed

- Fix probes interval (#678)
- Fix unknown properties error (#675)
- Fix the medium articles in docs (#676)

## [1.7.3] - 2022-05-20

## Fixed

- Fix telegram notification (#665)
- Discord notification message (#657)
- Articles page in docs (#660)
- retries when re-reading configuration file (#653)
- eslint warnings (#646)
- TCP probing for symon (#642)
- default monika config directory (#645)

## Updated

- create default config file when there is none specified (#654)
- the installation quick-start guide (#659)
- allow manual trigger for GitHub Action's workflows (#641)

## Added

- Sitemap for docs (#664)
- ToC on docs (#651)

## [1.7.2] - 2022-04-11

## Fixed

- Empty archives when generating stand alone binaries (#639)

## [1.7.1] - 2022-04-11

## Updated

- Allow developing Monika using Node.js v16 (#633)
- Docs: Updated Readme (#631)

## Fixed

- Pipeline to deploy to Chocolatey (#629)
- Stand alone binary for macOS (#637)

## [1.7.0] - 2022-03-22

## Fixed

- Property error on tcp request (#626)
- "Unknown property" error when using some alert configuration (#617)

## Updated

- Landing page (#619)
- @oclif/core (#610)
- Recovery/incident after the first loop to Symon (#620)

## Added

- Install monika via Chocolatey (#623)
- Self update (#622)
- Support for tcp request (#618)
- Publish to Snapcraft (#606)

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
