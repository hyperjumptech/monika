---
id: overview
title: Overview
---

Monika is an open source and free synthetic monitoring command line application. The name Monika stands for "**Moni**toring Ber**ka**la", which means "periodic monitoring" in the Indonesian language.

## How it works

Monika operates by reading everything from a config file. Based on the configuration it will build and send out http requests. If the request response is not as expected, Monika will create an alert. The alert then can be sent via various notification channel (email, webhook, telegram, whatsapp, etc.).

For more information, please refer to the detailed documentations below.

| Topic                                                                        | Description                                            |
| ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| [Probes](https://hyperjumptech.github.io/monika/guides/probes)               | How requests are set up and dispatched                 |
| [Alerts](https://hyperjumptech.github.io/monika/guides/alerts)               | How alerts are triggered and how to setup an alert     |
| [Notifications](https://hyperjumptech.github.io/monika/guides/notifications) | How to receive notifications when alerts are triggered |

## Motivation

Anyone who created a website or a backend service, would want them to be fast, robust and perform well at all time. Good design, engineering excellence and proper processes will contribute to these goals. Yet, what is often overlook is the importance of a monitoring tool has on a project successes. Hence the budget for a monitoring tool is often marked as optional rather than must have. This is our motivation. Proper monitoring tools must be setup from the very beginning. Any development team should integrate monitoring tools in their development process. Then they should extend it into production deployment.

With this in mind, we created Monika, a synthetic monitoring tool.

## Not just another tool

There are plenty of free monitoring tools online, but many fall short of our requirements. Free uptime monitors exists, but they only ping for service availability. Most users don't use services only with pings. There are also plenty of real time monitoring tools. These tools need real users, which make them less suitable during development. Monika can synthesize usage scenarios during development, then use same scenarios in production. Synthetic monitoring tool enable you to generate complex usage flows for quality assurance. Those same flows later on can be deploy to check the production environment. All without the need to install agents or third party libraries.

Besides, Monika is easy to deploy. You can deploy Monika to many servers in different locations. Afterward, Monika will send notification if any of those location experiencing service degradation. All these features are available for free.

## Open source

Monika is open sourced. How many of you click the "Pricing" menu every time after reading the feature page of a new product? Because it's an open source, we are removing barrier for budget strapped teams. Monika's source code is always open for inspection. Follow any updates or give feedbacks through our discussion forum [here](https://github.com/hyperjumptech/monika/discussions).

## You talked me into it, what now?

[Let's install Monika](https://hyperjumptech.github.io/monika/installation)
