---
id: configuration-file
title: Configuration File
---

Monika uses a YAML file to define all the settings and configurations. You can find a sample configuration file in the repository called [monika.example.yml](https://github.com/hyperjumptech/monika/blob/main/monika.example.yml).

> **Pro tips**: If you use [Visual Studio Code (VSCode)](https://code.visualstudio.com/) on a regular basis, you can write the configuration file with the help of auto completion by installing the [YAML extension for VSCode](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml). More information can be found in our [Creating Monika Configuration from Scratch using Autocomplete in Visual Studio Code](https://medium.com/hyperjump-tech/creating-monika-configuration-from-scratch-using-autocomplete-in-visual-studio-code-d7bc86c1d36a) blog post.

> **Another pro tips**: If you'd rather use a GUI to create the configuration file, you can use the [Monika Config Generator web app](https://monika-config.hyperjump.tech/).

In general Monika and its configuration file, `monika.yml` is divided into three sections. A probe, an alert and a notification section.

## Probes

Probes describe one or more requests to perform on your service to test. A probe will include the request, the URL to test, its method, timeout and any headers and body that you might wish to add.

Here is an example probe:

```yaml
probes:
  - id: 'submission_test'
    name: HTML form submission
    description: simulate html form submission
    interval: 10
    requests:
      - url: https://httpbin.org/status/200
        method: POST
        timeout: 7000
        headers:
          Content-Type: application/x-www-form-urlencoded
```

For further details on probes, check the [Probes guide](/guides/probes).

## Alerts

Alerts describe the conditions to trigger a notification. Alerts are basically test conditions for your service, such as http status, response time, or a particular response body.

The example below defines two alerts that will send notification if the HTTP response status is 500 or if the response time is greater than 150 ms.

```yaml
alerts:
  - query: response.status == 500
    message: response status is 500
  - query: response.time > 150
    message: response time is slow
```

For details on alerts and how you can define different kind of queries, see the [Alerts guide](/guides/alerts).

## Notifications

Once an alert is triggered, Monika will send one or more notifications through any of the supported channels that you defined.

For instance, a simple desktop notification needs to be defined as follows:

```yaml
notifications:
  - id: my-desktop-notif
    type: desktop
```

Or an e-mail notification via your own SMTP server can be done by defining the following configuration:

```yaml
notifications:
  - id: random-string-smtp
    type: smtp
    data:
      recipients: [RECIPIENT_EMAIL_ADDRESS]
      hostname: SMTP_HOSTNAME
      port: 587
      username: SMTP_USERNAME
      password: SMTP_PASSWORD
```

Note that you can define more than one notification and Monika will notify you through them all when an alert is triggered.

Monika supports a wide variety of communication channels such as WhatsApp, Discord, Google Chat, and many more. For the complete list of the different notification channels that Monika supports, visit the [Notifications](/guides/notifications) page.

> **Pro tips**: If the communication app you are using with your team is not supported by Monika, you can follow our guide to add it to Monika in [Add your choice of notification channels to Monika](https://medium.com/hyperjump-tech/add-your-choice-of-notification-channels-to-monika-640f398aa265) blog post. Some of the notification channels that Monika supports are thanks to fellow developers' open source contributions!
