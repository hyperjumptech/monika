---
id: configuration-file
title: Configuration File
---

Monika uses a YAML file format to describe all the settings and configurations. A sample is included in the pproject can be seen `monika.example.yml`

The following are a summary of their settings. In general Monika and its configuration file, `monika.yml` is divided into three sections. A probe, an alert and a notification section.

## Probes

Probes describe the request(s) to perform on your service to test. A probe will include the request, the http url to test, its method, timeout and any headers that you might wish to add..

Here is an example probe:

```bash
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

For further details on probes, check the [guide here](https://monika.hyperjump.tech/guides/probes).

## Alerts

Alerts are part of probes, and describe the conditions to trigger an alert. Alerts are basicaly test condition for your service, such as http status, response time, or a particular response body.

The sample below shows an alert will be generated if http response status is 500 or the response time is greater than 150ms.

```bash
alerts:
  - query: response.status == 500
    message: resonse status is 500
  - query: response.time > 150
    message: response time is slow
```

For details on alerts and how you can configure different triggers, see the [guide here](https://monika.hyperjump.tech/guides/alerts) here.

## Notifications

Once an alert is triggered, Monika can send a notification through any of the supported channels.

A simple desktop alert for instance is done in two lines, see below:

```bash
notifications:
  - id: my-desktop-notif
    type: desktop

```

Monika supports standard channels such as email smtp:

```bash
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

Monika also support a wide variety of chat channels such as whatsapp, discord, Google chat, and even Lark Suite:

```bash
notifications:
  - id: myGoogleChatNotif
    type: google-chat
    data:
      url: https://chat.googleapis.com/v1/spaces/XXXXX/messages?key=1122334455

```

For the complete list of the different notification channels supported, visit the [guide here](https://monika.hyperjump.tech/guides/notifications).
