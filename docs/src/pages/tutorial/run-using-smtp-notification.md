---
id: run-using-smtp-notification
title: Run using SMTP Notification
---

This tutorial will show you how to integrate Monika with SMTP so you can receive notifications from Monika straight to your email.

## Configuring the SMTP notification channel

In order to start using Google Mail as your Monika notification channel, you need to prepare these:

1.  One Google Mail Account
2.  A Monika configuration
3.  Patience

First, go to the [Less secure app access](https://myaccount.google.com/lesssecureapps) section of your Google Account. You might need to sign in first using your Google account. Then, turn on the “Allow less secure apps” like so:

![](https://miro.medium.com/max/1400/1*9ZHBFLFw61-mXbQcIfjv1w.png)

Now that we enabled the ‘Allow less secure apps’ option, it is time to create a Monika configuration. As an example, let’s use a configuration from our previous article: [Be alerted when your authentication API is slow with Monika: A guide for chaining request](https://dennypradipta.medium.com/be-alerted-when-your-authentication-api-is-slow-with-monika-a-guide-for-chaining-request-a63801df8b39)

The configuration above will hit the /login endpoint with a JSON request body and hit an API using the token from the previous request’s response in the Authorization header. If you look closely in the notifications block, it only shows you desktop notifications when an alert is triggered. What we are going to do is to add a new notification channel, which is SMTP. Here is an example of an SMTP notification block:

```
\- id: unique-id-smtp
  type: smtp
  data:
    recipients: \[RECIPIENT\_EMAIL\_ADDRESS\]
    hostname: smtp.mail.com
    port: 587
    username: SMTP\_USERNAME
    password: SMTP\_PASSWORD
```

- ID: Notification channel unique ID
- Type: Notification type (e.g `smtp`, `desktop`, etc.)
- Recipients: An array of email addresses that will receive the e-mail from Monika (e.g `["monika@gmail.com", "symon@gmail.com"]` )
- Hostname: The SMTP host that you will use for sending the email, in this case `smtp.gmail.com` as we are going to be using Google Mail SMTP
- Port: The port allowed to be used for sending mail in your SMTP host. Google Mail suggested that we use port `465` or `587`
- Username: Your SMTP username. Use your existing Google Mail email address
- Password: Your SMTP password. Use your existing Google Mail password. If you have activated 2-Factor-Authentication (2FA), you need to [create an App Password from your Account Settings](https://support.google.com/accounts/answer/185833) and then use the app password.

Now that we know the structure of the SMTP notification block, it’s time to update our Monika configuration:

```
notifications:
  - id: unique-id-smtp
    type: smtp
    data:
      recipients: ["recipient-1@example.com", "recipient-2@example.com"]
      hostname: smtp.gmail.com
      port: 587
      username: denny@example.com
      password: p455w0rd
probes:
  - id: sample_login
    name: Sample Login
    requests:
      - method: POST
        url: https://reqres.in/api/login
        body:
          email: "eve.holt@reqres.in"
          password: "cityslicka"
        headers:
          Content-Type: application/json
        alerts:
          - query: response.time > 600
            message: Login API Response time is {{ response.time }} ms, expecting less than 60>
          - query: response.status != 200
            message: Login API Status code is not 200. Please check the service status!
      - method: GET
        url: https://reqres.in/api/users/2
        headers:
          Authorization: Bearer {{ response.[0].data.token }}
        alerts:
          - query: response.time > 500
            message: Get User API Response time is {{ response.time }} ms, expecting less than>
          - query: response.status != 200
            message: Get User API Status code is not 200. Please check the service status!
    alerts:
      - query: response.time > 10000
        message: Please check your internet connection
```

Save the configuration file as `monika.yml` and run the configuration. When an alert is triggered, it should send a recovery or incident email to the recipients you have configured.

![](https://miro.medium.com/max/1400/1*6PDFNfQV7AYkPMO97hAT2g.png)

Congratulations! You can now send the alert notification using Google Mail SMTP!
