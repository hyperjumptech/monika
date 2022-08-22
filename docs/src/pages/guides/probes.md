---
id: probes
title: Probes
---

Probes are the heart of the monitoring requests. Probes are made out of an array of "requests" and some controls. The control parameters determine how the probes are performed, such as repetition intervals, probe name, identification and text descriptions. Requests are either Ping, TCP or HTTP(S) requests to some location.
Monika goes through each probe object in the `monika.yml` config file, sends it out, and determines whether an alert or notification needs to be sent out.

```yaml
probes:
  - id: '1'
    name: Name of the probe
    description: Probe to check GET time
    interval: 10 # in seconds
    requests:
      - method: GET
        url: https://github.com
    alerts: []
  - id: '2'
    name: Name of the probe 2
    description: Probe to check GET health
    interval: 10 # in seconds
    requests:
      - method: GET
        url: https://github.com
    alerts: []
```

Basically probes are arranged as arrays of request objects.

## HTTP Request Anatomy

```yaml
probes:
  - id: '1'
    name: 'Example: get Time'
    description: Probe
    interval: 10 # in seconds
    requests:
      - method: POST
        url: https://mybackend.org/user/login
        timeout: 7000 # in milliseconds
        saveBody: true
        headers:
          Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhlbGxvIGZyb20gSHlwZXJqdW1wIiwiaWF0IjoxNTE2MjM5MDIyfQ.T2SbP1G39CMD4MMfkOZYGFgNIQgNkyi0sPdiFi_DfVA
        body:
          username: someusername
          password: somepassword
        alerts:
          - query: response.status != 200
            message: Status not 2xx
    incidentThreshold: 3
    recoveryThreshold: 3
    alerts:
      - query: response.status != 200
        message: HTTP response status is {{ response.status }}, expecting 200
```

Details of the field are given in the table below.

| Topic                        | Description                                                                                                                                                                                                                                                                                                                                               |
| :--------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| method                       | Http method such as GET, POST, PUT, DELETE.                                                                                                                                                                                                                                                                                                               |
| url                          | This is the url endpoint to dispatch the request to.                                                                                                                                                                                                                                                                                                      |
| timeout (optional)           | Request timeout in **milliseconds**, Default value is 10000 which corresponds to 10 seconds. If the request takes longer than `timeout`, the request will be aborted.                                                                                                                                                                                     |
| headers (optional)           | Http headers you might need for your request.                                                                                                                                                                                                                                                                                                             |
| body (optional)              | Any http body if your method requires it.                                                                                                                                                                                                                                                                                                                 |
| interval (optional)          | Number of probe's interval (in seconds). Default value is 10 seconds.                                                                                                                                                                                                                                                                                     |
| incidentThreshold (optional) | Number of times an alert should return true before Monika sends notifications. For example, when incidentThreshold is 3, Monika will only send notifications when the probed URL returns non-2xx status 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5. |
| recoveryThreshold (optional) | Number of times an alert should return false before Monika sends notifications. For example, when recoveryThreshold is 3, Monika will only send notifications when the probed URL returns status 2xx 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5.    |
| alerts                       | The condition which will trigger an alert, and the subsequent notification method to send out the alert. See below for further details on alerts and notifications.                                                                                                                                                                                       |
| saveBody (optional)          | When set to true, the response body of the request is stored in the internal database. The default is off when not defined. This is to keep the log file size small as some responses can be sizable. The setting is for each probe request.                                                                                                              |
| alerts (optional)            | See [alerts](./alerts) section for detailed information.                                                                                                                                                                                                                                                                                                  |
| ping (optional)              | (boolean), If set true then send a PING to the specified url instead.                                                                                                                                                                                                                                                                                     |

### PING Request

You can send an ICMP echo request to a specific url by enabling the `ping: true` field.
In this mode the http method is ignored and a PING echo request is sent to the specified url.

