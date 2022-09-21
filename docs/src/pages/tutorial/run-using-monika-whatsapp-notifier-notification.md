[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----78a83560c04c--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----78a83560c04c--------------------------------)Follow

Nov 30, 2021

·4 min read

# Get Monika notifications to your WhatsApp using Monika WhatsApp Notifier

![](https://miro.medium.com/max/1400/0*6dHnlfk8uK2egusE)Photo by [Dima Solomin](https://unsplash.com/@solomin_d?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

As we mentioned earlier in our [Integrate Slack with Monika](https://medium.com/hyperjump-tech/integrate-monika-with-your-slack-channels-to-receive-monika-notifications-using-incoming-webhook-9ed13e5a910e) article, we told you that in Indonesia, many companies use WhatsApp as their primary workplace communication application. While collaboration tools such as Slack, [Microsoft Teams](https://medium.com/hyperjump-tech/integrate-monika-with-microsoft-teams-get-notifications-straight-to-your-channels-using-incoming-3292147d6758), etc. are in hype right now, some of them still prefer WhatsApp.

In order to use WhatsApp as your notification channel, you need to use WhatsApp Business API. Unfortunately, WhatsApp Business API is currently limited. That’s why we provide you with a **free solution:** [**Monika WhatsApp Notifier**](https://whatsapp.hyperjump.tech/).

In this article, we will be sharing how to integrate Monika with Monika WhatsApp Notifier so that when there is a Monika incidents or recoveries alert, you will be notified via WhatsApp. So, without further ado:

# Setup Monika Whatsapp Notifier

[

## Monika Whatsapp Notifier

### Please enter your WhatsApp phone number. We will send a message to confirm your number. Next PT Artha Rajamas Mandiri…

whatsapp.hyperjump.tech

](https://whatsapp.hyperjump.tech)

First things first, you need to have a Monika WhatsApp Notifier webhook URL. Navigate to the [https://whatsapp.hyperjump.tech](https://whatsapp.hyperjump.tech) and create your own webhook URL by inputting your name and phone number. After you submit the form, you will receive a notification to confirm your phone number.

![](https://miro.medium.com/max/962/1*So_BtEM7KNmimTYjWNqu5w.png)Phone confirmation

Click the link that you received to confirm your phone number. After that, you should receive your webhook URL and a guide to set up your WhatsApp Notifier.

![](https://miro.medium.com/max/962/1*Le0rDvF8uZF4542Gr_y8wg.png)Your Monika Whatsapp Notifier Webhook URL

Save the Monika WhatsApp Notifier webhook URL to somewhere safe as we will need them later.

# Configuring Monika with Webhook

[

## GitHub — hyperjumptech/monika: Monika is a command-line application to monitor every part of your…

### Monika is a command-line application to monitor every part of your web app using a simple JSON configuration file. Get…

github.com

](https://github.com/hyperjumptech/monika)

I can assure you that Monika is not [the girl from Doki Doki Literature Club](<https://doki-doki-literature-club.fandom.com/wiki/Monika_(DDLC)>). **Monika** is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several undesirable events such as service outages or slow services. In addition, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like [SMTP mail](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8), Telegram, Slack, etc.

Install Monika via `npm install -g @hyperjumptech/monika` or if you don’t have NPM in your system, you can [download the prebuilt binary from our release page](https://github.com/hyperjumptech/monika/releases).

Now that we have our Webhook URL, it’s time to create a configuration called `monika.yml`:

Let me explain a little bit about this configuration:

- You need to set the notification channel in the `notifications` object. There are 3 properties: `id`, `type`, and `data`. Set `id`with any string values, it’s just an identifier. Set `type` with `monika-notif`. Then put your WhatsApp notifier webhook URL in `url` key in the `data` object.
- Monika will be probing [https://github.com](https://github.com) and will send you an alert if the response time is greater than 500 milliseconds or the response status code is not 200, meaning the website is down

Now that we have our configuration ready, it’s time to run it with Monika. Go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*JyohP5ybvPy0tNMCFciwLg.png)The result

Congratulations! Now that you have successfully integrated Monika with Monika WhatsApp Notifier, you will be notified if your website is slow or down via WhatsApp.

# Closing

In order to use WhatsApp as your notification channel, you need to use WhatsApp Business API. Unfortunately, WhatsApp Business API is currently limited. With our Monika WhatsApp Notifier, you can receive Monika notifications straight to your WhatsApp **without any charges**.

If you’re having a problem with using Monika, don’t hesitate to create an issue on [Monika’s Github Issue Page](https://github.com/hyperjumptech/monika/issues). If you like this article, don’t forget to clap and share this article with your friends!

That’s it for today, see you next time!

[Hyperjump](https://hyperjump.tech/) is an open-source-first company providing engineering excellence service. We aim to build and commercialize [open-source tools](https://github.com/hyperjumptech) to help companies streamline, simplify, and secure the most important aspects of its modern DevOps practices.

[

## Hyperjump

### Open-source first. Cloud native. DevOps excellence. Repositories TypeScript Updated 5 MIT 12 0 Nov 22, 2021 Go 0 0…

github.com

](https://github.com/hyperjumptech)
