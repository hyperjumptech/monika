---
id: run-using-opsgenie-notification
title: Run using Opsgenie Notification
---

This tutorial will show you how to integrate Monika with Opsgenie to get your Monika notifications through the Opsgenie dashboard.

## Setup Opsgenie

To use Opsgenie, you need to create an account on the [Opsgenie website](https://www.atlassian.com/software/opsgenie). After you have created your account, head over to the Teams menu in the Dashboard and create a Team.

![](https://miro.medium.com/max/1400/1*qhx-3z_Wvd2-YbDVfrOJkw.png)

Now that you have created a team, go to the **Integrations** menu and click **Add Integration**. Then, select the **API integration**. You will be redirected to the API Key page. After that, copy the API Key and save it somewhere safe as we are going to need it later.

![](https://miro.medium.com/max/1400/1*U6Rs1uQZy8KFo_44tcYd2g.png)

Once that’s done, it’s time to configure Monika to integrate with Opsgenie.

## Integrate Monika with Opsgenie

Now that we have our API Key from Opsgenie, it’s time to create a Monika configuration called `monika.yml`

```
notifications:
  - id: unique-id-opsgenie
    type: opsgenie
    data:
      geniekey: <YOUR_API_KEY>
probes:
  - id: "1"
    name: Localhost
    description: Check status
    interval: 3
    requests:
      - method: GET
        url: https://httpbin.org/delay/2500
    alerts:
      - query: response.time > 2000
        message: Response time more than 2 seconds
      - query: response.status != 200
        message: Status not 2xx
```

Let’s take a look at the configuration above:

- The Pushover notification channel will use the API Token and User Key you created from the previous step.
- It will probe [https://httpbin.org/delay/2500](https://httpbin.org/delay/2500)[,](https://www.google.com%2C/) with the method GET
- It will alert you if the response status code is not 200, or the response time is longer than two seconds

Once that’s done, run Monika with the configuration above with the command `monika -c monika.yml`

![](https://miro.medium.com/max/1400/1*M0ddqavWVjDdfMc-AfeT6Q.png)

Congratulations! You have successfully integrated Monika with Opsgenie! Note that Opsgenie integration is only available from the Monika version 1.8.0++