```yaml
probes:
  - id: 'ping_test'
    name: ping_test
    description: requesting icmp ping
    interval: 10 # in seconds
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

In a configuration with multiple probes, `Monika` will load the requests in the order that they are entered, one after another. However, probes may be performed out of sequence depending on their interval setting, network latency and response times. By default Monika loops through all the probe configurations in the order they are entered, but you can use the `--id` or the `--repeat` flags to specify or repeat a particular sequence. See the [cli options here](https://monika.hyperjump.tech/guides/cli-options) for more information.

In general, Monika will sleep until the next `interval` timer to repeat a probe. If no `interval` time is specified for a probe, the default value will be used. If the configured probe `interval` is shorter than the amount of time to dispatch all the requests, then `Monika` will immediately repeat after the last response and any notification alerts sent.

## Content-Type header

Currently, Monika only supports Content-Type value `application/x-www-form-urlencoded` and `application/json` with UTF-8 encoding.

## Request Body

By default, the request body will be treated as-is. If the request header's `Content-Type` is set to `application/x-www-form-urlencoded`, it will be serialized into URL-safe string in UTF-8 encoding.

## Fake Data

You can use fake data to pass through your URLs, request body, and request headers. Here is the list of available fake data:

- **alpha**: Returns a random string with the length of 8 characters. (e.g **abcdefgh**)
- **alphaNumeric**: Returns a random string with the length of 8 alphanumeric characters. (e.g **ab12efgh**)
- **countryCode**: Returns a country code (e.g **ID, MY, SG**)
- **color**: Returns a color (e.g **lime, red, green**)
- **currency**: Returns a currency (e.g **USD, IDR, JPY**)
- **email**: Returns an email (e.g **monika@hyperjump.tech**)
- **fullName**: Returns a full name (e.g **John Doe**)
- **gender**: Returns a gender (e.g **Male/Female**)
- **latitude**: Returns a latitude (e.g **-103.44**)
- **lines**: Returns a lorem ipsum lines (e.g **Lorem ipsum dolor sit amet**)
- **longitude**: Returns a longitude (e.g **95.45**)
- **number**: Returns a random number range from 1-to 1000 (e.g **720**, **480**)
- **objectId**: Returns a MongoDB ObjectID (e.g **63034695eca3670c4e083657**)
- **statusCode**: Returns a status code (e.g **200, 404, 500**)
- **timestamp**: Returns current time in a form of a UNIX timestamp (e.g **1661159139803**)
- **uuid**: Returns a UUID (e.g **d8ffd51c-88cd-453e-906e-389b145891e7**)
- **word**: Returns a word (e.g **nicely, done**)
- **words**: Returns 3 words (e.g **such fascinating energies**)

To use the fake data, all you need to do is to wrap them in the double curly brackets like the example below:

```
probes:
  - id: '6'
    name: '6'
    interval: 10
    requests:
      - url: http://github.com?timestamp={{ timestamp }}
        # This will be rendered as https://github.com?timestamp=1661159139803

  - id: '15'
    name: '15'
    interval: 10
    requests:
      - url: http://github.com/user?id={{ uuid }}
        # This will be rendered as http://github.com/user?id=d8ffd51c-88cd-453e-906e-389b145891e7
```

If you want to use it as a request body, you can use it like this:

```
probes:
  - id: '0'
    name: '0'
    interval: 10
    requests:
      - url: https://httpbin.org/post
        method: POST
        body:
          timestamp: '{{ timestamp }}'
          id: '{{ uuid }}'
          # This will be rendered as { timestamp: 1661159139803, id: d8ffd51c-88cd-453e-906e-389b145891e7 }
```

The same goes for the request headers, you can use it like this:

```
probes:
  - id: '0'
    name: '0'
    interval: 10
    requests:
      - url: https://httpbin.org/post
        method: POST
        body:
          timestamp: '{{ timestamp }}'
          id: '{{ uuid }}'
        headers:
          'X-USER-ID': '{{ uuid }}'
          # This will be rendered as { X-USER-ID: d8ffd51c-88cd-453e-906e-389b145891e7 }
```

## Postman JSON file support

> NOTE: We only support Postman collection v2.0 and v2.1 files.

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
