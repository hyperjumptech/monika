---
id: notifications
title: Notifications
---

## Notification Types

Monika will send notifications to you whenever [alerts](https://hyperjumptech.github.io/monika/guides/alerts) are triggered, e.g., when the response status of a probed URL is not [2xx success code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#2xx_success) ([status-not-2xx](https://hyperjumptech.github.io/monika/guides/alerts#1-http-code)).

At this moment, Monika support these channel of notifications (You can use just one or more):

1. [SMTP](https://hyperjumptech.github.io/monika/guides/notifications#smtp)
2. [Mailgun](https://hyperjumptech.github.io/monika/guides/notifications#mailgun)
3. [SendGrid](https://hyperjumptech.github.io/monika/guides/notifications#sendgrid)
4. [Webhook](https://hyperjumptech.github.io/monika/guides/notifications#webhook)
5. [Slack](https://hyperjumptech.github.io/monika/guides/notifications#slack-incoming-webhook)
6. [Telegram](https://hyperjumptech.github.io/monika/guides/notifications#telegram)
7. [WhatsApp](https://hyperjumptech.github.io/monika/guides/notifications#whatsapp)
8. [Microsoft Teams](https://hyperjumptech.github.io/monika/guides/notifications#microsoft-teams)
9. [Discord](https://hyperjumptech.github.io/monika/guides/notifications#discord)
10. [Facebook Workplace](https://hyperjumptech.github.io/monika/guides/notifications#facebook-workplace)

We are working on more notifications like Telegram, and many more. You can help!

## Configurations

To use one or more notifications, you need to define the settings in the monika.json file as shown below.

```json
"notifications": [
    {
      "id": "unique-id-mailgun",
      "type": "mailgun",
      "data": {
        "recipients": ["RECIPIENT_EMAIL_ADDRESS"],
        "apiKey": "YOUR_API_KEY",
        "domain": "YOUR_DOMAIN"
      }
    },
    {
      "id": "unique-id-sendgrid",
      "type": "sendgrid",
      "data": {
        "recipients": ["RECIPIENT_EMAIL_ADDRESS"],
        "apiKey": "YOUR_API_KEY"
      }
    },
    {
      "id": "unique-id-smtp",
      "type": "smtp",
      "data": {
        "recipients": ["RECIPIENT_EMAIL_ADDRESS"],
        "hostname": "SMTP_HOSTNAME",
        "port": 587,
        "username": "SMTP_USERNAME",
        "password": "SMTP_PASSWORD"
      }
    },
    {
      "id": "unique-id-webhook",
      "type": "webhook",
      "data": {
        "method": "POST",
        "url": "https://WEBHOOK_URL"
      }
    }
  ],
```

Note that every triggered alert will be sent to you through all the notifications you defined in the monika.json, e.g., if you added `webhook` and `smtp` settings, you will receive the alert messages through both.

## SMTP

[SMTP (Simple Mail Transfer Protocol)](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol) is a way to send email using the TCP/IP protocol. This is the easiest way to get notified when alerts are triggered. Use the following configuration to set up SMTP notification.

```json
{
  "id": "unique-id-smtp",
  "type": "smtp",
  "data": {
    "recipients": ["RECIPIENT_EMAIL_ADDRESS"],
    "hostname": "smtp.mail.com",
    "port": 587,
    "username": "SMTP_USERNAME",
    "password": "SMTP_PASSWORD"
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

### Example using Gmail SMTP

To use Gmail SMTP with Monika,

1. You need to have a Gmail account.
2. Use `smtp.gmail.com` for `hostname`.
3. Use `587` for `port`.
4. Use your Gmail address for `username`.
5. Use your Gmail password for `password`.
   1. If you have activated 2-Factor-Authentication (2FA), you need to [create an App Password from your Account Settings](https://support.google.com/accounts/answer/185833). Then use the app password for `password`.

## Mailgun

Mailgun is an email notification delivery provided by Mailgun email service. To use mailgun for your notification,

1. You would need a [mailgun account](https://app.mailgun.com/).
2. Get your **API key** by referring to [this documentation](https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials).
3. For your **domain**
   - • If you are on the free plan, add authorized recipients as instructed [here](https://help.mailgun.com/hc/en-us/articles/217531258-Authorized-Recipients).
   - • If you want to use your own domain, refer [here](https://help.mailgun.com/hc/en-us/articles/203637190-How-Do-I-Add-or-Delete-a-Domain) to add it.
4. After that, put them in `monika.json` configuration as follows:

```json
{
  "id": "unique-id-mailgun",
  "type": "mailgun",
  "data": {
    "recipients": ["RECIPIENT_EMAIL_ADDRESS"],
    "apiKey": "YOUR_API_KEY",
    "domain": "YOUR_DOMAIN"
  }
}
```

| Key        | Description                                                              | Example                                         |
| ---------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| ID         | Notification identity number                                             | `Mailgun12345`                                  |
| Type       | Notification types                                                       | `mailgun`                                       |
| Recipients | An array of email addresses that will receive the e-mail from Monika     | `["monika@testmail.com", "symon@testmail.com"]` |
| Api Key    | Mailgun account api key, mailgun registered key to identify your account | `MAILGUN_API_KEY`                               |
| Domain     | The domain to set in Mailgun                                             | `sandboxmail.mailgun.com`                       |

## Sendgrid

Similar to mailgun, sendgrid is also an email delivery service. Make sure you have a [sendgrid account](https://app.sendgrid.com/). To obtain your API key, refer to [sendgrid documentation](https://sendgrid.com/docs/ui/account-and-settings/api-keys/). Then put the API key in Monika's configuration as follows:

```json
{
  "id": "unique-id-sendgrid",
  "type": "sendgrid",
  "data": {
    "recipients": ["RECIPIENT_EMAIL_ADDRESS"],
    "apiKey": "YOUR_API_KEY"
  }
}
```

| Key        | Description                                                                | Example                                         |
| ---------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| ID         | Notification identity number                                               | `Sendgrid12345`                                 |
| Type       | Notification types                                                         | `sendgrid`                                      |
| Recipients | An array of email addresses that will receive the e-mail from Monika       | `["monika@testmail.com", "symon@testmail.com"]` |
| Api Key    | Sendgrid account api key, sendgrid registered key to identify your account | `70e34aba-0ea908325`                            |

## Webhook

Monika supports Webhook. To enable notification via Webhook.

```json
{
  "id": "unique-id-webhook",
  "type": "webhook",
  "data": {
    "url": "https://YOUR_WEBHOOK_URL"
  }
}
```

| Key  | Description                                                      | Example                           |
| ---- | ---------------------------------------------------------------- | --------------------------------- |
| ID   | Notification identity number                                     | `Webhook12345`                    |
| Type | Notification types                                               | `webhook`                         |
| Url  | The URL of the server that will receive the webhook notification | `https://yourwebsite.com/webhook` |

Using the webhook type configuration, `Monika` will send a request with the following body:

```js
body: {
  url: string
  time: string
  alert: string
}
```

## Slack Incoming Webhook

Monika supports Slack Incoming Webhook. To enable notification via Slack, you must have a `Slack's Incoming Webhook URL`. Please consult to [Sending messages using Incoming Webhooks](https://api.slack.com/messaging/webhooks) documentation.

```json
{
  "id": "unique-id-slack",
  "type": "slack",
  "data": {
    "url": "https://YOUR_SLACK_INCOMING_WEBHOOK_URL"
  }
}
```

| Key  | Description                            | Example                            |
| ---- | -------------------------------------- | ---------------------------------- |
| ID   | Notification identity number           | `Slack12345`                       |
| Type | Notification types                     | `slack`                            |
| Url  | The URL of your slack incoming webhook | `https://slackwebhook.com/channel` |

## Telegram

Monika supports Telegram. To enable notification via Telegram, you must have a Telegram bot. Please consult to [Bots: An introduction for developers](https://core.telegram.org/bots).

```json
{
  "id": "unique-id-telegram",
  "type": "telegram",
  "data": {
    "group_id": "YOUR_GROUP_ID",
    "bot_token": "YOUR_BOT_TOKEN"
  }
}
```

| Key       | Description                                            | Example                       |
| --------- | ------------------------------------------------------ | ----------------------------- |
| ID        | Notification identity number                           | `Telegram12345`               |
| Type      | Notification types                                     | `telegram`                    |
| Group ID  | The ID of group where the bot should send the messages | `-123456`                     |
| Bot Token | The Token of your telegram bot                         | `abcdefg:hijklmnopqrstuvwxyz` |

## Whatsapp

Monika supports Whatsapp notification. To enable notification via whatsapp, you must have a registered user in whatsapp business api server. Please refer to [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp) documentation.

```json
{
  "id": "unique-id-whatsapp",
  "type": "whatsapp",
  "data": {
    "recipients": ["628123456789"],
    "url": "https://yourwhatsappapiserver.com",
    "username": "whatsappusername",
    "password": "whatsapppassword"
  }
}
```

| Key          | Description                                                                               | Example                             |
| ------------ | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| ID           | Notification identity number                                                              | `whatsapp12345`                     |
| Type         | Notification types                                                                        | `whatsapp`                          |
| Recipients   | An array phone number registered for whatsapp, should start with your country code number | `["628123456790", "629745834093"]`  |
| Url          | The URL of your whatsapp api server                                                       | `https://yourwhatsappapiserver.com` |
| Username     | Your whatsapp api user name                                                               | `username`                          |
| Userpassword | Your whatsapp api user password                                                           | `userpassword`                      |

## Microsoft Teams

Monika supports sending notifications via Microsoft Teams. In order to be able to send notifications via Microsoft Teams, you may need to add Connectors and webhooks to your channel. Please refer to [Microsoft Teams Documentation](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using) to enable connectors and webhooks.

```json
{
  "id": "unique-id-teams",
  "type": "teams",
  "data": {
    "url": "https://YOUR_TEAMS_WEBHOOK_URL"
  }
}
```

| Key  | Description                             | Example                                 |
| ---- | --------------------------------------- | --------------------------------------- |
| ID   | Notification identity number            | `Webhook12345`                          |
| Type | Notification types                      | `webhook`                               |
| Url  | The URL of your Microsoft Teams Webhook | `https://<company>.webhook.office.com/` |

## Discord

Monika supports Discord. To enable notification via Discord, you must create a discord webhook first. More info at [Discord webhook documentation](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

```json
{
  "id": "unique-id-webhook",
  "type": "discord",
  "data": {
    "url": "https://YOUR_DISCORD_URL"
  }
}
```

| Key  | Description                                                   | Example                                                        |
| ---- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| ID   | Notification identity number                                  | `Discord12345`                                                 |
| Type | Notification types                                            | `discord`                                                      |
| Url  | The URL of the Discord Webhook that will receive notification | `https://discord.com/api/webhook/<webhook.id>/<webhook.token>` |

## Facebook Workplace

Monika supports Facebook Workplace. To enable notifiation via Workplace, you must create custom integration first. More info at [Facebook Workplace Custom Integrations](https://developers.facebook.com/docs/workplace/custom-integrations-new/)

```json
{
  "id": "unique-workplace-id",
  "type": "workplace",
  "data": {
    "thread_id": "12345678910",
    "access_token": "your_custom_integration_access_token"
  }
}
```

| Key         | Description                                     | Example                         |
| ----------- | ----------------------------------------------- | ------------------------------- |
| ID          | Notification identity number                    | `Workplace12345`                |
| Type        | Notification types                              | `workplace`                     |
| ThreadID    | It's located at thread url, in the last segment | `6367478493277649`              |
| AccessToken | Workplace access token for custom integration   | `DQVJzYWtsdHRJRWIxUk9uOG5VV...` |

## Monika Whatsapp Notifier (COMING SOON!)

Monika now have its own notification channel, sent through your whatsapp number. To enable notification via Monika Whatsapp Notifier, you must create a Monika Notifier account first.

```json
{
  "id": "unique-id-monika-notif",
  "type": "monika-notif",
  "data": {
    "url": "https://YOUR_MONIKA_NOTIF_URL"
  }
}
```

| Key  | Description                              | Example                                                        |
| ---- | ---------------------------------------- | -------------------------------------------------------------- |
| ID   | Notification identity number             | `MonikaNotif12345`                                             |
| Type | Notification types                       | `monika-notif`                                                 |
| Url  | The URL of the Monika Notif Webhook link | `https://monika-whatsapp.net/api/notify?token=<webhook.token>` |

Keep watch on these pages, new notification methods are being developed.
