---
id: run-using-slack-notification
title: Run using Slack Notification
---

This tutorial, I will be sharing how to integrate Monika with Slack. You can integrate Monika with Slack using Incoming Webhook so that when there is a Monika incidents or recoveries alert, your team will be notified via existing Slack channels.

## Setup Webhook with Slack

First things first, you need to have a Slack workspace. Create your user account on their website and follow their steps to create a new workspace. Now that we have our workspace ready, head to the **Browse Slack** and select Apps. Search for an app called **Incoming Webhooks**.

![](https://miro.medium.com/max/1400/1*Y7V0vMPpbYK89sqFzUaj-A.png)

Click **Add** and you will be redirected to the setup page. Click the **Add to Slack** button. You will be asked which channels you want to connect with Monika. As an example, I used the **#monika-notification** channel. After you have selected your channel, click **Add Incoming Webhooks Integration** button. You should see that your Webhook URL is ready to use.

![](https://miro.medium.com/max/1400/1*d1sx8i8I8d3O-r6n8b5lLg.png)

## Configuring Monika with Webhook

Now that we have our Webhook URL, it’s time to create a configuration called `monika.yml`:

```
notifications:
  - id: slack
    type: slack
    data:
      url: <REPLACE_THIS_TO_YOUR_INCOMING_WEBHOOK_URL>
probes:
  - id: sample_login
    name: Sample Login
    requests:
      - method: GET
        url: https://github.com
        alerts:
          - query: response.time > 500
            message: Github response time is {{ response.time }} ms, expecting less than 500ms
          - query: response.status != 200
            message: Github status code is not 200. Please check the service status!
    alerts:
      - query: response.time > 10000
        message: Please check your internet connection
```

Let me explain a little bit about this configuration:

- Monika is using the Slack notification channel. You can change the notification channel by changing `type` key to another value such as [SMTP](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8) or [WhatsApp](https://whatsapp.hyperjump.tech/). In the `data` object, there is only one key called `url` for your Webhook URL
- Monika will be probing [https://github.com](https://github.com) and will send you an alert if the response time is greater than 500 milliseconds or the response status code is not 200, meaning the website is down
- If by chance when probing Github the response time is larger than 10000 milliseconds, you will receive an alert about your internet connection.

Now that we have our configuration ready, it’s time to run it with Monika. Go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*zL-bVip3iC6tvXqDElRjRA.png)

Congratulations! Now that you have successfully integrated Monika with Slack, you will be notified if your website is slow or down!
