---
id: deploy-to-fly-io
title: Deploy to Fly.io
---

[Fly.io](https://fly.io) is a Platform-as-a-service for running full-stack apps and databases close to your users. Using Fly.io, you can deploy different kinds of apps such as Node, Go, Laravel, Python, and Dockerfile-based applications.

In this example, we will show you how to run Monika in Fly.io using Dockerfile deployments. First, we need to install Fly CLI.

- If you are using **macOS**, you can install it via [Homebrew](https://brew.sh/) by running `brew install flyctl` in your terminal. If you prefer the CURL way, run the command `curl -L https://fly.io/install.sh | sh` in your terminal.
- If you are using **Linux**, you can run `curl -L https://fly.io/install.sh | sh` in your terminal
- If you are using **Windows**, you can run the Powershell install script: `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`

After installing the Fly CLI, the next step is to log in to Fly.io. You might need to sign up first by running `fly auth signup` in your terminal to create an account. Otherwise, you can run `fly auth login` in your terminal.

Both commands will open a browser so make sure you are running in a GUI environment. Once being authenticated, you can proceed to the next step.

![](https://miro.medium.com/max/1400/1*fHkgGmclkZobjGqy88axaQ.png)

Create a folder called `flyio-monika` in your local machine. Then, navigate to the `flyio-monika` and create two files: **Dockerfile** and **monika.yml**.

Dockerfile:

```Dockerfile
FROM hyperjump/monika:latest

WORKDIR /usr

COPY monika.yml .

CMD ["monika", "-c", "monika.yml"]
```

monika.yml:

```yml
probes:
  - id: example-com
    requests:
      - url: https://reqres.in
    alerts:
      - assertion: response.time > 1000
        message: Website is slow
```

- The `Dockerfile` file will pull the latest `hyperjump/monika` image from the Docker Hub and will be running the `monika.yml` file.
- The `monika.yml` file is the Monika configuration file.

This Monika configuration sets up a probe for the website "reqres.in". The probe sends a request to the website's URL and triggers an alert if the response time exceeds 1000 milliseconds. An incident will be triggered if the alert condition is met, and a recovery notification will be sent when the alert condition is not met.

Save these two files inside the `flyio-monika` directory. Once that’s done, you can run `fly launch` in the `flyio-monika` directory. You will be prompted to enter a unique name and select a location for the app.

![](https://miro.medium.com/max/1400/1*BgQskxfa17Zdwow7MzyxLw.png)

You can skip the PostgreSQL database setup, and proceed to deploy now. It will automatically create a file called `fly.toml` and it may take up to five minutes to successfully deploy the app. Once that’s done, you can go to your Fly.io dashboard to see that Monika is now running:

![](https://miro.medium.com/max/1400/1*oz0pvdYGOAxAc1mgKJFCvA.png)

We want to add more regions to deploy our Monika instance. So, we need to add a new region to the region pool. You can simply do so by running `fly regions add [...regions]` in your terminal. You can see all the available regions on the [Fly.io documentation page](https://fly.io/docs/reference/regions/).

![](https://miro.medium.com/max/892/1*gT7wQkPU81U-bn7qZlT4gg.png)

Once you add the Hong Kong region, it’s time to scale the Monika instance by running `fly scale 2 --max-per-region 1` in your terminal. Then, check if the scaling works by running `fly scale show`

![](https://miro.medium.com/max/1400/1*mfV5RfizFvDpoVWthO0nhg.png)

Alternatively, you can go to the Fly.io dashboard and navigate to the **Monitoring** menu. You will see that your app is now running in two regions.

![](https://miro.medium.com/max/1400/1*7CL8DKXtuT77bvFuh_wNRg.png)
