[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----8a875a527512--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----8a875a527512--------------------------------)Follow

Feb 9

·4 min read

# Use PING to check your internet connection for your Monika API monitoring

![](https://miro.medium.com/max/1400/0*HNZxvDYjZGD61paE)Photo by [Mika Baumeister](https://unsplash.com/@mbaumi?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

Basically, [Monika](https://monika.hyperjump.tech)’s default behavior is hitting your API periodically and reporting you the performance and the result of your API. Of course, “hitting your API periodically” means it requires a working internet connection.

And let’s face it, even your internet service providers can be slow and experience downtime too. While your internet service provider is having a problem, it could send you a false alarm saying that your API is down. That’s why many people tend to open their Terminal and run the `ping 8.8.8.8` command to ensure that they are still connected to the internet.

In the newest version of Monika, we have included the PING command inside the Monika. So, this article will show you how to use PING in Monika as a secondary check so that you will know the real story behind your API’s failures. So, without further ado:

# Installing Monika

[

## GitHub - hyperjumptech/monika: Monika is a command-line application to monitor every part of your…

### Monika is a command-line application to monitor every part of your web app using a simple YAML configuration file. Get…

github.com

](https://github.com/hyperjumptech/monika)

**Monika** is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several undesirable events such as service outages or slow services. In addition, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like [SMTP mail](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8), Telegram, Slack, etc.

Install Monika via `npm install -g @hyperjumptech/monika` or if you don’t have NPM in your system, you can [download the prebuilt binary from our release page](https://github.com/hyperjumptech/monika/releases). After installing Monika, run `monika -v` to verify your Monika installation.

![](https://miro.medium.com/proxy/1*NCa_JT4SdiaDPPdHgIzq2Q.png)Monika is installed successfully

# Preparing a configuration

Now that we have installed Monika, let’s prepare a configuration:

Let me explain this configuration a little bit:

- This configuration uses Desktop notifications
- This probe configuration will do two requests: **Hit google.com using PING**. After PING success, it will **hit** [**https://reqres.in/api/users**](https://reqres.in/api/users) **using the GET method**. If by chance the first request fails, it will not proceed to the next request.
- This probe configuration will alert you if the status code is not 200, or the request took longer than two seconds
- This probe configuration will alert you about incidents/recoveries if it happens once, so if there is an incident you will be notified immediately. The same goes if there is a recovery.

Save the configuration above as `monika.yaml` in your local machine and run `monika -c monika.yaml` command in your terminal inside the directory where you saved the configuration file.

![](https://miro.medium.com/max/1400/1*96YDF6fKh9uc1ABw5Z_6Cw.png)It’s up and running

We’re not finished yet. We want to know what will happen if we failed to PING Google. Let Monika run in the background, and try to disconnect yourself from the internet. You will get a notification:

![](https://miro.medium.com/max/1400/1*9-EXof54-ekJfzorw269ew.png)Error code 4

There is some explanation for the error message:

- 0: ‘URI not found’
- 1: ‘Connection reset’
- 2: ‘Connection refused’
- 3: ‘Unknown error’
- 4: ‘Ping timed out’
- 599: ‘Request Timed out’

It shows PING timed out because your internet is disconnected. So, we could distinguish which alerts come from the API itself, and which alerts come from your internet problem.

# Closing

Monitoring your API requires internet, and sometimes your internet can be unreliable. Using this PING functionality, you can be aware of false alarms from Monika. Sure, we already implemented [STUN server checking as secondary proof](https://github.com/hyperjumptech/monika/pull/357), but it’s better to be more safe than sorry.

[

## Issues · hyperjumptech/monika

### New issue Have a question about this project? Sign up for a free GitHub account to open an issue and contact its…

github.com

](https://github.com/hyperjumptech/monika/issues)

If you have questions or find issues while using Monika, don’t hesitate to create an issue on [Monika’s Github Issue Page](https://github.com/hyperjumptech/monika/issues). If you like this article, don’t forget to clap and share this article with your friends!

That’s it for today, see you next week!

[Hyperjump](https://hyperjump.tech/) is an open-source-first company providing engineering excellence service. We aim to build and commercialize [open-source tools](https://github.com/hyperjumptech) to help companies streamline, simplify, and secure the most important aspects of their modern DevOps practices.

[

## Hyperjump

### Open-source first. Cloud native. DevOps excellence. - Hyperjump

github.com

](https://github.com/hyperjumptech)
