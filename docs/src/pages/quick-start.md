---
id: quick-start
title: Quick Start
---

## Getting Started

To start monitoring URLs, you need to create a configuration file (JSON file). The configuration file contains the probes, alerts, and notification configurations. You can generate a configuration file using [Monika Config Generator](https://hyperjumptech.github.io/monika-config-generator) web app. Alternatively, you can use one of the following configuration examples:

1. [SMTP Gmail](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.smtp-gmail.example.json)
2. [Mailgun](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.mailgun.example.json)
3. [SendGrid](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.sendgrid.example.json)
4. [Webhook](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.webhook.example.json)
5. [Slack](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.slack.example.json)
6. [Telegram](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.telegram.example.json)
7. [WhatsApp](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.whatsapp.example.json)
8. [Microsoft Teams](https://github.com/hyperjumptech/monika/blob/main/config_sample/config.teams.example.json)
9. [Default](https://github.com/hyperjumptech/monika/blob/main/monika.example.json)

When you have created the configuration file, you can run `monika` as follows

```bash
monika -c <path_to_your_configuration.json>
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

   1. If you have activated Two Factor Authentication (2FA), you need to create an app password. Refer <a className="text-blue-700 font-semibold" href="https://support.google.com/accounts/answer/185833">here</a> to create an app password for your Gmail account.

5. If you have <a className="text-blue-700 font-semibold" href="/installation">installed Monika globally</a>, run `monika` from Terminal app (macOS) in the same directory where `monika.json` exists. If you haven't, you can quickly run Monika by running `npx @hyperjumptech/monika` in the same directory where monika.json exists.
6. During runtime, Monika will output a log that looks like this

   ```bash
    2021-05-03T10:05:09.345Z,PROBE,1,0,https://hyperjumptech.github.io/monika,200,1157,31358
    2021-05-03T10:05:19.171Z,PROBE,2,0,https://hyperjumptech.github.io/monika,200,989,31358
    2021-05-03T10:05:29.151Z,PROBE,3,0,https://hyperjumptech.github.io/monika,200,964,31358
    2021-05-03T10:05:39.204Z,PROBE,4,0,https://hyperjumptech.github.io/monika,200,1012,31358
    2021-05-03T10:05:49.165Z,PROBE,5,0,https://hyperjumptech.github.io/monika,200,967,31358
    2021-05-03T10:05:59.267Z,PROBE,6,0,https://hyperjumptech.github.io/monika,200,1065,31358
    2021-05-03T10:06:09.214Z,PROBE,7,0,https://hyperjumptech.github.io/monika,200,1011,31358
    2021-05-03T10:06:19.251Z,PROBE,8,0,https://hyperjumptech.github.io/monika,200,1043,31358
    2021-05-03T10:06:29.233Z,PROBE,9,0,https://hyperjumptech.github.io/monika,200,1025,31358
    2021-05-03T10:06:39.211Z,PROBE,10,0,https://hyperjumptech.github.io/monika,200,999,31358
    2021-05-03T10:06:49.266Z,PROBE,11,0,https://hyperjumptech.github.io/monika,200,1049,31358

    [timestamp],[log type],[probe counter],[alert threshold counter],[endpoint URL],[response status code],[response time in ms],[response size in bytes]
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
