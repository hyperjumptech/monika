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
