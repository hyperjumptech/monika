[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----9ed13e5a910e--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----9ed13e5a910e--------------------------------)Follow

Nov 3, 2021

·4 min read

# Using Slack in your workplace? Integrate Monika with your Slack channels to receive Monika notifications

![](https://miro.medium.com/max/1400/0*QFadVK4RSBdKmAkZ)Photo by [Stephen Phillips - Hostreviews.co.uk](https://unsplash.com/@hostreviews?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

In Indonesia, many companies use WhatsApp as their primary workplace communication application. Sure, it’s efficient at certain times since everyone uses WhatsApp as their daily communication app, but this could cause some people to avoid opening their WhatsApp as their private life and work life is being blended into one app and they have that sense of obligation to open their workplace group chats while they are trying to stay in touch with their families.

Since the COVID-19 pandemic, many employees are working from home, encouraging companies to rely on business messaging tools to communicate between teams. I asked a few friends of mine what tools they are using for workplace communication, and many of them simply answered: [Slack](https://www.slack.com).

In this article, I will be sharing how to integrate Monika with Slack. You can integrate Monika with Slack using Incoming Webhook so that when there is a Monika incidents or recoveries alert, your team will be notified via existing Slack channels. So, without further ado:

Let’s do this!

# Setup Webhook with Slack

[

## Slack is where the future works

### Slack is a new way to communicate with your team. It's faster, better organized, and more secure than email.

www.slack.com

](https://www.slack.com)

First things first, you need to have a Slack workspace. Create your user account on their website and follow their steps to create a new workspace. Now that we have our workspace ready, head to the **Browse Slack** and select Apps. Search for an app called **Incoming Webhooks**.

![](https://miro.medium.com/max/1400/1*Y7V0vMPpbYK89sqFzUaj-A.png)Incoming Webhooks App

Click **Add** and you will be redirected to the setup page. Click the **Add to Slack** button. You will be asked which channels you want to connect with Monika. As an example, I used the **#monika-notification** channel. After you have selected your channel, click **Add Incoming Webhooks Integration** button. You should see that your Webhook URL is ready to use.

![](https://miro.medium.com/max/1400/1*d1sx8i8I8d3O-r6n8b5lLg.png)Example of Webhook URL (Redacted)

# Configuring Monika with Webhook

[

## GitHub - hyperjumptech/monika: Monika is a command-line application to monitor every part of your…

### Monika is a command-line application to monitor every part of your web app using a simple JSON configuration file. Get…

github.com

](https://github.com/hyperjumptech/monika)

Ever heard of Monika? Just to make sure, it’s not [that girl from Doki Doki Literature Club](<https://doki-doki-literature-club.fandom.com/wiki/Monika_(DDLC)>). **Monika** is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several undesirable events such as service outages or slow services. In addition, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like [SMTP mail](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8), Telegram, [**WhatsApp**](https://whatsapp.hyperjump.tech/) (It’s free!), etc.

To run Monika, make sure you have installed Monika by running `npm install -g @hyperjumptech/monika` if you’re using NPM, but you can also [download the prebuilt binary from our release page](https://github.com/hyperjumptech/monika/releases) if you prefer to.

Now that we have our Webhook URL, it’s time to create a configuration called `monika.yml`:

Monika Configuration File

Let me explain a little bit about this configuration:

- Monika is using the Slack notification channel. You can change the notification channel by changing `type` key to another value such as [SMTP](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8) or [WhatsApp](https://whatsapp.hyperjump.tech/). In the `data` object, there is only one key called `url` for your Webhook URL
- Monika will be probing [https://github.com](https://github.com) and will send you an alert if the response time is greater than 500 milliseconds or the response status code is not 200, meaning the website is down
- If by chance when probing Github the response time is larger than 10000 milliseconds, you will receive an alert about your internet connection.

Now that we have our configuration ready, it’s time to run it with Monika. Go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*zL-bVip3iC6tvXqDElRjRA.png)The result

Congratulations! Now that you have successfully integrated Monika with Slack, you will be notified if your website is slow or down!

# Closing

Ever since the COVID-19 pandemic, business communication tools become essential for teams to communicate properly as everyone is working from home. Many companies now use Slack for communicating between teams. And when it comes to website monitoring, integrating Slack with Monika can be useful for alerting your teams if your website is down or slow.

If you’re having a problem with using Monika, don’t hesitate to create an issue on [Monika’s Github Issue Page](https://github.com/hyperjumptech/monika/issues). If you like this article, don’t forget to clap and share this article with your friends!

That’s it for today, see you next time!

[Hyperjump](https://hyperjump.tech/) is an open-source-first company providing engineering excellence service. We aim to build and commercialize [open-source tools](https://github.com/hyperjumptech) to help companies streamline, simplify, and secure the most important aspects of its modern DevOps practices.

[

## Hyperjump

### Open-source first. Cloud-native. DevOps excellence. - Hyperjump

github.com

](https://github.com/hyperjumptech)
