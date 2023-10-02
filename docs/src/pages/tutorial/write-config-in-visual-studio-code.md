---
id: write-config-in-visual-studio-code
title: Write Config in Visual Studio Code
---

This tutorial will tell you how to create Monika configurations from scratch, using only Visual Studio Code and a VS Code extension.

## Preparation

Let’s start with installing Visual Studio Code if you haven’t installed it on your computer yet. Head over to [https://code.visualstudio.com/](https://code.visualstudio.com/) and download the installation file according to your operating system.

After you installed Visual Studio Code, head to the Extension menu, and search for an extension called **YAML** created by **Red Hat**. Install the extension right away in order to enable the Monika configuration autocompletion.

![](https://miro.medium.com/max/1400/1*9R7agkYSGoSIqcEbPFxllA.png)

Once you’re done, create a file called `monika.yml` and try to type “notific”. It will show you an explanation of the “notifications” key.

![](https://miro.medium.com/max/1400/1*ye0j0MT9HFGm3TMb_0sMjw.png)

Then proceed to type “notifications:” all the way and press enter to break the line. You will see a warning that the “notifications” key type should be an array

![](https://miro.medium.com/max/1400/1*dAxISW6GtYdeTxSHlV6YCw.png)

Now some of you may think, “what if I don’t know what to type in a blank file?”. You can simply press CTRL+Space to show available options.

![](https://miro.medium.com/max/1400/1*GB73EpEOXKl4UpBqaDP3Mw.png)

Also, it includes auto-complete when you select an option. For example, press CTRL+Space and select probes. It will automatically set a probe with an empty ID, and ten seconds interval.

![](https://miro.medium.com/max/854/1*98EBPAbUlDm0mQ-0xVArOw.png)

If you have used Monika, you may notice that some keys are not there yet such as the URL and the Method. Below the `id` key, with the same indent, try to press CTRL+Space again and you will see all available keys inside a probe object.

![](https://miro.medium.com/max/1400/1*DhTDIrtmUGgGXxd1LmjUbw.png)

Now you can create your own Monika configuration using the methods above. For now, let’s try to create a Monika configuration based on the points below:

- I want to use the Desktop notification channel
- I want to create a single probe with the name “Google”, with any ID, has ten seconds interval
- Inside the probe “Google”, I want to have a request that will hit [https://www.google.com](https://www.google.com) with the method GET

Try to do it yourself first and see if you can create the configuration from the points above similar to the configuration below:

```
notifications:
  - id: desktop
    type: desktop
probes:
  - id: google
    name: "Google"
    requests:
      - url: https://www.google.com
        timeout: 10
        method: GET
    interval: 10
```

If the configuration is similar to the one you created, then congratulations! All that’s left to do is to run it using Monika.
