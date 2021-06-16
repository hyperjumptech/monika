---
id: quick-start
title: Quick Start
---

## Getting Started

To start monitoring URLs, you need to provide a configuration (JSON file) either from an URL or local file. The configuration file contains the probes, alerts, and notification configurations. You can generate a configuration file using [Monika Config Generator](https://hyperjumptech.github.io/monika-config-generator) web app. Alternatively, you can use one of the following configuration examples:

1. [SMTP Gmail](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.smtp-gmail.example.json)
2. [Mailgun](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.mailgun.example.json)
3. [SendGrid](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.sendgrid.example.json)
4. [Webhook](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.webhook.example.json)
5. [Slack](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.slack.example.json)
6. [Telegram](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.telegram.example.json)
7. [WhatsApp](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.whatsapp.example.json)
8. [Microsoft Teams](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.teams.example.json)
9. [Monika Whatsapp Notifier](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.monika-whatsapp.example.json)
10. [Default](https://github.com/hyperjumptech/monika/blob/main/monika.example.json)

When you have created the configuration file, you can run `monika` as follows

```bash
monika -c <path_to_your_configuration.json>
```

Or you can provide an URL that contains monika configuration

```bash
monika -c https://domain.com/path/to/your/configuration.json
```

Options and parameters can be seen by running `monika -h`. Or if you cloned this repository, you need to run `bin/run -h`.

## Quick Start

At the center of monica is a configuration file. Follow the following steps to quickly setup monitoring and get notification when a website is down via Gmail.

1. Create a `monika.json` file and fill it out with the following

   ```json
   {
     "notifications": [
       {
         "id": "unique-id-smtp",
         "type": "smtp",
         "data": {
           "recipients": ["YOUR_EMAIL_ADDRESS_HERE"],
           "hostname": "smtp.gmail.com",
           "port": 587,
           "username": "YOUR_GMAIL_ACCOUNT",
           "password": "YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD"
         }
       }
     ],
     "probes": [
       {
         "id": "1",
         "name": "Monika Landing Page",
         "description": "Landing page of awesome Monika",
         "interval": 10,
         "requests": [
           {
             "url": "https://hyperjumptech.github.io/monika",
             "timeout": 7000
           }
         ],
         "alerts": ["status-not-2xx"]
       }
     ]
   }
   ```

2. Replace `YOUR_EMAIL_ADDRESS_HERE` in the monika.json with your email address that will receive the notification.
3. Replace `YOUR_GMAIL_ACCOUNT` with your valid Gmail account, e.g., `yourname@gmail.com`.
4. Replace `YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD` with your Gmail password.
   1. If you have activated Two Factor Authentication (2FA), you need to create an app password. Refer [here](https://support.google.com/accounts/answer/185833) to create an app password for your Gmail account.
5. If you have [installed Monika globally](/installation), run `monika` from Terminal app (macOS) in the same directory where `monika.json` exists. If you haven't, you can quickly run Monika by running `npx @hyperjumptech/monika` in the same directory where monika.json exists.
6. During runtime, Monika will output a log that looks like this

   ```bash
    INFO (on x1): Starting Monika. Probes: 4. Notifications: 1


    INFO (on MyPC): 2021-06-16T04:14:40.128Z 1 id:5 200 http://localhost:7001/health 7ms
    INFO (on MyPC): 2021-06-16T04:14:45.109Z 2 id:5 200 http://localhost:7001/health 4ms
    INFO (on MyPC): 2021-06-16T04:14:50.126Z 3 id:5 200 http://localhost:7001/health 10ms
    INFO (on MyPC): 2021-06-16T04:14:55.107Z 4 id:5 200 http://localhost:7001/health 1ms
    WARN (on MyPC): 2021-06-16T04:15:00.117Z 5 id:5 500 http://localhost:7001/health 0ms, ALERT: status-not-2xx
    WARN (on MyPC): 2021-06-16T04:15:05.371Z 6 id:5 500 http://localhost:7001/health 0ms, ALERT: status-not-2xx
    WARN (on MyPC): 2021-06-16T04:15:10.128Z 7 id:5 500 http://localhost:7001/health 0ms, ALERT: status-not-2xx
    WARN (on MyPC: 2021-06-16T04:15:15.138Z 8 id:5 500 http://localhost:7001/health 0ms, ALERT: status-not-2xx, NOTIF: service probably down
    INFO (on MyPC): 2021-06-16T04:15:20.130Z 9 id:5 200 http://localhost:7001/health 6ms
    INFO (on MyPC): 2021-06-16T04:15:25.128Z 10 id:5 200 http://localhost:7001/health 4ms
    INFO (on MyPC): 2021-06-16T04:15:30.137Z 11 id:5 200 http://localhost:7001/health 6ms
    INFO (on MyPC): 2021-06-16T04:15:35.146Z 12 id:5 200 http://localhost:7001/health 8ms, NOTIF: service is back up
    INFO (on MyPC): 2021-06-16T04:15:40.140Z 13 id:5 200 http://localhost:7001/health 4ms


    INFO_TYPE: (hostname): current-time iteration probe:id _probeURL_ [response time in ms],[ALERT messages if any], [NOTIFICATION messages if any]
   ```

## Configuration file

> The configuration file contains the [notification](/monika/guides/notifications), [probes](/monika/guides/probes), and [alerts](/monika/guides/alerts) as shown below.

```
// monika.json

{
  "notifications": [...],
  "probes": [
    {
      ...
      "alerts": [...]
    }
  ]
}
```

For advanced configuration, you can find them on the sidebar menu.

Monika by default reads a configuration file called `monika.json` in the current working directory if it exists. You can specify a path to a JSON configuration file with `-c` flag as follows

```bash
monika -c <path_to_configuration_json_file>
```

Or if you haven't installed Monika globally, you can run it without installing first using [npx](https://www.npmjs.com/package/npx):

```bash
npx @hyperjumptech/monika -c <path_to_configuration_json_file>
```

## Background run

By default Monika will run in the foreground. Like other Node.js applications, there are several ways to run Monika in the background on Unix, Linux, and macOS.

### Using `nohup`

- On your terminal, run `nohup monika &`
- You'll get an output similar to the following.

  ```
  [1] 93457
  appending output to nohup.out
  ```

  In the above example, 93457 is the process ID (pid). And the output of Monika is written to `nohup.out` file.

- To stop Monika, run `kill -9 <pid>`.

### Using `screen`

- On Debian/Ubuntu, you can install it by running `sudo apt install screen`.
- Run `screen`.
- Run `monika -c monika.json`
- Press Ctrl+a then D. This will cause Monika to run on a different screen in the background.
- To go back to the screen, run `screen -ls` to list the running screens. You will get an output similar to the following.

  ```
  There is a screen on:
    9049.pts-0.the-server	(03/23/21 08:34:38)	(Detached)
    1 Socket in /run/screen/S-server.
  ```

  `9049.pts-0.the-server` is the name of the screen.

- Then run `screen -r <name_of_the_screen>`.
- To stop Monika, hit Ctrl+c then Ctrl+d.
