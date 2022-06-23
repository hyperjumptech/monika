---
id: probes
title: Probes
---

Probes are the heart of the monitoring requests. Probes are arrays of request objects defined in the config file `monika.yml` like so.

```yaml
probes:
  - id: '1'
    name: Name of the probe
    description: Probe to check GET time
    interval: 10
    requests:
      - {}
    alerts: []
  - id: '2'
    name: Name of the probe 2
    description: Probe to check GET health
    interval: 10
    requests:
      - {}
    alerts: []
```

Monika goes through each probe object, sends it out, and determines whether an alert or notification needs to be sent out.

## Probe Request Anatomy

An actual probe request may be something like below.

```yaml
  probes: [
    id: '1'
    name: 'Example: get Time'
    description: Probe
    interval: 10
    requests:
    - method: POST
      url: https://mybackend.org/user/login
      timeout: 7000
      saveBody: true
      headers:
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhlbGxvIGZyb20gSHlwZXJqdW1wIiwiaWF0IjoxNTE2MjM5MDIyfQ.T2SbP1G39CMD4MMfkOZYGFgNIQgNkyi0sPdiFi_DfVA
      body:
        username: someusername
        password: somepassword
      alerts: ARRAY-HERE
    incidentThreshold: 3
    recoveryThreshold: 3
    alerts:
    - query: response.status != 200
      message: HTTP response status is {{ response.status }}, expecting 200
  ]
```

Details of the field are given in the table below.

| Topic                        | Description                                                                                                                                                                                                                                                                                                                                               |
| :--------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| method                       | Http method such as GET, POST, PUT, DELETE.                                                                                                                                                                                                                                                                                                               |
| url                          | This is the url endpoint to dispatch the request to.                                                                                                                                                                                                                                                                                                      |
| timeout                      | Request timeout, after which time, `Monika` will assume timeout.                                                                                                                                                                                                                                                                                          |
| headers                      | Http headers you might need for your request.                                                                                                                                                                                                                                                                                                             |
| body                         | Any http body if your method requires it.                                                                                                                                                                                                                                                                                                                 |
| interval (optional)          | Number of probe's interval (in seconds). Default value is 10 seconds.                                                                                                                                                                                                                                                                                     |
| incidentThreshold (optional) | Number of times an alert should return true before Monika sends notifications. For example, when incidentThreshold is 3, Monika will only send notifications when the probed URL returns non-2xx status 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5. |
| recoveryThreshold (optional) | Number of times an alert should return false before Monika sends notifications. For example, when recoveryThreshold is 3, Monika will only send notifications when the probed URL returns status 2xx 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5.    |
| alerts                       | The condition which will trigger an alert, and the subsequent notification method to send out the alert. See below for further details on alerts and notifications.                                                                                                                                                                                       |
| saveBody (optional)          | When set to true, the response body of the request is stored in the internal database. The default is off when not defined. This is to keep the log file size small as some responses can be sizable. The setting is for each probe request.                                                                                                              |
| alerts (optional)            | See [alerts](./alerts) section for detailed information.                                                                                                                                                                                                                                                                                                  |
| ping (optional)              | (boolean), If set true then send a PING to the specified url instead.                                                                                                                                                                                                                                                                                     |

### PING

You can send an ICMP echo request to a specific url by enabling the `ping: true` field.
In this mode the http method is ignored and a PING echo request is sent to the specified url.

```yaml
probes:
  - id: 'ping_test'
    name: ping_test
    description: requesting icmp ping
    interval: 10
    requests:
      - url: http://google.com
        ping: true
```

### TCP

You can send a TCP request to a specific `host` and `port` with `data` by using the `socket` field.

```yaml
probes:
  - id: 'tcp-example'
    socket:
      host: localhost
      port: 3333
      data: Hello from Monika
```

## Probe Response Anatomy

The default shape of a response when Monika has successfully fetched a request is as the following.

```yaml
status: 200
statusText: OK
headers:
  test-header: ...
config:
  url: https://reqres.in/api/users
  method: GET
  data:
    mydata: value
  headers:
    Accept: application/json, text/plain, */*
    User-Agent: axios/0.21.1
data: ...
```

Details of the fields are shown in the table below.

| Topic      | Description                                                             |
| :--------- | ----------------------------------------------------------------------- |
| status     | HTTP Status Code (e.g 200, 403, 500)                                    |
| statusText | HTTP Status Code Explanation (e.g OK, Forbidden, Internal Server Error) |
| config     | Request configuration (e.g URL, Method, Data, Headers, Body, etc.)      |
| headers    | Response headers from the fetched request (e.g SetCookie, ETag, etc.).  |
| data       | Response payload from the fetched request (e.g token, results, data).   |

Probe response data could be used for [Request Chaining](https://hyperjumptech.github.io/monika/guides/examples#requests-chaining).

## Execution order

In a configuration with multiple probes, `Monika` will load the requests in the order that they are entered, one after another. However, probes may be performed out of sequence depending on their interval setting, network latency and response times. By default Monika loops through all the probe configurations in the order they are entered, but you can use the `--id` or the `--repeat` flags to modify the sequence. See the [cli options here](https://monika.hyperjump.tech/guides/cli-options) for more information.

Monika will sleep until the next `interval` timer to repeat a probe. If no `interval` time is specified for a probe, the default value will be used. If the probe `interval` is shorter than the amount of time to dispatch all the requests, then `Monika` will immediately repeat after the last response and any notification alerts sent.

## Content-Type header

Currently, Monika only supports Content-Type value `application/x-www-form-urlencoded` and `application/json` with UTF-8 encoding.

## Request Body

By default, the request body will be treated as-is. If the request header's `Content-Type` is set to `application/x-www-form-urlencoded`, it will be serialized into URL-safe string in UTF-8 encoding.

## Postman JSON file support

To run monika using a [Postman](https://www.postman.com/) JSON file, use `--postman` flag as follows:

```bash
monika --postman <path_to_postman_file>
```

## Insomnia file support

Monika supports [Insomnia](https://insomnia.rest/) collection file in **version 4** format. Both `json` and `yaml` files are supported.
To run Monika using an Insomnia collection file, use `--insomnia` flag as follows:

```bash
monika --insomnia <path_to_insomnia_file>
```

## HAR file support

HAR [HTTP-Archive](<https://en.wikipedia.org/wiki/HAR_(file_format)>) format was created by the Web Performance Working Group and has become the standard in browser archive request data definition. To run monika using a HAR file, use `--har` flag as follows:

```bash
monika --har <path_to_HAR_file>
```

## Further reading

1. [Alerts](./alerts)
2. [Notifications](./notifications)
