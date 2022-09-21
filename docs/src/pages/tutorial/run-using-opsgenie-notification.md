[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----79267c84f553--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----79267c84f553--------------------------------)Follow

Jun 22

·4 min read

[

Save

](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F79267c84f553&operation=register&redirect=https%3A%2F%2Fmedium.com%2Fhyperjump-tech%2Fintegrate-monika-with-opsgenie-using-api-integrations-79267c84f553&source=--------------------------bookmark_header-----------)

# Integrate Monika with Opsgenie using API Integrations

![](https://miro.medium.com/max/1024/0*KxpaxjXijgfCvB8I)Atlassian Opsgenie — Image by [Google Play](https://play.google.com/store/apps/details?id=com.ifountain.opsgenie&hl=en_US&gl=US)

At Hyperjump, one of our priorities is improving Monika integrations with many collaboration tools. We have successfully integrated Monika with [Telegram Bots](https://medium.com/hyperjump-tech/integrate-monika-with-telegram-using-telegram-bots-api-f33de6d6646), [Slack](https://medium.com/hyperjump-tech/integrate-monika-with-your-slack-channels-to-receive-monika-notifications-using-incoming-webhook-9ed13e5a910e), [Microsoft Teams](https://medium.com/hyperjump-tech/integrate-monika-with-microsoft-teams-get-notifications-straight-to-your-channels-using-incoming-3292147d6758), [Discord](https://medium.com/hyperjump-tech/integrate-monika-with-discord-using-discord-server-webhook-bffcd39b7b19), and even [WhatsApp](https://medium.com/hyperjump-tech/get-monika-notifications-to-your-whatsapp-using-monika-whatsapp-notifier-78a83560c04c) too. In June 2022, we added [OpsGenie](https://www.atlassian.com/software/opsgenie) to Monika’s growing channel choice.

**Opsgenie** is an alerting and incident response tool developed by Atlassian. Using OpsGenie, you can receive alerts from Monika through the web application. Then, you can assign a responder to the alert received so that the responder can quickly troubleshoot the problem.

This article will show you how to integrate Monika with Opsgenie to get your Monika notifications through the Opsgenie dashboard. So, without further ado:

## Setup Opsgenie

To use Opsgenie, you need to create an account on the [Opsgenie website](https://www.atlassian.com/software/opsgenie). After you have created your account, head over to the Teams menu in the Dashboard and create a Team.

![](https://miro.medium.com/max/1400/1*qhx-3z_Wvd2-YbDVfrOJkw.png)Create a Team

Now that you have created a team, go to the **Integrations** menu and click **Add Integration**. Then, select the **API integration**. You will be redirected to the API Key page. After that, copy the API Key and save it somewhere safe as we are going to need it later.

![](https://miro.medium.com/max/1400/1*U6Rs1uQZy8KFo_44tcYd2g.png)The API Key

Once that’s done, it’s time to configure Monika to integrate with Opsgenie.

## Integrate Monika with Opsgenie

[

## GitHub - hyperjumptech/monika: Monika is a command-line application to monitor every part of your…

### Monika is a command-line application to monitor every part of your web app using a simple YAML configuration file. Get…

github.com

](https://github.com/hyperjumptech/monika)

**Monika** is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several conditions such as service outages or slow services. Also, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like [SMTP mail](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8), [WhatsApp](https://medium.com/hyperjump-tech/get-monika-notifications-to-your-whatsapp-using-monika-whatsapp-notifier-78a83560c04c) (**it’s free!**), [Microsoft Teams](https://medium.com/hyperjump-tech/integrate-monika-with-microsoft-teams-get-notifications-straight-to-your-channels-using-incoming-3292147d6758), [Slack](https://medium.com/hyperjump-tech/integrate-monika-with-your-slack-channels-to-receive-monika-notifications-using-incoming-webhook-9ed13e5a910e), and many more.

There are many ways to install Monika, from Node Package Manager (NPM), [downloading binaries from the Monika release page](https://medium.com/hyperjump-tech/install-and-run-monika-in-linux-without-package-managers-9b019571bf38), to package managers such as [Homebrew](https://medium.com/hyperjump-tech/install-monika-in-macos-using-homebrew-875265f8ded6) or [Snapcraft](https://medium.com/hyperjump-tech/install-monika-on-linux-using-snapcraft-2ecff9dd98ac).

Now that we have our API Key from Opsgenie, it’s time to create a Monika configuration called `monika.yml`

Let’s take a look at the configuration above:

- The Pushover notification channel will use the API Token and User Key you created from the previous step.
- It will probe [https://httpbin.org/delay/2500](https://httpbin.org/delay/2500)[,](https://www.google.com%2C/) with the method GET
- It will alert you if the response status code is not 200, or the response time is longer than two seconds
- The incident/recovery threshold count is 3, meaning Monika will only send notifications when the probed URL returns non-2xx status 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes.

Once that’s done, run Monika with the configuration above with the command `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*M0ddqavWVjDdfMc-AfeT6Q.png)Running Monika with Opsgenie integration

Congratulations! You have successfully integrated Monika with Opsgenie! Note that Opsgenie integration is only available from the Monika version 1.8.0++

# Closing

**Opsgenie** is an alerting and incident response tool developed by Atlassian. If you are a heavy Atlassian user that uses Jira and Bitbucket, you may find this integration very useful.

If you’re having a problem with using Monika, don’t hesitate to create an issue on [Monika’s Github Issue Page](https://github.com/hyperjumptech/monika/issues). If you like this article, don’t forget to clap and share this article with your friends!

That’s it for today, see you next time!

[Hyperjump](https://hyperjump.tech/) is an open-source-first company providing engineering excellence service. We aim to build and commercialize [open-source tools](https://github.com/hyperjumptech) to help companies streamline, simplify, and secure the most important aspects of their modern DevOps practices.

[

## Hyperjump

### Open-source first. Cloud-native. DevOps excellence. Repositories TypeScript Updated 378 MIT 47 5 Jun 21, 2022…

github.com

](https://github.com/hyperjumptech)
