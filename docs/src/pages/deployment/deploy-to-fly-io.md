---
id: deploy-to-fly-io
title: Deploy to Fly.io
---

This article covers how to deploy a Monika instance to Fly.io.

1.  Go to the [Monika Github repository](https://github.com/hyperjumptech/monika) and download two files: Dockerfile.flyio and fly.toml.example

2.  Rename the `fly.toml.example` to fly.toml`.

3.  Edit the contents of the fly.toml:

    ```toml
    app = "monika" # Change the app name to the desired name

    kill_signal = "SIGINT"
    kill_timeout = 5

    [build]
    dockerfile = "Dockerfile.flyio"

    [build.args]
    PARAMS = "-v" # Change the parameters according to your needs

    [env]
    PARAMS = "-v" # Match the content of this PARAMS variable to the one in `build.args` block

    [experimental]
    auto_rollback = true
    ```

    Refer to the [Fly.io App Configuration Docs](https://fly.io/docs/reference/configuration/) to customize the example TOML even further.

4.  Install [Fly.io CLI tools](https://fly.io/docs/flyctl/installing/) (`flyctl`) in your computer

5.  a. Proceed to authenticate to Fly.io by running `flyctl auth login` in your terminal.

    b. If you haven't signed up to Fly.io yet, you can sign up by running `flyctl auth signup` in your terminal.

6.  Create a new Fly.io app by running `flyctl apps create` and enter the app name according to your `fly.toml` you have created before.

7.  Deploy Monika to your Fly.io by running `flyctl deploy`

8.  Wait until the deployment is finished, and check Monika logs from the Fly.io dashboard to confirm that your Monika instance is running.
