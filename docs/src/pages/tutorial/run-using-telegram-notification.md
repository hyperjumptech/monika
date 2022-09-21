[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----f33de6d6646--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----f33de6d6646--------------------------------)Follow

Jan 11

·5 min read

# Integrate Monika with Telegram using Telegram Bots API

![](https://miro.medium.com/max/1400/0*pP95gCUVaHblfJEH)Photo by [Dima Solomin](https://unsplash.com/@solomin_d?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

As we mentioned earlier in our [Integrate Slack with Monika](https://medium.com/hyperjump-tech/integrate-monika-with-your-slack-channels-to-receive-monika-notifications-using-incoming-webhook-9ed13e5a910e) article, we noted that in Indonesia, many companies use WhatsApp as their primary workplace communication application. But, some of them moved their channels to Telegram for better “separation of concerns”.

Telegram is a wonderful app. It has a larger limit for group members, multiple sessions which you can use the mobile app and the desktop app at the same time (WhatsApp can do this too, but [it is still in beta](https://faq.whatsapp.com/general/download-and-installation/about-multi-device-beta/)), unlimited server storage, and the flexibility to create bots.

In this article, we will be sharing how to integrate Monika with Telegram bots so that when there are Monika incidents or recoveries, you will be notified on your Telegram group. So, without further ado:

Let’s do this!

# Set up the Telegram bot

First, you need a Telegram account. Head over to [https://web.telegram.org](https://web.telegram.org) to create your account. And then, create a new private chat. Search for an account named “**BotFather**”. After that, do these steps below:

- Type **/newbot** and press Enter to create a new bot.
- **You will be prompted by BotFather to name your bot**. Let’s call it anything you like, such as “Monika Bot”, “Rise and Shine Bot”, or “Open your laptop now! Bot”. **The more urgent it sounds, the better!** Type your bot name and press Enter.
- After that, **you will be prompted by BotFather to enter your bot username**. You may see an error because your bot username has been taken by someone else. Type your bot username and press Enter again.
- If you have selected your bot username, you will receive your bot token. **Save the token elsewhere** as we are going to need them later.

![](https://miro.medium.com/max/1400/1*Tj8Yki3M74b_6UEY9fNJcg.png)Set up the bot

Now the next step is to create a group for the Monika notifications. Create a group in Telegram, and invite your bots into the group. Then, set your bot to be a group administrator.

![](https://miro.medium.com/max/1400/1*jI767UEJfnefsev7JDILOQ.png)Set your bot to be a group administrator

Now that we have our bot API key and set our bot to be a group administrator, all we need to do is to get the group ID. Invite a new bot to the group called **@RawDataBot** into your group to get the group ID.

![](https://miro.medium.com/max/762/1*FlZ_WX2zPPqmvpQNY9GWmA.png)Telegram Bot Raw (@RawDataBot)

After you have successfully invited the Telegram Bot Raw, you will see the group ID. **Save the group ID to somewhere else** and don’t forget to **kick the Telegram Bot Raw from your group**. Now that we have the group ID and bot token, it’s time to integrate it with Monika.

![](https://miro.medium.com/max/818/1*kboCi3VtfmWXMBDumzoWdg.png)Group ID example

# **Integrate Telegram with Monika**

[

## GitHub - hyperjumptech/monika: Monika is a command-line application to monitor every part of your…

### Monika is a command-line application to monitor every part of your web app using a simple YAML configuration file. Get…

github.com

](https://github.com/hyperjumptech/monika)

**Monika** is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several undesirable events such as service outages or slow services. In addition, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like [SMTP mail](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8), Telegram, Slack, etc.

Install Monika via `npm install -g @hyperjumptech/monika` or if you don’t have NPM in your system, you can [download the prebuilt binary from our release page](https://github.com/hyperjumptech/monika/releases).

Now that we have our Webhook URL, it’s time to create a configuration called `monika.yml`:

Let me explain a little bit about this configuration:

- You need to set the notification channel in the `notifications` object. There are 3 properties: `id`, `type`, and `data`. Set the `id` to any string values, as it is just an identifier. Then, set the `type` to `telegram` to set the notification channel to Telegram. After that, put your **group ID** and **bot token** notifier webhook URL in `group_id` and `bot_token` keys in the `data` object.
- Monika will be probing [https://github.com](https://github.com/) and will send you an alert if the response time is greater than two seconds or the response status code is not 200, meaning the website is down five times.

Now that we have our configuration ready, it’s time to run it with Monika. Go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/986/1*WBjJn0hXpNSJ942PpnfZig.png)Success!

Congratulations! Now that you have successfully integrated Monika with Telegram, you will be notified if your website is slow or down.

# Closing

If your company is using Telegram for primary workplace communication, integrating Monika to Telegram is a good idea. You can easily add your bot into your existing groups without having to open another communication channel just to check if your website is down or slow.

If you’re having a problem with using Monika, don’t hesitate to create an issue on [Monika’s Github Issue Page](https://github.com/hyperjumptech/monika/issues). If you like this article, don’t forget to clap and share this article with your friends!

That’s it for today, see you next time!

[

## Hyperjump

### Open-source first. Cloud native. DevOps excellence. Repositories TypeScript Updated 5 MIT 12 0 Nov 22, 2021 Go 0 0…

github.com

](https://github.com/hyperjumptech)
