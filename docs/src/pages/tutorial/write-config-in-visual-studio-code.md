[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----d7bc86c1d36a--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----d7bc86c1d36a--------------------------------)Follow

Jul 20

·5 min read

# Creating Monika Configuration from Scratch using Autocomplete in Visual Studio Code

![](https://miro.medium.com/max/1400/0*7JiUO42JJzxxFQD7)Photo by [Ferenc Almasi](https://unsplash.com/@flowforfrank?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

We have built a [Monika Config Generator](https://monika-config.hyperjump.tech), a GUI-based Monika configuration maker. You will be prompted with a wizard to create your own Monika configuration from scratch.

Monika Config Generator is pretty easy for beginners. But for those users who are experienced with generating Monika configurations, opening the website may become a hassle because you need to open your browser, navigate, and proceed through the long wizard if you have so many probes to monitor.

This article will tell you how to create Monika configurations from scratch, using only Visual Studio Code and a VS Code extension. So, Without further ado:

# Preparation

Let’s start with installing Visual Studio Code if you haven’t installed it on your computer yet. Head over to [https://code.visualstudio.com/](https://code.visualstudio.com/) and download the installation file according to your operating system.

After you installed Visual Studio Code, head to the Extension menu, and search for an extension called **YAML** created by **Red Hat**. Install the extension right away in order to enable the Monika configuration autocompletion.

![](https://miro.medium.com/max/1400/1*9R7agkYSGoSIqcEbPFxllA.png)Installing YAML extension

Once you’re done, create a file called `monika.yml` and try to type “notific”. It will show you an explanation of the “notifications” key.

![](https://miro.medium.com/max/1400/1*ye0j0MT9HFGm3TMb_0sMjw.png)

Then proceed to type “notifications:” all the way and press enter to break the line. You will see a warning that the “notifications” key type should be an array

![](https://miro.medium.com/max/1400/1*dAxISW6GtYdeTxSHlV6YCw.png)Warning

Now some of you may think, “what if I don’t know what to type in a blank file?”. You can simply press CTRL+Space to show available options.

![](https://miro.medium.com/max/1400/1*GB73EpEOXKl4UpBqaDP3Mw.png)CTRL+Space to show all available options

Also, it includes auto-complete when you select an option. For example, press CTRL+Space and select probes. It will automatically set a probe with an empty ID, ten seconds interval, and 5 times incidents/recoveries threshold.

![](https://miro.medium.com/max/854/1*98EBPAbUlDm0mQ-0xVArOw.png)Probe option auto-complete

If you have used Monika, you may notice that some keys are not there yet such as the URL and the Method. Below the `id` key, with the same indent, try to press CTRL+Space again and you will see all available keys inside a probe object.

![](https://miro.medium.com/max/1400/1*DhTDIrtmUGgGXxd1LmjUbw.png)All probes available keys

Now you can create your own Monika configuration using the methods above. For now, let’s try to create a Monika configuration based on the points below:

- I want to use the Desktop notification channel
- I want to create a single probe with the name “Google”, with any ID, has ten seconds interval, 10 times incidents/recoveries threshold
- Inside the probe “Google”, I want to have a request that will hit [https://www.google.com](https://www.google.com) with the method GET

Try to do it yourself first and see if you can create the configuration from the points above similar to the configuration below:

If the configuration is similar to the one you created, then congratulations! All that’s left to do is to run it using Monika

# Run Newly Created Configuration using Monika

[

## GitHub - hyperjumptech/monika: Monika is a command-line application to monitor every part of your…

### Monika is a command-line application to monitor every part of your web app using a simple YAML configuration file. Get…

github.com

](https://github.com/hyperjumptech/monika)

**Monika** is an open-source and free synthetic monitoring command-line application. Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several conditions such as service outages or slow services. Also, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like [SMTP mail](https://medium.com/hyperjump-tech/get-notified-by-e-mail-when-your-website-is-down-using-monika-a-guide-to-smtp-notification-channel-91dfcbed2bf8), [WhatsApp](https://medium.com/hyperjump-tech/get-monika-notifications-to-your-whatsapp-using-monika-whatsapp-notifier-78a83560c04c) (**it’s free!**), [Microsoft Teams](https://medium.com/hyperjump-tech/integrate-monika-with-microsoft-teams-get-notifications-straight-to-your-channels-using-incoming-3292147d6758), [Slack](https://medium.com/hyperjump-tech/integrate-monika-with-your-slack-channels-to-receive-monika-notifications-using-incoming-webhook-9ed13e5a910e), and many more.

There are many ways to install Monika, from Node Package Manager (NPM), [downloading binaries from the Monika release page](https://medium.com/hyperjump-tech/install-and-run-monika-in-linux-without-package-managers-9b019571bf38), to package managers such as [Homebrew](https://medium.com/hyperjump-tech/install-monika-in-macos-using-homebrew-875265f8ded6) or [Snapcraft](https://medium.com/hyperjump-tech/install-monika-on-linux-using-snapcraft-2ecff9dd98ac).

Open the terminal and navigate to your newly created Monika configuration. By default, Monika will automatically be looking for`monika.yml` inside the directory where you run Monika. But if you rename it to something else, you can simply run `monika -c <your_configuration_file>.yml` in your terminal.

Let’s try to run Monika using `monika` without any flags or parameters.

![](https://miro.medium.com/max/1400/1*EMU4TAxYvrYn3Z-0NMlQfg.png)It’s up and running!

Congratulations! Now you can create Monika configurations straight from your Visual Studio Code!

# Closing

At times when opening your browser to create a Monika configuration feels like a hassle, it is better to create your Monika configuration straight from your Visual Studio Code. Huge shoutout to [Budhi](https://medium.com/u/b2cb95c96f37?source=post_page-----d7bc86c1d36a--------------------------------) for creating this awesome feature!

If you’re having a problem with using Monika, don’t hesitate to create an issue on [Monika’s Github Issue Page](https://github.com/hyperjumptech/monika/issues). If you like this article, don’t forget to clap and share this article with your friends!

That’s it for today, see you next time!

[Hyperjump](https://hyperjump.tech/) is an open-source-first company providing engineering excellence service. We aim to build and commercialize [open-source tools](https://github.com/hyperjumptech) to help companies streamline, simplify, and secure the most important aspects of their modern DevOps practices.

[

## Hyperjump

### Open-source first. Cloud-native. DevOps excellence. Repositories TypeScript Updated 390 MIT 48 3 Jul 18, 2022…

github.com

](https://github.com/hyperjumptech)
