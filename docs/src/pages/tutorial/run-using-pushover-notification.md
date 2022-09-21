[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----fed0e161ceca--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----fed0e161ceca--------------------------------)Follow

Jun 8

·4 min read

# Integrate Monika with Pushover

![](https://miro.medium.com/max/1024/0*RpBWnJ8LjZFegdkj)Pushover logo

At Hyperjump, one of our priorities is improving Monika integrations with many collaboration tools. We have successfully integrated Monika with [Telegram Bots](https://medium.com/hyperjump-tech/integrate-monika-with-telegram-using-telegram-bots-api-f33de6d6646), [Slack](https://medium.com/hyperjump-tech/integrate-monika-with-your-slack-channels-to-receive-monika-notifications-using-incoming-webhook-9ed13e5a910e), [Microsoft Teams](https://medium.com/hyperjump-tech/integrate-monika-with-microsoft-teams-get-notifications-straight-to-your-channels-using-incoming-3292147d6758), [Discord](https://medium.com/hyperjump-tech/integrate-monika-with-discord-using-discord-server-webhook-bffcd39b7b19), and even [WhatsApp](https://medium.com/hyperjump-tech/get-monika-notifications-to-your-whatsapp-using-monika-whatsapp-notifier-78a83560c04c) too. In June 2022, we added [Pushover](https://pushover.net/) to Monika’s growing channel choice.

Pushover is a simple notifications service, which enables you to send real-time notifications on your Android, iPhone, iPad, and Desktop. With their clients, you can receive unlimited push notifications on all of your devices from dozens of [websites, services, and applications](https://pushover.net/apps) that are integrated with Pushover.

This article will show you how to integrate Monika with Pushover to get your Monika notifications through your Pushover clients. So, without further ado:

Let’s do this!

# Setup Pushover

To use Pushover with Monika, head to [https://pushover.net](https://pushover.net) and create an account. Then, you need to confirm your email. After that, log in to the dashboard and pay attention to the “**Your User Key**”. Save the user key to a safe place as we are going to need it later.

![](https://miro.medium.com/max/1400/1*CNvmMECn2qm2_qT5Jge7Mw.png)Your User Key

Then, scroll down to the bottom of the page. Click the **Create a new Application/API Token**. Fill out the forms, and click **Create Application**. You should see your **API Token/Key.** Save the token to a safe place as we are going to need it later.

![](https://miro.medium.com/max/1400/1*ECMUAviGQlkJmLzE-e6j_A.png)API Token

After you created the API Token, go back to the main Dashboard. Then, click the **Add Phone, Tablet, or Desktop**. For this case, use the **Pushover for Desktop**. Then, enter your Device Name and click **Register Web Browser**. You will be redirected to your created Pushover desktop client.

![](https://miro.medium.com/max/1400/1*0Ta1LgUKTRYTBU60T6AXMg.png)Pushover desktop client

Once that’s done, it’s time to configure Monika to integrate with the Pushover desktop client.

# Integrate Monika with Pushover

[

## GitHub - hyperjumptech/monika: Monika is a command-line application to monitor every part of your…

### Monika is a command-line application to monitor every part of your web app using a simple YAML configuration file. Get…

github.com

](https://github.com/hyperjumptech/monika)

**Monika** is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several conditions such as service outages or slow services. Also, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like [SMTP mail](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8), [WhatsApp](https://medium.com/hyperjump-tech/get-monika-notifications-to-your-whatsapp-using-monika-whatsapp-notifier-78a83560c04c) (**it’s free!**), [Microsoft Teams](https://medium.com/hyperjump-tech/integrate-monika-with-microsoft-teams-get-notifications-straight-to-your-channels-using-incoming-3292147d6758), [Slack](https://medium.com/hyperjump-tech/integrate-monika-with-your-slack-channels-to-receive-monika-notifications-using-incoming-webhook-9ed13e5a910e), and many more.

There are many ways to install Monika, from Node Package Manager (NPM), [downloading binaries from the Monika release page](https://medium.com/hyperjump-tech/install-and-run-monika-in-linux-without-package-managers-9b019571bf38), to package managers such as [Homebrew](https://medium.com/hyperjump-tech/install-monika-in-macos-using-homebrew-875265f8ded6) or [Snapcraft](https://medium.com/hyperjump-tech/install-monika-on-linux-using-snapcraft-2ecff9dd98ac).

Now that we have our User and API Token from Pushover, it’s time to create a Monika configuration called `monika.yml`

Let’s take a look at the configuration above:

- The Pushover notification channel will use the API Token and User Key you created from the previous step.
- It will probe [http://localhost:8080/health,](https://www.google.com%2C/) with the method GET
- It will alert you if the response status code is not 200, or the response time is longer than two seconds
- The incident/recovery threshold count is 3, meaning Monika will only send notifications when the probed URL returns non-2xx status 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes.

Once that’s done, run Monika with the configuration above with the command `monika -c monika.yml`

![](https://miro.medium.com/max/1400/0*WRJ6XIrycynPulRw.png)It’s running!

Congratulations! You have successfully integrated Monika with Pushover! Note that Pushover integration is only available from the Monika version 1.8.0.

# Closing

Pushover is a simple notifications service, which enables you to send real-time notifications on your Android, iPhone, iPad, and Desktop. In this article, we only showed you the Desktop client, whereas Pushover supports mobile devices too. You can explore how to set up Pushover with Monika using mobile devices, and let us know if it’s as easy as the desktop version.

If you’re having a problem with using Monika, don’t hesitate to create an issue on [Monika’s Github Issue Page](https://github.com/hyperjumptech/monika/issues). If you like this article, don’t forget to clap and share this article with your friends!

That’s it for today, see you next time!

[Hyperjump](https://hyperjump.tech/) is an open-source-first company providing engineering excellence service. We aim to build and commercialize [open-source tools](https://github.com/hyperjumptech) to help companies streamline, simplify, and secure the most important aspects of their modern DevOps practices.

[

## Hyperjump

### Open-source first. Cloud-native. DevOps excellence. - Hyperjump

github.com

](https://github.com/hyperjumptech)
