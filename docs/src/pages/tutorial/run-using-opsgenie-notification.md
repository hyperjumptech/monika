---
id: run-using-opsgenie-notification
title: Run using Opsgenie Notification
---

This article will show you how to integrate Monika with Opsgenie to get your Monika notifications through the Opsgenie dashboard. So, without further ado:

## Setup Opsgenie

To use Opsgenie, you need to create an account on the [Opsgenie website](https://www.atlassian.com/software/opsgenie). After you have created your account, head over to the Teams menu in the Dashboard and create a Team.

![](https://miro.medium.com/max/1400/1*qhx-3z_Wvd2-YbDVfrOJkw.png)

Now that you have created a team, go to the **Integrations** menu and click **Add Integration**. Then, select the **API integration**. You will be redirected to the API Key page. After that, copy the API Key and save it somewhere safe as we are going to need it later.

![](https://miro.medium.com/max/1400/1*U6Rs1uQZy8KFo_44tcYd2g.png)

Once that’s done, it’s time to configure Monika to integrate with Opsgenie.

## Integrate Monika with Opsgenie

**Monika** is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several conditions such as service outages or slow services. Also, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like [SMTP mail](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8), [WhatsApp](https://medium.com/hyperjump-tech/get-monika-notifications-to-your-whatsapp-using-monika-whatsapp-notifier-78a83560c04c) (**it’s free!**), [Microsoft Teams](https://medium.com/hyperjump-tech/integrate-monika-with-microsoft-teams-get-notifications-straight-to-your-channels-using-incoming-3292147d6758), [Slack](https://medium.com/hyperjump-tech/integrate-monika-with-your-slack-channels-to-receive-monika-notifications-using-incoming-webhook-9ed13e5a910e), and many more.

There are many ways to install Monika, from Node Package Manager (NPM), [downloading binaries from the Monika release page](https://medium.com/hyperjump-tech/install-and-run-monika-in-linux-without-package-managers-9b019571bf38), to package managers such as [Homebrew](https://medium.com/hyperjump-tech/install-monika-in-macos-using-homebrew-875265f8ded6) or [Snapcraft](https://medium.com/hyperjump-tech/install-monika-on-linux-using-snapcraft-2ecff9dd98ac).

Now that we have our API Key from Opsgenie, it’s time to create a Monika configuration called `monika.yml`

```
notifications:
  - id: unique-id-opsgenie
    type: opsgenie
    data:
      geniekey: <YOUR_API_KEY>
probes:
  - id: "1"
    name: Localhost
    description: Check status
    interval: 3
    incidentThreshold: 3
    recoveryThreshold: 3
    requests:
      - method: GET
        url: https://httpbin.org/delay/2500
    alerts:
      - query: response.time > 2000
        message: Response time more than 2 seconds
      - query: response.status != 200
        message: Status not 2xx
```

Let’s take a look at the configuration above:

- The Pushover notification channel will use the API Token and User Key you created from the previous step.
- It will probe [https://httpbin.org/delay/2500](https://httpbin.org/delay/2500)[,](https://www.google.com%2C/) with the method GET
- It will alert you if the response status code is not 200, or the response time is longer than two seconds
- The incident/recovery threshold count is 3, meaning Monika will only send notifications when the probed URL returns non-2xx status 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes.

Once that’s done, run Monika with the configuration above with the command `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*M0ddqavWVjDdfMc-AfeT6Q.png)

Congratulations! You have successfully integrated Monika with Opsgenie! Note that Opsgenie integration is only available from the Monika version 1.8.0++
