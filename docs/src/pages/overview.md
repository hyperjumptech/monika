---
id: overview
title: Overview
---

Monika is an open source and free synthetic monitoring command line application. The name Monika stands for "**Moni**toring Ber**ka**la", which means "periodic monitoring" in the Indonesian language.

## How it works

Monika operates by reading everything from the config file. From the configurations it will build and send the http requests. After each requests it sends any alerts if needed using the configured notifications (smtp, mailgun, sendgrid, webhook).

For more information, please refer to the detailed documentations below.

| Topic                                                                        | Description                                        |
| ---------------------------------------------------------------------------- | -------------------------------------------------- |
| [Probes](https://hyperjumptech.github.io/monika/guides/probes)               | How requests are set up and dispatched             |
| [Alerts](https://hyperjumptech.github.io/monika/guides/alerts)               | How alerts are triggered and how to setup an alert |
| [Notifications](https://hyperjumptech.github.io/monika/guides/notifications) | Receive notifications when alerts are triggered    |

## Motivation

It goes without saying, whether a front facing website or a backend service, everyone would like their services to be fast, performant and reliable. Good design, engineeering excellence and proper processes will contribute to these goals. Not to be overlooked is the importance tooling has on project succeses. Sadly good tools are not always budgeted, often relegated to something "nice to have" rather than "essential to have". This is our motivation. We believe the proper tools should go hand in hand with great teams and engineering processes. We believe tooling should be integrated with the development process and extends after deployment.

With this in mind Monika was created, a sythetic monitoring tool.

## Not just another tool

There are plenty of free monitoring tools online, but many fall short our requirements. Free uptime monitors exists, but these monitors only ping for service availability. Users don't typically use services only with pings. There are also plenty of real time monitoring tools. These tools by their very nature require real users which make them less suitable during development. With Monika, you can instead synthesize load scenarios during development, then use the same scenarios after deployment. Synthetic monitors allow QA teams for instance, to generate complex user flows for qualification. The same flows can be used to ensure production performance, and all without the need to install agents or third party libraries.

In addition, Monika will be easy to deploy. You can deploy Monika to your own servers in different regions and receive notifications when the quality of service from those regions degrade. All these features are available for free.

## Open source

Monika is open sourced. How many of you click the "Prices" tab every time after reading the feature page of a new product? By releasing Monika as open source, we hope to remove the entry barrier for small teams, startups and the hobbyist starting out. Sources are available for inspection, updates or feedback through our discussion forum [here](https://github.com/hyperjumptech/monika/discussions) leveraging the open source community.

## You talked me into it, so what now?

[Let's install it](https://hyperjumptech.github.io/monika/installation)!
