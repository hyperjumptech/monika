---
id: notifications
title: Notifications
---

## Notification Types

In `Monika`, we provide multiple notification channels. Notifications are available through sendgrid, mailgun, smtp and webhook.

## Configurations

Notifications can be sent through multiple channels and mail accounts, each are defined through configuration such as in the file `config.json.example` below. All you need for having a notification is set these configurations.

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

Mailgun is the notification channel through the mailgun email service. For this you need to have a mailgun account first, using your mailgun's API_KEY and DOMAIN you can send notifications to the recipient's mail.

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
Email addresses that will accept the mail sent from your mailgun account, the recipients address is set in array making it able to send to multiple addresses. `["monika@testmail.com", "symon@testmail.com"]`

**Api Key**
Mailgun's account api key, mailgun's registered key to identify your account. ex. `70e34aba-0ea908325`

**Domain**
A domain that you have set in mailgun. ex. `sandboxmail.mailgun.com`

`Monika` filters the notification types for mailgun and breaks down the data configuration, setting up a mailgun service and then sending through the data using mailgun-js lib.

## Sendgrid

Similar to mailgun, sendgrid is also an email delivery service. You need to have a sendgrid account before you can send an email through this method. For sending a notification through sendgrid all you need to set is the API_KEY and recipient email addresses.

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
Recipient email addresses, set as an array for sending to multiple addresses. ex. `["monika@testmail.com", "symon@testmail.com"]`

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
Recipient email addresses, set as an array for sending to multiple addresses. ex. `["monika@testmail.com", "symon@testmail.com"]`

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
The detail settings needed for sending email through smtp.

**Recipients**
Recipient email addresses, set as an array for sending to multiple addresses. ex. `["monika@testmail.com", "symon@testmail.com"]`

**Method**
The method will be used in webhook. ex. `POST`

**Url**
The url that you will send notifications to. ex. `https://yourwebsite.com/webhook`

Using the webhook type configuration, `Monika` will send a post request and data through its body. The data for notification will be sent as set in this object :

```js
body: {
  url: string
  time: string
  alert: string
}
```

Keep watch on these pages, new notification methods are being developed.
