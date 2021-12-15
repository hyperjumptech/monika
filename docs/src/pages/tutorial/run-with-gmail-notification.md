---
id: run-with-gmail-notification
title: Run with GMail Notification
---

1. Create a `monika.yml` file and fill it out with the following

```yaml
notifications:
  - id: unique-id-smtp
    type: smtp
    data:
      recipients:
        - YOUR_EMAIL_ADDRESS_HERE
      hostname: smtp.gmail.com
      port: 587
      username: YOUR_GMAIL_ACCOUNT
      password: YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD
probes:
  - id: '1'
    name: Monika Landing Page
    description: Landing page of awesome Monika
    interval: 10
    requests:
      - url: https://hyperjumptech.github.io/monika
        timeout: 7000
    alerts:
      - status-not-2xx
```

2. Replace `YOUR_EMAIL_ADDRESS_HERE` in the `monika.yml` with your email address that will receive the notification.
3. Replace `YOUR_GMAIL_ACCOUNT` with your valid Gmail account, e.g., `yourname@gmail.com`.
4. Replace `YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD` with your Gmail password.
   1. If you have activated Two Factor Authentication (2FA), you need to create an app password. Refer [here](https://support.google.com/accounts/answer/185833) to create an app password for your Gmail account.
5. If you have [installed Monika globally](/installation), run `monika` from Terminal app (macOS) in the same directory where `monika.yml` exists. If you haven't, you can quickly run Monika by running `npx @hyperjumptech/monika` in the same directory where monika.yml exists.
6. During runtime, Monika will output a log that looks like this

   ```bash
    INFO (on x1): Starting Monika. Probes: 4. Notifications: 1


    INFO: 2021-06-16T04:14:40.128Z 1 id:5 200 http://localhost:7001/health 7ms
    INFO: 2021-06-16T04:14:45.109Z 2 id:5 200 http://localhost:7001/health 4ms
    INFO: 2021-06-16T04:14:50.126Z 3 id:5 200 http://localhost:7001/health 10ms
    INFO: 2021-06-16T04:14:55.107Z 4 id:5 200 http://localhost:7001/health 1ms
    WARN: 2021-06-16T04:15:00.117Z 5 id:5 500 http://localhost:7001/health 0ms, ALERT: status-not-2xx
    WARN: 2021-06-16T04:15:05.371Z 6 id:5 500 http://localhost:7001/health 0ms, ALERT: status-not-2xx
    WARN: 2021-06-16T04:15:10.128Z 7 id:5 500 http://localhost:7001/health 0ms, ALERT: status-not-2xx
    WARN: 2021-06-16T04:15:15.138Z 8 id:5 500 http://localhost:7001/health 0ms, ALERT: status-not-2xx, NOTIF: service probably down
    INFO: 2021-06-16T04:15:20.130Z 9 id:5 200 http://localhost:7001/health 6ms
    INFO: 2021-06-16T04:15:25.128Z 10 id:5 200 http://localhost:7001/health 4ms
    INFO: 2021-06-16T04:15:30.137Z 11 id:5 200 http://localhost:7001/health 6ms
    INFO: 2021-06-16T04:15:35.146Z 12 id:5 200 http://localhost:7001/health 8ms, NOTIF: service is back up
    INFO: 2021-06-16T04:15:40.140Z 13 id:5 200 http://localhost:7001/health 4ms


    INFO_TYPE: current-time iteration probe:id _probeURL_ [response time in ms],[ALERT messages if any], [NOTIFICATION messages if any]
   ```
