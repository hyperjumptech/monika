---
id: examples
title: Examples
---

## Minimal Configuration

At minimum, you only need to specify the `url` you want to monitor. For example to monitor `github.com`:

```yaml
probes:
  - requests:
      - url: https://github.com
```

If you didn't define the http method, it will use the GET method by default. Please note that with this configuration, you will not get any notifications when the site github.com is down since the notification configuration is not defined.

## Enabling Notification

Probes are more useful with notifications enabled to alert when something is amiss. The following is an example configuration to get notification via e-mail when an incident occurs:

```yaml
notifications:
  - id: unique-id-smtp
    type: smtp
    data:
      recipients:
        - YOUR_EMAIL_ADDRESS_HERE
      hostname: smtp.gmail.com
      port: 587
      username: YOUR_GMAIL_ACCOUNT
      password: YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD
probes:
  - id: '1'
    name: Monika Landing Page
    description: Landing page of awesome Monika
    interval: 10 # in seconds
    requests:
      - url: https://hyperjumptech.github.io/monika
        timeout: 7000 # in milliseconds
    alerts:
      - assertion: response.status < 200 or response.status > 299
        message: Target is not healthy. It has not been returning status code 2xx.
      - assertion: response.time > 2000 # in milliseconds
        message:
          Target is not healthy. The response time has been greater than 2000
          ms.
```

