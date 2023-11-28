---
id: run-using-google-chat-notification
title: Run using Google Chat notification
---

This tutorial will show you how to integrate Monika with Google Chat using Google Chat webhook so that you can get your Monika notifications through your Google Chat.

## Getting your Google Chat webhook

To create your Google Chat webhook, you need to create a space. Go to the [Google Chat](https://chat.google.com) page, and navigate to the bottom-left part of the page. In the “Spaces” section, click the plus icon and click **Create Space**. Fill out the space details and then click **Create**.

![](https://miro.medium.com/max/1264/1*3Ctq84vJZbeKF3WTlZzgMQ.png)

After you created a new space, click the menu icon on the top-right of the page to minimize the sidebar. Then, click your space’s name and select the **Manage Webhook** menu.

![](https://miro.medium.com/max/1298/1*HnjVVFdY4z1g-OSxVEZywQ.png)

It should display a new popup to create a new incoming webhook. Fill out the incoming webhooks name and avatar URL (which is optional), and then click **Save**. Copy the webhook URL into somewhere else, as we are going to use it later.

![](https://miro.medium.com/max/1400/1*INitisicIq5fDZN2Kk86PA.png)

## Integrating Monika with Google Chat

Now that we have our Google Chat Webhook URL and installed Monika, it’s time to create a configuration called `monika.yml`:

```
notifications:
  - id: unique-id-webhook
    type: google-chat
    data:
      url: <YOUR_GOOGLE_CHAT_WEBHOOK_URL>
probes:
  - id: google_chat_test
    name: Google Chat Test
    description: Google Chat Notification Channel Test
    interval: 10
    requests:
      - method: GET
        url: https://reqres.in/api/users
    alerts:
      - query: response.status != 200
        message: Status code is not 200
      - query: response.time > 500
        message: Request took more than half a second
```

Let me explain a little bit about this configuration:

- You need to set the notification channel in the `notifications` object. There are 3 properties: `id`, `type`, and `data`. Set the `id` to any string values, as it is just an identifier. Then, set the `type` field to `google-chat` to set the notification channel to Google Chat. After that, put your Google Chat Webhook URL into the `data.url` field.
- Monika will be probing [https://reqres.in/api/users](https://reqres.in/api/users) every ten seconds and will send you an alert if the response time is greater than half a second or the response status code is not 200.

Now that we have our configuration ready, it’s time to run it with Monika. Go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*s5bgaYarW1o9qNDOb5b4Lg.png)

Congratulations! Now that you have successfully integrated Monika with Google Chat.
