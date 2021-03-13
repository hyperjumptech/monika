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

`Monika` filters the notification types for mailgun and breaks down the data configuration, setting up a mailgun service and then sending through the data using mailgun-js lib.

```js
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN })
const data = {
  from: `${sender.name} <${sender.email}>`,
  to: recipients,
  subject: subject,
  text: body,
}
return mg.messages().send(data)
```

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

`Monika` is using @sendgrid/mail library for sending the sendgrid type notification. `Monika` will breakdown the configuration set the sengrid type API_KEY settings and send the message using the library.

```js
sgMail.setApiKey(API_KEY)
const msg = {
  to: recipients,
  from: sender.email,
  subject,
  text: body,
}

sgMail.send(msg)
```

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

`Monika` is using the sendmailer library to breakdown the configuration with type smtp, registering the username and password to the mail host with certain port and create a transporter.

```js
export const transporter = nodemailer.createTransport({
  host: cfg.hostname,
  port: cfg.port,
  auth: { user: cfg.username, pass: cfg.password },
})
```

Using the transporter, `Monika` then sends the email with its sender, recipient, subject and message in html format.

```js
export const sendSmtpMail = async (transporter: Mail, opt: Mail.Options) => {
  return transporter.sendMail({
    from: opt.from,
    to: opt.to,
    subject: opt.subject,
    html: opt.html,
  })
}
```

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

Using the webhook type configuration, `Monika` will send a post request and data through its body using the axios library. The data for notification will be sent as this object :

```js
body: {
  url: string
  time: string
  alert: string
}
```

```js
const res = await axios({
  url: data.url,
  data: data.body,
  method: data.method,
})
```

Keep watch on these pages, new notification methods are being developed.
