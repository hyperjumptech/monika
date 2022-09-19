---
id: overview
title: Overview
---

Monika is an **open source** and **free synthetic monitoring** command line application. The name Monika stands for "**Moni**toring Ber**ka**la", which means "periodic monitoring" in the Indonesian language.

## How it works

Monika operates by reading everything from a configuration file. Based on the configuration, it will build and send out HTTP or TCP requests. If the request's response is not as expected, Monika will send notification via various channels (E-mail, webhook, Telegram, WhatsApp, and many more).

For more information, please refer to the detailed documentations below.

| Topic                                  | Description                                                     |
| -------------------------------------- | --------------------------------------------------------------- |
| [Probes](/guides/probes)               | How requests are set up and dispatched                          |
| [Alerts](/guides/alerts)               | How alerts are triggered and how to setup an alert              |
| [Notifications](/guides/notifications) | How to receive notifications when alerts are triggered          |
| [TLS Checkers](/guides/tls-checkers)   | Check TLS validity and send notification before the expiry time |
| [CLI Options](/guides/cli-options)     | How to run monika from the command line                         |

## Features

Monika has grown rapidly since its conception and currently it has variety of the following features.

- Monitor [multiple probes](/guides/probes) in which each probes can contain multiple HTTP requests.
- [Request chaining](/guides/examples#requests-chaining) to use data from a response in subsequent requests.
- Monitor [TCP servers](/guides/probes#tcp).
- Get notifications when an alert is triggered via a growing number of [notification channels](/guides/notifications).
- Run Monika or create configuration file from a [HAR file](/guides/probes#har-file-support), a [Postman file](/guides/probes#postman-json-file-support), an [Insomnia file](/guides/probes#insomnia-file-support), and a [sitemap file](/guides/cli-options#sitemap).
- Check [TLS certificate status](/guides/tls-checkers).
- Create complex [alert's assertion](/guides/alerts#alert-assertion) to trigger an alert based on the response's status code, response's time, size, headers, and the received data.
- [Run Monika from a URL](/quick-start#run-monika).
- Receive periodical [status notification](/guides/status-notification) about the status of Monika and the probes.
- Connect to [Prometheus](/guides/cli-options#prometheus).
- Run Monika from [multiple configuration files](/guides/cli-options#multiple-configurations).

## Motivation

Anyone who has created a website or a backend service would want them to be fast, robust and perform well all the time. Good design, engineering excellence, and proper processes will contribute to these goals. Yet, what is often overlooked is the importance of monitoring tools have on a project's success. Hence the budget for some type of monitoring tool is often marked as optional rather than a must have. This what motivates us. We believe proper monitoring tools must be setup from the very beginning. Any development team should integrate monitoring tools in their development process. Then they should be able to extend it into production deployment.

### Not just another tool

There are plenty of free monitoring tools online, but many fall short of our requirements. Free uptime monitors exists, but they only ping for service's availability. Most users don't use services only with pings. There are also plenty of real time monitoring tools. These tools need real users, which make them less suitable during development. Monika however, can synthesize usage scenarios during development, and you can use the same scenarios in production. **Synthetic monitoring** tool like Monika enables you to generate complex usage flows for quality assurance. Those same flows later on can be deployed to check the production environment. All without the need to install agents or third party libraries.

In addition, Monika is relatively easy to deploy. You can deploy Monika to multiple servers in different locations (for example via [Docker](/tutorial/run-in-docker)). Afterwards, Monika can generate and send notifications when service's degradation is detected from any of the locations. **All these features are available for free**.

### Open source

Monika is **open source** and **free** because we want it to be available even for budget strapped teams. Monika's source code is always open for inspection. Follow any updates or give feedbacks through our [discussion forum](https://github.com/hyperjumptech/monika/discussions). You can also contribute to this project by reporting and fixing bugs or by [adding a new notification channel](/guides/new-notifications).
