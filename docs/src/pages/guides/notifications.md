---
id: notifications
title: Notifications
---

## Notification Types

In `Monika`, we provide multiple notification channels. Notifications are available through sendgrid, mailgun, smtp and webhook.

## Configurations

Notifications can be sent through multiple channels and mail accounts, each are defined through configuration such as in the file `config.json.example` below.

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

Mailgun is the notification channel through the mailgun email service. First, you need to have a mailgun account, then get the API key and DOMAIN. Please check out the [documentation in mailgun](https://documentation.mailgun.com/en/latest/quickstart.html). Put the API key and the DOMAIN in the monika's configuration as follows.

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

**ID**
Notification ID, to identify the notification number.

**Type**
Type of Notification in this case it would be set as `mailgun`.

**Data**
The detail settings needed to send a mailgun.

**Recipients**
An array of email addresses that will receive the e-mail from Monika. ex. `["monika@testmail.com", "symon@testmail.com"]`

**Api Key**
Mailgun's account api key, mailgun's registered key to identify your account. ex. `70e34aba-0ea908325`

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

**ID**
Notification ID, to identify the notification number.

**Type**
Type of Notification in this case it would be set as `sendgrid`.

**Data**
The detail settings needed for sending email through sendgrid.

**Recipients**
An array of email addresses that will receive the e-mail from Monika. ex. `["monika@testmail.com", "symon@testmail.com"]`

**Api Key**
The api key that sendgrid gives for your account.

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

**ID**
Notification ID, to identify the notification number.

**Type**
Type of Notification in this case it would be set as `smtp`.

**Data**
The detail settings needed for sending email through smtp.

**Recipients**
An array of email addresses that will receive the e-mail from Monika. ex. `["monika@testmail.com", "symon@testmail.com"]`

**Hostname**
The smtp host that you will be using for sending the email. ex. `smtp.gmail.com`

**Port**
The port that has been allowed to be used for sending mail in your host. ex. `587`

**Username**
The username that has been registered on your smtp server. ex. `yourusername@gmail.com`

**Password**
The password set for your username. ex. `thepasswordforyourusername`

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

**ID**
Notification ID, to identify the notification number.

**Type**
Type of Notification in this case it would be set as `webhook`.

**Data**
The detail settings needed for sending alerts through webhook.

**Recipients**
An array of email addresses that will receive the e-mail from Monika. ex. `["monika@testmail.com", "symon@testmail.com"]`

**Method**
HTTP method POST or PUT. ex. `POST`

**Url**
The URL of the server that will receive the webhook notification.. ex. `https://yourwebsite.com/webhook`

Using the webhook type configuration, `Monika` will send a request with the following body:

```js
body: {
  url: string
  time: string
  alert: string
}
```

Keep watch on these pages, new notification methods are being developed.
