---
id: notifications
title: Notifications
---

## Notification Types

Monika will send notifications to you whenever [alerts](https://hyperjumptech.github.io/monika/guides/alerts) are triggered, e.g., when the response status of a probed URL is not [2xx success code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#2xx_success) ([status-not-2xx](https://hyperjumptech.github.io/monika/guides/alerts#1-http-code)).

At this moment, Monika support these channel of notifications (You can use just one or more):

1. [Desktop Notifications](https://hyperjumptech.github.io/monika/guides/notifications#desktop-notifications)
2. [Discord](https://hyperjumptech.github.io/monika/guides/notifications#discord)
3. [Facebook Workplace](https://hyperjumptech.github.io/monika/guides/notifications#facebook-workplace)
4. [Google Chat](https://https://hyperjumptech.github.io/monika/guides/notifications#Google-Chat)
5. [Lark Suite](https://hyperjumptech.github.io/monika/guides/notifications#larksuite-notifications)
6. [Mailgun](https://hyperjumptech.github.io/monika/guides/notifications#mailgun)
7. [Microsoft Teams](https://hyperjumptech.github.io/monika/guides/notifications#microsoft-teams)
8. [Monika Whatsapp Notifier](https://hyperjumptech.github.io/monika/guides/notifications#monika-whatsapp-notifier)
9. [SendGrid](https://hyperjumptech.github.io/monika/guides/notifications#sendgrid)
10. [Slack](https://hyperjumptech.github.io/monika/guides/notifications#slack-incoming-webhook)
11. [SMTP](https://hyperjumptech.github.io/monika/guides/notifications#smtp)
12. [Telegram](https://hyperjumptech.github.io/monika/guides/notifications#telegram)
13. [Webhook](https://hyperjumptech.github.io/monika/guides/notifications#webhook)
14. [WhatsApp Business](https://hyperjumptech.github.io/monika/guides/notifications#whatsapp)

## Configurations

To use one or more notifications, you need to define the settings in the monika.yml file as shown below.

```yml
notifications: [
    - id: unique-id-mailgun
      type: mailgun
      data:
        recipients: [RECIPIENT_EMAIL_ADDRESS]
        apiKey: YOUR_API_KEY
        domain: YOUR_DOMAIN

    - id: unique-id-sendgrid
      type: sendgrid
      data:
        sender: YOUR_VERIFIED_EMAIL_BY_SENDGRID
        recipients: [RECIPIENT_EMAIL_ADDRESS]
        apiKey: YOUR_API_KEY

    - id: unique-id-smtp
      type: smtp
      data:
        recipients: [RECIPIENT_EMAIL_ADDRESS]
        hostname: SMTP_HOSTNAME
        port: 587
        username: SMTP_USERNAME
        password: SMTP_PASSWORD

    - id: unique-id-webhook
      type: webhook
      data:
        method: POST
        url: https://WEBHOOK_URL
  ]
```

Note that every triggered alert will be sent to you through all the notifications you defined in the configuration file, e.g., if you added `webhook` and `smtp` settings, you will receive the alert messages through both.

## Desktop Notifications

Monika supports desktop notifications. Here are the prerequisites for enabling the desktop notifications:

- macOS: Uses OSAScript (Apple Open Scripting Architecture). AppleScript 2.0 or later and macOS version 10.5 or later required.
- Linux: Uses `notify-send` command. `notify-osd` or `libnotify-bin` required (Ubuntu should have this by default).
- Windows: Uses Powershell. Refer to [Microsoft Official Documentation](https://docs.microsoft.com/en-us/powershell/scripting/windows-powershell/install/windows-powershell-system-requirements?view=powershell-7.1) for System Requirements.

```yml
id: unique-id-monika-notif,
type: desktop
```

## Discord

Monika supports Discord. To enable notification via Discord, you must create a discord webhook first. More info at [Discord webhook documentation](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

```yml
id: unique-id-webhook,
type: discord,
data:
  url: https://YOUR_DISCORD_URL
```

| Key  | Description                                                   | Example                                                        |
| ---- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| ID   | Notification identity number                                  | `Discord12345`                                                 |
| Type | Notification types                                            | `discord`                                                      |
| Url  | The URL of the Discord Webhook that will receive notification | `https://discord.com/api/webhook/<webhook.id>/<webhook.token>` |

## Facebook Workplace

Monika supports Facebook Workplace. To enable notification via Workplace, you must create custom integration first. More info at [Facebook Workplace Custom Integrations](https://developers.facebook.com/docs/workplace/custom-integrations-new/)

```yml
{
  'id': 'unique-workplace-id',
  'type': 'workplace',
  'data':
    {
      'thread_id': '12345678910',
      'access_token': 'your_custom_integration_access_token',
    },
}
```

| Key         | Description                                     | Example                         |
| ----------- | ----------------------------------------------- | ------------------------------- |
| ID          | Notification identity number                    | `Workplace12345`                |
| Type        | Notification types                              | `workplace`                     |
| ThreadID    | It's located at thread url, in the last segment | `6367478493277649`              |
| AccessToken | Workplace access token for custom integration   | `DQVJzYWtsdHRJRWIxUk9uOG5VV...` |

## Google Chat

You can send Monika notifications to your Google Chat. First you need to generate the url webhook for Monika to use. To create a webhook:

1. Open Google Chat
2. Go to the space to add notification
3. Select **Manage webhook** from the top of the page
4. Under Incoming webhook, click **Add another** if one already exist, in either case you need to provdie a name.
5. Name the new webhook and **Save**
6. Copy the URL in the webhook modal
7. You will need the URL in your monika configuration

For futher information check the Google Chat [documentations here](https://developers.google.com/chat/how-tos/webhooks)

Example of Google Chat configuration may be something similar to below:

```yaml
notifications:
  - id: myGoogleChatNotif
    type: google-chat
    data:
      url: https://chat.googleapis.com/v1/spaces/XXXXX/messages?key=1122334455
```

## Larksuite Notifications

If you use Larksuite, you can get Monika to send notifications to the Larksuite bots. You can create a webhook url, and then use it in the monika configuration.

You can find more information on creating [webhooks here.](https://www.larksuite.com/hc/en-US/articles/360048487775-Workplace-Use-Lark-Flow-Webhook-Triggers)

The Yaml config setup may look something like this:

```yml
notifications:
  - id: lark-group-message
    type: lark
    data:
      url: https://open.larksuite.com/open-apis/bot/v2/hook/your-webhook-key-here
```

Keep watch on these pages, new notification methods are being developed.

## Mailgun

Mailgun is an email notification delivery provided by Mailgun email service. To use mailgun for your notification,

1. You would need a [mailgun account](https://app.mailgun.com/).
2. Get your **API key** by referring to [this documentation](https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials).
3. For your **domain**
   - • If you are on the free plan, add authorized recipients as instructed [here](https://help.mailgun.com/hc/en-us/articles/217531258-Authorized-Recipients).
   - • If you want to use your own domain, refer [here](https://help.mailgun.com/hc/en-us/articles/203637190-How-Do-I-Add-or-Delete-a-Domain) to add it.
4. After that, put them in `monika.yml` configuration as follows:

```yml
- id: unique-id-mailgun
  type: mailgun
  data:
    recipients: [RECIPIENT_EMAIL_ADDRESS]
    apiKey: YOUR_API_KEY
    domain: YOUR_DOMAIN
```

| Key        | Description                                                              | Example                                         |
| ---------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| ID         | Notification identity number                                             | `Mailgun12345`                                  |
| Type       | Notification types                                                       | `mailgun`                                       |
| Recipients | An array of email addresses that will receive the e-mail from Monika     | `["monika@testmail.com", "symon@testmail.com"]` |
| Api Key    | Mailgun account api key, mailgun registered key to identify your account | `MAILGUN_API_KEY`                               |
| Domain     | The domain to set in Mailgun                                             | `sandboxmail.mailgun.com`                       |

## Microsoft Teams

Monika supports sending notifications via Microsoft Teams. In order to be able to send notifications via Microsoft Teams, you may need to add Connectors and webhooks to your channel. Please refer to [Microsoft Teams Documentation](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using) to enable connectors and webhooks.

```yml
id: unique-id-teams
type: teams
data:
  url: https://YOUR_TEAMS_WEBHOOK_URL
```

| Key  | Description                             | Example                                 |
| ---- | --------------------------------------- | --------------------------------------- |
| ID   | Notification identity number            | `Webhook12345`                          |
| Type | Notification types                      | `webhook`                               |
| Url  | The URL of your Microsoft Teams Webhook | `https://<company>.webhook.office.com/` |

## Monika Whatsapp Notifier

You can get a notification from Monika to your Whatsapp number without having a Whatsapp Business account. First, you must create a [Monika Whatsapp Notifier account](https://whatsapp.hyperjump.tech).

```yml
id: unique-id-monika-notif
type: monika-notif
data:
  url: https://YOUR_MONIKA_NOTIF_URL
```

| Key  | Description                              | Example                                                            |
| ---- | ---------------------------------------- | ------------------------------------------------------------------ |
| ID   | Notification identity number             | `MonikaNotif12345`                                                 |
| Type | Notification types                       | `monika-notif`                                                     |
| Url  | The URL of the Monika Notif Webhook link | `https://whatsapp.hyperjump.tech/api/notify?token=<webhook.token>` |

## Sendgrid

Similar to mailgun, sendgrid is also an email delivery service. Make sure you have a [sendgrid account](https://app.sendgrid.com/). To obtain your API key, refer to [sendgrid documentation](https://sendgrid.com/docs/ui/account-and-settings/api-keys/). Then put the API key in Monika's configuration as follows:

```yml
- id: unique-id-sendgrid
  type: sendgrid
  data:
    sender: YOUR_VERIFIED_EMAIL_BY_SENDGRID
    recipients: [RECIPIENT_EMAIL_ADDRESS]
    apiKey: YOUR_API_KEY
```

| Key        | Description                                                                  | Example                                         |
| ---------- | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| ID         | Notification identity number                                                 | `Sendgrid12345`                                 |
| Type       | Notification types                                                           | `sendgrid`                                      |
| sender     | An string of email addresses that has been verified in your sendgrid account | `your@email.com`                                |
| Recipients | An array of email addresses that will receive the e-mail from Monika         | `["monika@testmail.com", "symon@testmail.com"]` |
| Api Key    | Sendgrid account api key, sendgrid registered key to identify your account   | `70e34aba-0ea908325`                            |

## Slack Incoming Webhook

Monika supports Slack Incoming Webhook. To enable notification via Slack, you must have a `Slack's Incoming Webhook URL`. Please consult to [Sending messages using Incoming Webhooks](https://api.slack.com/messaging/webhooks) documentation.

```yml
id: unique-id-slack
type: slack
data:
  url: https://YOUR_SLACK_INCOMING_WEBHOOK_URL
```

| Key  | Description                            | Example                            |
| ---- | -------------------------------------- | ---------------------------------- |
| ID   | Notification identity number           | `Slack12345`                       |
| Type | Notification types                     | `slack`                            |
| Url  | The URL of your slack incoming webhook | `https://slackwebhook.com/channel` |

## SMTP

[SMTP (Simple Mail Transfer Protocol)](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol) is a way to send email using the TCP/IP protocol. This is the easiest way to get notified when alerts are triggered. Use the following configuration to set up SMTP notification.

```yml
- id: unique-id-smtp
  type: smtp
  data:
    recipients: [RECIPIENT_EMAIL_ADDRESS]
    hostname: smtp.mail.com
    port: 587
    username: SMTP_USERNAME
    password: SMTP_PASSWORD
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

## Telegram

Monika supports Telegram. To enable notification via Telegram, you must have a Telegram bot. Please consult to [Bots: An introduction for developers](https://core.telegram.org/bots).

```yml
- id: unique-id-telegram
  type: telegram
  data:
    group_id: YOUR_GROUP_ID
    bot_token: YOUR_BOT_TOKEN
```

| Key       | Description                                            | Example                       |
| --------- | ------------------------------------------------------ | ----------------------------- |
| ID        | Notification identity number                           | `Telegram12345`               |
| Type      | Notification types                                     | `telegram`                    |
| Group ID  | The ID of group where the bot should send the messages | `-123456`                     |
| Bot Token | The Token of your telegram bot                         | `abcdefg:hijklmnopqrstuvwxyz` |

## Webhook

Monika supports Webhook. To enable notification via Webhook.

```yml
- id: unique-id-webhook
  type: webhook
  data:
    url: https://YOUR_WEBHOOK_URL
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

## Whatsapp

Monika supports Whatsapp notification. To enable notification via whatsapp, you must have a registered user in whatsapp business api server. Please refer to [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp) documentation.

```yml
  - id: unique-id-whatsapp,
    type: whatsapp,
    data:
      recipients: [628123456789],
      url: https://yourwhatsappapiserver.com,
      username: whatsappusername,
      password: whatsapppassword

```

| Key          | Description                                                                               | Example                             |
| ------------ | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| ID           | Notification identity number                                                              | `whatsapp12345`                     |
| Type         | Notification types                                                                        | `whatsapp`                          |
| Recipients   | An array phone number registered for whatsapp, should start with your country code number | `["628123456790", "629745834093"]`  |
| Url          | The URL of your whatsapp api server                                                       | `https://yourwhatsappapiserver.com` |
| Username     | Your whatsapp api user name                                                               | `username`                          |
| Userpassword | Your whatsapp api user password                                                           | `userpassword`                      |
