[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----91dfcbed2bf8--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----91dfcbed2bf8--------------------------------)Follow

Oct 20, 2021

·4 min read

# Get notified by e-mail when your website is down using Monika: A guide to SMTP notification channel

![](https://miro.medium.com/max/1400/0*ASHbeMX53msf2wdF)Photo by [Stephen Phillips - Hostreviews.co.uk](https://unsplash.com/@hostreviews?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

We talked about how Monika can alert you when your API is down or slow using desktop notification many times in our previous articles. Unfortunately, if you use Monika in non-graphical environments such as servers, you can’t use desktop notifications. You should use other channels such as SMTP to send the alerts to your email and your co-workers’ email instead.

If you have read Monika's documentation, you may notice that Monika supports [SMTP notifications too](https://monika.hyperjump.tech/guides/notifications#smtp). If you’re looking for a free SMTP service instead of using a paid service like Sendinblue, Mailchimp, or similar, Google Mail is a great option.

So, without further ado!

# What is Monika?

[

## GitHub - hyperjumptech/monika: Monika is a command line application to monitor every part of your…

### Monika is a command line application to monitor every part of your web app using a simple JSON configuration file. Get…

github.com

](http://github.com/hyperjumptech/monika)

Monika is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several undesirable events such as service outages or slow services. In addition, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like SMTP mail, Telegram, [**WhatsApp**](https://whatsapp.hyperjump.tech/) (It’s free!), etc.

# Configuring the SMTP notification channel

In order to start using Google Mail as your Monika notification channel, you need to prepare these:

1.  One Google Mail Account
2.  A Monika configuration
3.  Patience

First, go to the [Less secure app access](https://myaccount.google.com/lesssecureapps) section of your Google Account. You might need to sign in first using your Google account. Then, turn on the “Allow less secure apps” like so:

![](https://miro.medium.com/max/1400/1*9ZHBFLFw61-mXbQcIfjv1w.png)Allow less secure apps

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

Save the configuration file as `monika.yml` and run the configuration. When an alert is triggered, it should send a recovery or incident email to the recipients you have configured.

![](https://miro.medium.com/max/1400/1*6PDFNfQV7AYkPMO97hAT2g.png)I received an email when my API is down or slow!

Congratulations! You can now send the alert notification using Google Mail SMTP!

# Closing

If you use Monika in non-graphical environments such as servers, you can’t use desktop notifications. You should use other channels such as SMTP to send the alerts to your email. We could use Google Mail SMTP to send Monika alerts to the configured recipients without worry.

The only thing that you should be worried about is that Google Mail SMTP only allows us to send 2000 emails per day. Sure it may sound big when it comes to small teams, but if your team is big enough or your servers go down frequently to hit that daily quota, you better use paid services like Mailchimp or Sendinblue to adjust the quota according to your needs.

If you’re having a problem with using Monika, don’t hesitate to create an issue on [Monika’s Github Issue Page](https://github.com/hyperjumptech/monika/issues). If you like this article, don’t forget to clap and share this article with your friends!

Also, we are participating in [Hacktoberfest 2021](https://hacktoberfest.digitalocean.com/) as a maintainer! Feel free to contribute to Monika this month by helping us [resolve open issues with the “hacktoberfest” label on it.](https://medium.com/hyperjump-tech/october-means-hacktoberfest-contribute-to-open-source-software-by-contributing-to-monika-877c4a8fba79)

That’s it for today, see you next time!

[Hyperjump](https://hyperjump.tech/) is an open-source-first company providing engineering excellence service. We aim to build and commercialize [open-source tools](https://github.com/hyperjumptech) to help companies streamline, simplify, and secure the most important aspects of its modern DevOps practices.

[

## Hyperjump

### Open-source first. Cloud-native. DevOps excellence. - Hyperjump

github.com

](https://github.com/hyperjumptech)
