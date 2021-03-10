---
id: quick-start
title: Quick Start
---

To start monitoring URLs, you'll need a configuration file (JSON file) like an example below

> The configuration file contains the [probes](/guides/probes), [alerts](/guides/alerts), and [notification](/guides/notifications) configurations.

```
// config.json

{
  "interval": 0,
  "notifications": [
    {
      "id": "unique-id-mailgun",
      "type": "mailgun",
      "data": {
        "recipients": ["recipient1@mailgun.com"],
        "apiKey": "YOUR_API_KEY",
        "domain": "YOUR_DOMAIN"
      }
    },
    {
      "id": "unique-id-sendgrid",
      "type": "sendgrid",
      "data": {
        "recipients": ["recipient1@sendgrid.com"],
        "apiKey": "YOUR_API_KEY"
      }
    },
    {
      "id": "unique-id-smtp",
      "type": "smtp",
      "data": {
        "recipients": ["recipient1@smtp.com"],
        "hostname": "https://www.smtphostname.com",
        "port": 8080,
        "username": "smtpusername",
        "password": "smtppassword"
      }
    },
    {
      "id": "unique-id-webhook",
      "type": "webhook",
      "data": {
        "method": "POST",
        "url": "https://examplewebhookurl.com/webhook"
      }
    }
  ],
  "probes": [
    {
      "id": "1",
      "name": "Example",
      "description": "Probe",
      "request": {
        "method": "POST",
        "url": "https://something/login",
        "timeout": 7000,
        "headers": {
          "Authorization": ""
        },
        "body": {
          "username": "someusername",
          "password": "somepassword"
        }
      },
      "alerts": ["status-not-2xx", "response-time-greater-than-200-ms"]
    }
  ]
}
```

When you have created the configuration file, you can run monika as follows

```
// Automatically loads config file (config.json) in current working directory
monika

// Loads config file on specific file path
monika -c <path_to_your_configuration.json>
```
