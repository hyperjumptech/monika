---
id: run-using-whatsapp-notifier
title: Run using WhatsApp Notifier
---

This tutorial, we will be sharing how to integrate Monika with Monika WhatsApp Notifier so that when there is a Monika incidents or recoveries alert, you will be notified via WhatsApp.

## Setup Monika Whatsapp Notifier

First things first, you need to have a Monika WhatsApp Notifier webhook URL. Navigate to the [https://whatsapp.hyperjump.tech](https://whatsapp.hyperjump.tech) and create your own webhook URL by inputting your name and phone number. After you submit the form, you will receive a notification to confirm your phone number.

![](https://miro.medium.com/max/962/1*So_BtEM7KNmimTYjWNqu5w.png)

Click the link that you received to confirm your phone number. After that, you should receive your webhook URL and a guide to set up your WhatsApp Notifier.

![](https://miro.medium.com/max/962/1*Le0rDvF8uZF4542Gr_y8wg.png)

Save the Monika WhatsApp Notifier webhook URL to somewhere safe as we will need them later.

## Configuring Monika with Webhook

Now that we have our Webhook URL, it’s time to create a configuration called `monika.yml`:

```
notifications:
  - id: monika-notif
    type: monika-notif
    data:
      url: https://YOUR_MONIKA_NOTIF_URL
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
```

Let me explain a little bit about this configuration:

- You need to set the notification channel in the `notifications` object. There are 3 properties: `id`, `type`, and `data`. Set `id`with any string values, it’s just an identifier. Set `type` with `monika-notif`. Then put your WhatsApp notifier webhook URL in `url` key in the `data` object.
- Monika will be probing [https://github.com](https://github.com) and will send you an alert if the response time is greater than 500 milliseconds or the response status code is not 200, meaning the website is down

Now that we have our configuration ready, it’s time to run it with Monika. Go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*JyohP5ybvPy0tNMCFciwLg.png)

Congratulations! Now that you have successfully integrated Monika with Monika WhatsApp Notifier, you will be notified if your website is slow or down via WhatsApp.
