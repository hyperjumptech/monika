---
id: run-using-pushover-notification
title: Run using Pushover Notification
---

This tutorial will show you how to integrate Monika with Pushover to get your Monika notifications through your Pushover clients.

## Setup Pushover

To use Pushover with Monika, head to [https://pushover.net](https://pushover.net) and create an account. Then, you need to confirm your email. After that, log in to the dashboard and pay attention to the “**Your User Key**”. Save the user key to a safe place as we are going to need it later.

![](https://miro.medium.com/max/1400/1*CNvmMECn2qm2_qT5Jge7Mw.png)

Then, scroll down to the bottom of the page. Click the **Create a new Application/API Token**. Fill out the forms, and click **Create Application**. You should see your **API Token/Key.** Save the token to a safe place as we are going to need it later.

![](https://miro.medium.com/max/1400/1*ECMUAviGQlkJmLzE-e6j_A.png)

After you created the API Token, go back to the main Dashboard. Then, click the **Add Phone, Tablet, or Desktop**. For this case, use the **Pushover for Desktop**. Then, enter your Device Name and click **Register Web Browser**. You will be redirected to your created Pushover desktop client.

![](https://miro.medium.com/max/1400/1*0Ta1LgUKTRYTBU60T6AXMg.png)

Once that’s done, it’s time to configure Monika to integrate with the Pushover desktop client.

## Integrate Monika with Pushover

Now that we have our User and API Token from Pushover, it’s time to create a Monika configuration called `monika.yml`

```
notifications:
  - id: pushover-notification
    type: pushover
    data:
      token: <YOUR_PUSHOVER_API_TOKEN>
      user: <YOUR_PUSHOVER_USER_KEY>
probes:
  - id: 6a31bcff-48f1-40b0-98aa-8c7610f4f428
    name: Localhost
    description: ''
    requests:
      - url: http://localhost:8080/health
        method: GET
        headers: {}
        body: '{}'
        timeout: 0
    alerts:
      - query: response.status < 200 or response.status > 299
        message: HTTP Status is not 200
      - query: response.time > 2000
        message: Response time is more than 2000ms
```

Let’s take a look at the configuration above:

- The Pushover notification channel will use the API Token and User Key you created from the previous step.
- It will probe [http://localhost:8080/health,](https://www.google.com%2C/) with the method GET
- It will alert you if the response status code is not 200, or the response time is longer than two seconds

Once that’s done, run Monika with the configuration above with the command `monika -c monika.yml`

![](https://miro.medium.com/max/1400/0*WRJ6XIrycynPulRw.png)

Congratulations! You have successfully integrated Monika with Pushover! Note that Pushover integration is only available from the Monika version 1.8.0.
