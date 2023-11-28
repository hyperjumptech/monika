---
id: run-using-microsoft-teams-notification
title: Run using Microsoft Teams Notification
---

This tutorial will show you how to integrate Monika with Microsoft Teams using Incoming Webhook so that when there is a Monika incidents or recoveries alert, your team will be notified via existing Microsoft Teams channels. So, without further ado:

## Setup Microsoft Teams Incoming Webhook

First things first, you need to have a team in Microsoft Teams. Download the Microsoft Teams app and create your user account. Then, follow the steps to create a new team. Now that we have our team ready, click the three dots on any channel in your team, and click **Connectors**.

![](https://miro.medium.com/max/1400/1*eQbgzza8XCUnhTEcSw4Esw.png)

Inside the connectors dialog, find the **Incoming Webhook** connector, click Add, and click Add again. Then, open the Connectors menu again, and find the Incoming Webhook again. This time, click **Configure**. Fill out your Incoming Webhook name, change the logo, and click **Create**. You should see that there is a new webhook link available for you to use with Monika.

![](https://miro.medium.com/max/1400/1*TNNek9g7hYmjMzuG6Gw7EA.png)

## Running Monika with Microsoft Teams Webhook

Now that we have our Webhook URL, it’s time to create a configuration called `monika.yml`:

```
notifications:
  - id: microsoft-teams
    type: teams
    data:
      url: <REPLACE_THIS_TO_YOUR_INCOMING_WEBHOOK_URL>
probes:
  - id: sample_login
    name: Sample Login
    requests:
      - method: GET
        url: https://github.com
        alerts:
          - query: response.time > 800
            message: Github response time is {{ response.time }} ms, expecting less than 800ms
          - query: response.status != 200
            message: Github status code is not 200. Please check the service status!
    alerts:
      - query: response.time > 10000
        message: Please check your internet connection
```

Let me explain a little bit about this configuration:

- Monika is using the Microsoft Teams notification channel. You can change the notification channel by changing the `type` key to another value such as [SMTP](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8) or [WhatsApp](https://whatsapp.hyperjump.tech/). In the `data` object, there is only one key called `url` for your Webhook URL
- Monika will be probing [https://github.com](https://github.com/) and will send you an alert if the response time is greater than 500 milliseconds or the response status code is not 200, meaning the website is down
- If by chance when probing Github the response time is larger than 10000 milliseconds, you will receive an alert about your internet connection.

Now that we have our configuration ready, it’s time to run it with Monika. Go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*vq82aFFN-jnGemubD-gLdA.png)

Congratulations! Now that you have successfully integrated Monika with Microsoft Teams, you will be notified immediately through Microsoft Teams if your website is slow or down!
