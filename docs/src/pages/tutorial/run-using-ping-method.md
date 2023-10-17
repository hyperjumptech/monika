---
id: run-using-ping-method
title: Run using Ping Method
---

This tutorial will show you how to integrate Monika with Ping Method to get your Monika notifications.

## Installing Monika

Install Monika via `npm install -g @hyperjumptech/monika` or if you don’t have NPM in your system, you can [download the prebuilt binary from our release page](https://github.com/hyperjumptech/monika/releases). After installing Monika, run `monika -v` to verify your Monika installation.

![](https://miro.medium.com/proxy/1*NCa_JT4SdiaDPPdHgIzq2Q.png)

## Preparing a configuration

Now that we have installed Monika, let’s prepare a configuration:

```
notifications:
  - id: desktop
    type: desktop
probes:
  - id: ping_test
    name: ping_test
    description: requesting icmp ping
    interval: 10
    requests:
      - url: https://google.com
        ping: true
      - method: GET
        url: https://reqres.in/api/users
    alerts:
      - query: response.status != 200
        message: Status code is not 200
      - query: response.time > 2000
        message: Request took more than 2 seconds
```

Let me explain this configuration a little bit:

- This configuration uses Desktop notifications
- This probe configuration will do two requests: **Hit google.com using PING**. After PING success, it will **hit** [**https://reqres.in/api/users**](https://reqres.in/api/users) **using the GET method**. If by chance the first request fails, it will not proceed to the next request.
- This probe configuration will alert you if the status code is not 200, or the request took longer than two seconds

Save the configuration above as `monika.yaml` in your local machine and run `monika -c monika.yaml` command in your terminal inside the directory where you saved the configuration file.

![](https://miro.medium.com/max/1400/1*96YDF6fKh9uc1ABw5Z_6Cw.png)

We’re not finished yet. We want to know what will happen if we failed to PING Google. Let Monika run in the background, and try to disconnect yourself from the internet. You will get a notification:

![](https://miro.medium.com/max/1400/1*9-EXof54-ekJfzorw269ew.png)

There is some explanation for the error message:

- 0: ‘URI not found’
- 1: ‘Connection reset’
- 2: ‘Connection refused’
- 3: ‘Unknown error’
- 4: ‘Ping timed out’
- 599: ‘Request Timed out’

It shows PING timed out because your internet is disconnected. So, we could distinguish which alerts come from the API itself, and which alerts come from your internet problem.
