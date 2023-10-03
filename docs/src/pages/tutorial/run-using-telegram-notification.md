---
id: run-using-telegram-notification
title: Run using Telegram Notification
---

This tutorial, we will be sharing how to integrate Monika with Telegram bots so that when there are Monika incidents or recoveries, you will be notified on your Telegram group.

## Set up the Telegram bot

First, you need a Telegram account. Head over to [https://web.telegram.org](https://web.telegram.org) to create your account. And then, create a new private chat. Search for an account named “**BotFather**”. After that, do these steps below:

- Type **/newbot** and press Enter to create a new bot.
- **You will be prompted by BotFather to name your bot**. Let’s call it anything you like, such as “Monika Bot”, “Rise and Shine Bot”, or “Open your laptop now! Bot”. **The more urgent it sounds, the better!** Type your bot name and press Enter.
- After that, **you will be prompted by BotFather to enter your bot username**. You may see an error because your bot username has been taken by someone else. Type your bot username and press Enter again.
- If you have selected your bot username, you will receive your bot token. **Save the token elsewhere** as we are going to need them later.

![](https://miro.medium.com/max/1400/1*Tj8Yki3M74b_6UEY9fNJcg.png)

Now the next step is to create a group for the Monika notifications. Create a group in Telegram, and invite your bots into the group. Then, set your bot to be a group administrator.

![](https://miro.medium.com/max/1400/1*jI767UEJfnefsev7JDILOQ.png)

Now that we have our bot API key and set our bot to be a group administrator, all we need to do is to get the group ID. Invite a new bot to the group called **@RawDataBot** into your group to get the group ID.

![](https://miro.medium.com/max/762/1*FlZ_WX2zPPqmvpQNY9GWmA.png)

After you have successfully invited the Telegram Bot Raw, you will see the group ID. **Save the group ID to somewhere else** and don’t forget to **kick the Telegram Bot Raw from your group**. Now that we have the group ID and bot token, it’s time to integrate it with Monika.

![](https://miro.medium.com/max/818/1*kboCi3VtfmWXMBDumzoWdg.png)

## Integrate Telegram with Monika

Now that we have our Webhook URL, it’s time to create a configuration called `monika.yml`:

```
notifications:
  - id: 12f3e1df-3222-4a79-b931-146f964be711
    type: telegram
    data:
      group_id: "<group_id>"
      bot_token: <bot_token>
probes:
  - id: 48c828bb-b761-41e7-b360-ba0692ded184
    name: ''
    requests:
      - url: https://github.com
        body: {}
        timeout: 10000
    alerts: []
```

Let me explain a little bit about this configuration:

- You need to set the notification channel in the `notifications` object. There are 3 properties: `id`, `type`, and `data`. Set the `id` to any string values, as it is just an identifier. Then, set the `type` to `telegram` to set the notification channel to Telegram. After that, put your **group ID** and **bot token** notifier webhook URL in `group_id` and `bot_token` keys in the `data` object.
- Monika will be probing [https://github.com](https://github.com/) and will send you an alert if the response time is greater than two seconds or the response status code is not 200, meaning the website is down five times.

Now that we have our configuration ready, it’s time to run it with Monika. Go to the directory where you saved the Monika configuration, and run Monika straight away using `monika -c monika.yml`

![](https://miro.medium.com/max/986/1*WBjJn0hXpNSJ942PpnfZig.png)

Congratulations! Now that you have successfully integrated Monika with Telegram, you will be notified if your website is slow or down.
