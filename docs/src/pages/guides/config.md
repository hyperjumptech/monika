---
id: monika.yml
title: monka.yml
---

Monika uses a yaml file format to describe all the settings and configurations. Built-in example is included can be seen `monika.example.yml`
The following are a summary of their settings.

In general Monika and its configuration file, `monika.yml` is divided into three general section. The probe, an alert section and a notification section.

## Probes

Probes describe the request to perform on your service to test. A probe will include the request, made up of the http url to test, method, timout and any headers that you might need.

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

```bash
alerts:
  - query: response.status == 500
    message: resonse status is 500
  - query: response.time > 150
    message: response time is slow
```

For further documentation on alerts, see the [guide here](https://monika.hyperjump.tech/guides/alerts) here.

## Notifications

Once an alert is triggered, Monika can send a notification through any of of the supported channels.

A simple desktop alert is shown below:

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

To a variety of chat channels like whatsapp, discord and Google chat:

```bash
notifications:
  - id: myGoogleChatNotif
    type: google-chat
    data:
      url: https://chat.googleapis.com/v1/spaces/XXXXX/messages?key=1122334455

```

For complete list of the different notification channels, visit the [guide here](https://monika.hyperjump.tech/guides/notifications).
