---
id: run-using-mailgun-notification
title: Run using Mailgun Notification
---

This tutorial will show you how to integrate Monika with Mailgun so you can receive notifications from Monika straight to your email.

## Getting the Mailgun API Key

To get the Mailgun API Key, you need to create an account first. Head to [https://www.mailgun.com](https://www.mailgun.com) and proceed to create an account. After that, log in to your dashboard.

![](https://miro.medium.com/max/1400/1*KqC_cBnu6afYLCyT0cqpbg.png)

After that, you need to configure your domain. Let’s assume that you are on the free tier. Click **Sending,** and click **Domains**. Then, click the first listed sandbox domain.

You will be redirected to a page that asks you “How would you like to send your emails from <YOUR_SANDBOX_DOMAIN>?”. On that page, select the API method and you will see your API key. **Copy your API key and your sandbox domain and save it somewhere else**.

![](https://miro.medium.com/max/1400/1*uf-1Ai_HGFfBlhshxpfrOg.png)

Then, you need to add your email to the Authorized Recipients. On the same page, scroll down to see the Authorized Recipients section. Add your email for testing purposes, and verify your email.

![](https://miro.medium.com/max/1400/1*_6VLwNPss3OT1iASWRo-Sg.png)

Now that the preparation has been done, it’s time to run Monika with Mailgun notification.

## Running Monika with Mailgun Notification

Now that we have the Mailgun API Key, Sandbox Domain, set up the Authorized Recipients, and installed Monika, it’s time to create a configuration called `monika.yml`:

```
notifications:
  - id: unique-id-mailgun
    type: mailgun
    data:
      recipients: ['YOUR_AUTHORIZED_RECIPIENTS_EMAIL']
      apiKey: YOUR_MAILGUN_API_KEY
      domain: YOUR_SANDBOX_DOMAIN
probes:
  - id: test
    interval: 10
    requests:
      - url: https://reqres.in/api/users
        method: GET
    alerts:
      - query: response.time > 2000
        message: Response time is longer than two seconds
```

Let me explain a little bit about this configuration:

- You need to set the notification channel in the `notifications` object. There are 3 properties: `id`, `type`, and `data`. Set the `id` to any string values, as it is just an identifier. Then, set the `type` field to `mailgun` to use the Mailgun notification channel. After that, put your Mailgun API Key, recipients, and domain in the corresponding fields.
- Monika will be probing [https://reqres.in/api/users](https://reqres.in/api/users) using the GET method every ten seconds and will send you an alert if the response time is longer than two seconds.

Save the configuration as monika.yml. To run the Monika configuration, go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*ASIxR-oh22Xsddu_2NI3iA.png)It’s working!

Congratulations! Now that you have successfully integrated Monika with Mailgun, you will be notified if your website is slow or down through your email!