Using the above configuration, Monika will check the landing page every 10 seconds and will send a notification by email when the landing page is down 5 times in a row. For more information about available notification channels, refer to [Notifications](https://hyperjumptech.github.io/monika/guides/notifications).

## HTML Form Submission Example

You can also send POST requests using Monika. The following is an example of sending a POST request to simulate HTML form submission.

```yaml
probes:
  - id: '1'
    name: HTML form submission
    description: simulate html form submission
    interval: 10 # in seconds
    requests:
      - method: POST
        url: http://www.example.com/login.php
        timeout: 7000 # in milliseconds
        headers:
          Content-Type: application/x-www-form-urlencoded
        body:
          username: someusername
          password: somepassword
```

Using the configuration above, Monika will send a POST request to `http://www.example.com/login.php` with the defined request's body.

## Multiple requests

Monika supports sending multiple requests **one after another** in a single probe. Below is one such configuration:

```yaml
probes:
  - id: '1'
    name: Simulate form submit
    description: simulate html form submission
    interval: 15 # in seconds
    requests:
      - method: GET
        url: https://github.com/
        timeout: 7000 # in milliseconds
        saveBody: false
      - method: GET
        url: https://github.com/hyperjumptech
        timeout: 7000 # in milliseconds
        saveBody: true
    alerts:
      - assertion: response.status > 299
        message: Target is not healthy. It has not been returning status code 2xx.
      - assertion: response.time > 2000 # in milliseconds
        message:
          Target is not healthy. The response time has been greater than 2000
          ms.
```

In the configuration above, Monika will first check `https://github.com/` then `https://github.com/hyperjumptech`. If the status code of `https://github.com/` is not 2xx (e.g., 200, 201), Monika **will not** check `https://github.com/hyperjumptech`.

If there is a case where executing a GET request to `https://github.com` triggers an alert, the next request will not be executed.

## Requests Chaining

Monika supports request chaining, which enables you to do multiple requests and the ability to use past responses from earlier requests. For example, after executing a GET request to a certain API, the next request could use the previous request(s) response into their path/assertion parameters or headers.

Here is an example on how you could get previous request(s) response data into your next request:

```shell
{{ responses.[0].status }} ==> Get status code from first request response
{{ responses.[1].body.token }} ==> Get token from second request response
{{ responses.[2].headers.SetCookie[0] }} ==> Get first cookie from third request response
```

In the example above, `responses.[0]` refers to the response from the first request in the probe, `responses.[1]` refers to the response from the second request in the probe, and so on. Please note that you can only use the response from previous requests in the same probe.

Please refer to [Probe Response Anatomy](https://hyperjumptech.github.io/monika/guides/probes#probe-response-anatomy) in order to know which value could be used from the response body for the next request(s).

In the sections below, you can find several examples of configuration files which contain chaining requests.

### Pass Response Data as Path/Query Parameters

Here is an example of using previous request's response in the path/assertion parameters:

```yaml
probes:
  - id: '1'
    name: Simulate form submit
    description: simulate html form submission
    interval: 15 # in seconds
    requests:
      - method: GET
        url: https://reqres.in/api/users
        timeout: 7000 # in milliseconds
      - method: GET
        url: https://reqres.in/api/users/{{ responses.[0].body.data.[0].id }}
        timeout: 7000 # in milliseconds
    alerts:
      - assertion: response.status > 299
        message: Target is not healthy. It has not been returning status code 2xx.
      - assertion: response.time > 2000 # in milliseconds
        message:
          Target is not healthy. The response time has been greater than 2000
          ms.
```

In the configuration above, the first request will fetch all users from `https://reqres.in/api/users`. Then in the second request, Monika will fetch the details of the first user from the first request. If there are no triggered alerts, the response returned from the first request is ready to be used by the second request using values from `{{ responses.[0].body }}`.

Let's say the response from fetching all users in JSON format is as follows:

```json
{
  "page": 2,
  "per_page": 6,
  "total": 12,
  "total_pages": 2,
  "data": [
    {
        "id": 7,
        "email": "michael.lawson@reqres.in",
        "first_name": "Michael",
        "last_name": "Lawson",
        "avatar": "https://reqres.in/img/faces/7-image.jpg"
    },
    ...
  ]
}
```

To use the user ID of the first user in the second request, we define the url of the second request as `{{ responses.[0].body.data.[0].id }}`.

### Pass Response Data as Headers value

Here is an example of using previous request's response in the headers:

```yaml
probes:
  - id: '1'
    name: Simulate form submit
    description: simulate html form submission
    interval: 15 # in seconds
    requests:
      - method: POST
        url: https://reqres.in/api/login
        timeout: 7000 # in milliseconds
        body:
          email: eve.holt@reqres.in
          password: cityslicka
      - method: POST
        url: https://reqres.in/api/users/
        timeout: 7000 # in milliseconds
        body:
          name: morpheus
          job: leader
        headers:
          Authorization: Bearer {{ responses.[0].body.token }}
    alerts:
      - assertion: response.status > 299
        message: Target is not healthy. It has not been returning status code 2xx.
      - assertion: response.time > 2000 # in milliseconds
        message:
          Target is not healthy. The response time has been greater than 2000
          ms.
```

Using the above configuration, Monika will perform a login request in the first request, then use the returned token in the Authorization header of the second request.

### Pass Response Data to Request Body

Continuing with the examples from www.reqres.in above, say we would like to use the previous GET request to perform a POST /login. If the data from the initial request is something like below:

```json
{
  "data":
    {
      "id": 1,
      "email": "george.bluth@reqres.in",
      "first_name": "George",
      "last_name": "Bluth",
      "avatar": "https://reqres.in/img/faces/1-image.jpg"
    },
  ....
}
```

Then you can use the user's email in the login request body as follows:

```yaml
probes:
  - id: probe-01
    name: 'body from response'
    interval: 15 # in seconds

    requests:
      - url: https://reqres.in/api/users/1
        method: GET
        timeout: 5000 # in milliseconds
        saveBody: false
        headers:
          Content-Type: application/json; charset=utf-8

      - url: https://reqres.in/api/login
        method: POST
        timeout: 1000 # in milliseconds
        headers:
          Content-Type: application/json; charset=utf-8
        body:
          email: '{{ responses.[0].body.data.email }}'
          password: password

        alerts:
          - assertion: response.status != 200
            message: Http Response status code is not 200!
notifications:
  - id: unique-id-desktop
    type: desktop
```

Note: Please do not forget the single quotes before and after the opening and closing double braces to explicitly indicate a string value. YAML parsers will generate warnings without it.

### Errors in Request Chaining

In a request chaining mode, if one request fails, Monika **does not** continue with the next request in the probe. The reasoning is that, if an earlier request, say a GET /token fails, it would be pointless to continue and fetch /userdata.

If you want to continue the next request even when the first one fails, we recommend putting your requests in multiple probes, something like this:

```yaml
probes:
  - id: get-user
    name: 'get-user'
    description: login and check user app data
    interval: 30
    requests:
      - url: https://example.com/token
        body: {user: 'xxxx', password: 'yyyy'}
        method: POST
      - url: https://example.com/userdata
        method: GET
        headers:
          Authorization: Bearer {{ responses.[0].body.accessToken }}

  - id: get-mail
    name: 'get-mail'
    description: fetching user emails
    interval: 30
    requests:
      - url: https://example.com/token
        body: {user: 'xxxx', password: 'yyyy'}
        method: POST
        timeout: 10000
        method: POST
      - url: https://example.com/usermail
        method: GET
        headers:
          Authorization: Bearer {{ responses.[0].body.accessToken }}

```

In the example above, the get-email will run even if get-user has failed.
