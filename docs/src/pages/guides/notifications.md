---
id: notifications
title: Notifications
---

## Notification Types

In `Monika`, we provide multiple notification channels. Notifications are available through sendgrid, mailgun, smtp and webhook.

## Configurations

Notification could be sent through multiple channels and emails. You should define notification mechanism in the configuration as shown in `config.example.json` bellow.

```json
"notifications": [
    {
      "id": "unique-id",
      "type": "mailgun",
      "data": {
        "recipients": ["mantap@jiwa.com"],
        "apiKey": "YOUR_API_KEY",
        "domain": "YOUR_DOMAIN"
      }
    },
    {
      "id": "unique-id",
      "type": "sendgrid",
      "data": {
        "recipients": ["mantap@jiwa.com"],
        "apiKey": "YOUR_API_KEY"
      }
    },
    {
      "id": "unique-id",
      "type": "smtp",
      "recipients": ["a@a.com"],
      "data": {
        "recipients": ["mantap@jiwa.com"],
        "hostname": "https://www.dennypradipta.com",
        "port": 8080,
        "username": "dennypradipta",
        "password": "bismillah"
      }
    },
    {
      "id": "unique-id-webhook",
      "type": "webhook",
      "data": {
        "recipients": ["mantap@jiwa.com"],
        "method": "POST",
        "url": "https://examplewebhookurl.com/webhook"
      }
    }
  ],
```

## Mailgun

Mailgun is an email notification delivery provided by Mailgun email service. To use mailgun for your notification, you
would need a mailgun account to obtain your API_KEY and DOMAIN. Please consult [mailgun documentation here](https://documentation.mailgun.com/en/latest/quickstart.html) on how to obtain them. Once that done, you could use the API_KEY and DOMAIN in monika's json configuration as follows;

```json
{
  "id": "unique-id",
  "type": "mailgun",
  "data": {
    "recipients": ["mantap@jiwa.com"],
    "apiKey": "YOUR_API_KEY",
    "domain": "YOUR_DOMAIN"
  }
}
```

| Key        | Description                                                                  | Example                                         |
| ---------- | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| ID         | Notification identity number                                                 | `Mailgun12345`                                  |
| Type       | Notification types                                                           | `mailgun`                                       |
| Recipients | An array of email addresses that will receive the e-mail from Monika         | `["monika@testmail.com", "symon@testmail.com"]` |
| Api Key    | Mailgun's account api key, mailgun's registered key to identify your account | `70e34aba-0ea908325`                            |
| Domain     | Domain registered in mailgun                                                 | `sandbox.monika.com`                            |

## Sendgrid

Similar to mailgun, sendgrid is also an email delivery service. First, sign up for an account in sendgrid and get the API key. Please check [sendgrid's documentation](https://sendgrid.com/docs/api-reference/). Then put the API key in Monika's configuration as follows.

```json
{
  "id": "unique-id",
  "type": "sendgrid",
  "data": {
    "recipients": ["mantap@jiwa.com"],
    "apiKey": "YOUR_API_KEY"
  }
}
```

| Key        | Description                                                                  | Example                                         |
| ---------- | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| ID         | Notification identity number                                                 | `Sendgrid12345`                                 |
| Type       | Notification types                                                           | `sendgrid`                                      |
| Recipients | An array of email addresses that will receive the e-mail from Monika         | `["monika@testmail.com", "symon@testmail.com"]` |
| Api Key    | Mailgun's account api key, mailgun's registered key to identify your account | `70e34aba-0ea908325`                            |

`Monika` is using @sendgrid/mail library for sending the sendgrid type notification. `Monika` will breakdown the configuration set the sengrid type API_KEY settings and send the message using the library.

## SMTP

SMTP (Simple Mail Transfer Protocol) is an email service using the TCP/IP protocol. For this you need to have an active email account to be used as transporter, a middle service that relays the email sending process.

```json
{
  "id": "unique-id",
  "type": "smtp",
  "recipients": ["a@a.com"],
  "data": {
    "recipients": ["mantap@jiwa.com"],
    "hostname": "smtp.mail.com",
    "port": 222,
    "username": "dennypradipta",
    "password": "bismillah"
  }
}
```

| Key        | Description                                                          | Example                                         |
| ---------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| ID         | Notification identity number                                         | `Smtp12345`                                     |
| Type       | Notification types                                                   | `smtp`                                          |
| Recipients | An array of email addresses that will receive the e-mail from Monika | `["monika@testmail.com", "symon@testmail.com"]` |
| Hostname   | The smtp host that you will be using for sending the email           | `smtp.gmail.com`                                |
| Port       | The port allowed to be used for sending mail in your host            | `587`                                           |
| Username   | Registered username on your smtp server                              | `yourusername@gmail.com`                        |
| Password   | The password set for your username                                   | `thepasswordforyourusername`                    |

`Monika` will breakdown the configuration with type `smtp`, registering the username and password to the mail host with certain port and create a transporter to send to your recipient addresses.

## Webhook

Besides the email notifications, `Monika` also provide webhook service using REST API calls and POST methods.

```json
{
  "id": "unique-id-webhook",
  "type": "webhook",
  "data": {
    "recipients": ["mantap@jiwa.com"],
    "method": "POST",
    "url": "https://examplewebhookurl.com/webhook"
  }
}
```

| Key        | Description                                                          | Example                                         |
| ---------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| ID         | Notification identity number                                         | `Webhook12345`                                  |
| Type       | Notification types                                                   | `webhook`                                       |
| Recipients | An array of email addresses that will receive the e-mail from Monika | `["monika@testmail.com", "symon@testmail.com"]` |
| Method     | HTTP method POST or PUT                                              | `POST`                                          |
| Url        | The URL of the server that will receive the webhook notification     | `https://yourwebsite.com/webhook`               |

Using the webhook type configuration, `Monika` will send a request with the following body:

```js
body: {
  url: string
  time: string
  alert: string
}
```

Keep watch on these pages, new notification methods are being developed.
