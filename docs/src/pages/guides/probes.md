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
          - assertion: response.status != 200
            message: Status not 2xx
        allowUnauthorized: true
    incidentThreshold: 3
    alerts:
      - assertion: response.status != 200
        message: HTTP response status is {{ response.status }}, expecting 200
```

Details of the field are given in the table below.

| Topic                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :--------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| method (optional)            | Http method such as GET, POST, PUT, DELETE.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| url (required)               | This is the url endpoint to dispatch the request to.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| timeout (optional)           | Request timeout in **milliseconds**, Default value is 10000 which corresponds to 10 seconds. If the request takes longer than `timeout`, the request will be aborted.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| headers (optional)           | Http headers you might need for your request.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| body (optional)              | Any http body if your method requires it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| interval (optional)          | Number of probe's interval (in seconds). Default value is 10 seconds.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| incidentThreshold (optional) | Number of times an alert should return true before Monika sends notifications. For example, when incidentThreshold is 3, Monika will only send incident notifications when the probed URL returns non-2xx status 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5. However, the actual number of retries will be the the greatest number between `incidentThreshold` and `recoveryThreshold`. So if you want to have 3 retries, you need to set both `incidentThreshold` and `recoveryThreshold`. |
| recoveryThreshold (optional) | Number of retries before Monika sends recovery notifications. For example, when recoveryThreshold is 3 and when previously a probe is marked as incident, Monika will only send recovery notification when the probing succeeds 3 times in a row. Default value is 5. However, the actual number of retries will be the the greatest number between `incidentThreshold` and `recoveryThreshold`. So if you want to have 3 retries, you need to set both `incidentThreshold` and `recoveryThreshold`.                                                                                              |
| saveBody (optional)          | When set to true, the response body of the request is stored in the internal database. The default is off when not defined. This is to keep the log file size small as some responses can be sizable. The setting is for each probe request.                                                                                                                                                                                                                                                                                                                                                      |
| alerts (optional)            | The condition which will trigger an alert, and the subsequent notification method to send out the alert. See below for further details on alerts and notifications. See [alerts](./alerts) section for detailed information.                                                                                                                                                                                                                                                                                                                                                                      |
| ping (optional)              | (boolean), If set true then send a PING to the specified url instead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| allowUnauthorized (optional) | (boolean), If set to true, will make https agent to not check for ssl certificate validity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Request Body

By default, the request body will be treated as-is. If the request header's `Content-Type` is set to `application/x-www-form-urlencoded`, it will be serialized into URL-safe string in UTF-8 encoding. Body payloads will vary on the specific probes being requested. For HTTP requests, the body and headers are defined like this:

```yaml
requests:
  - method: POST
    url: https://example.com/auth/login
    timeout: 7000 # in milliseconds
    saveBody: true
    headers:
      Authorization: Bearer __your_token_here__
    body:
      username: someusername
      password: somepassword
```

You can use responses from previous http requests in the body of your next request, see how [requests chaining](https://hyperjumptech.github.io/monika/guides/examples#requests-chaining) work in the sections further below. It is also possible to automatically generate data in your payload. See the fake data payload section [here](https://hyperjumptech.github.io/monika/guides/probes#fake-data).

## Content-Type header

Currently, Monika only supports Content-Type value `application/x-www-form-urlencoded` and `application/json` with UTF-8 encoding.

### Mariadb or MySQL Probes

To monitor the connectivity and the health of your MariaDB database, you can use the following monika configuration:

```yaml
probes:
  - id: 'id-mariadb'
    name: maria_probe
    description: testing maria db
    mariadb:
      - host: 172.11.0.1
        port: 3306
        database: mydatabase
        username: myuser
        password: password
```

You can also use the `mysql` keyword for your Mysql database like below. The `mariadb` and `mysql` probe types are interchagnable.

```yaml
probes:
  - id: 'id-mariadb'
    name: maria_probe
    description: testing maria db
    mysql:
      - host: 172.11.0.1
        port: 3306
        database: mydatabase
        username: myuser
        password: password
```

### MongoDB Request

You can check if your MongoDB instance is running and accessible by adding a probe with `mongo` configuration as follows.

```yaml
probes:
  - id: 'mongo-test'
    name: MongoDB health check
    interval: 30 # in seconds
    mongo:
      - host: localhost
        port: 27017
```

If your MongoDB configuration uses authentication settings, you can pass the `username` and `password` field like below:

```yaml
probes:
  - id: 'mongo-test'
    name: MongoDB health check
    interval: 30 # in seconds
    mongo:
      - host: localhost
        port: 28017
        username: mongoadmin
        password: secret
```

If you have a connection URI, you can pass it to the `uri` field like below:

```yaml
- id: 'mongo-test'
  name: MongoDB health check
  interval: 30 # in seconds
  mongo:
    - uri: mongodb://mongoadmin:secret@localhost:28017
```

### PING Request

You can send an ICMP echo request to a specific url by specifying a `ping` probe.
In this mode the a PING echo request is sent to the specified url.

```yaml
probes:
  - id: 'ping_test'
    name: ping_test
    description: requesting icmp ping
    interval: 10 # in seconds
    ping:
      - uri: http://google.com
```

### Postgres Request

Monika provides a way to check your postgres database's health with a 'postgres' type probe. You can define the `host`, `port` and `user` and `password` like this:

```yaml
probes:
  - id: 'postgres-01'
    name: database health
    description: ensure db health
    interval: 30 # in seconds
    postgres:
      - host: 172.15.0.1
        port: 5432
        user: user
        password: password
        database: mydb
```

Or alternatively you may provide a postgresql connection URI like below:

```yaml
probes:
  - id: 'postgres-01'
    name: database health
    description: ensure db health
    interval: 30 # in seconds
    postgres:
      - uri: postgresql://user:password@172.15.0.1:5432/mydb
```

If uri is provided along with host, port, user and password fields, connection will be derived from the uri string and the other fields will be ignored.  
Please see the [postgres connection specification](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING) for details on uri formatting.

### Redis Request

You can check if your redis instance is running and accessible by adding a probe with `redis` configuration as follows.

```yaml
probes:
  - id: 'redis-test'
    name: redis health
    description: requesting redis PONG
    interval: 30 # in seconds
    redis:
      - host: 172.15.0.2
        port: 6379
```

If your redis configuration include `AUTH` settings, you might get some error like `Error: NOAUTH Authentication required.`
You can pass a `password` field like below:

```yaml
probes:
  - id: 'redis-ping'
    name: redis check with password
    description: requesting redis PONG
    interval: 30 # in seconds
    redis:
      - host: 172.15.0.2
        port: 6379
        password: mypassword
```

You may also add a `username` property as needed. An alternative format that you can provide is a uri connection string for redis with the following specification `redis://[[username][:password]@][host][:port][/db-number]`:

```yaml
probes:
  - id: 'redis-ping'
    name: redis check with password
    description: requesting redis PONG
    interval: 30 # in seconds
    redis:
      - uri: 'redis://alice:mypassword@172.15.0.2:6379'
```

See the full [redis client configurations here](https://github.com/redis/node-redis).

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

## Custom HTTP Responses

To make it easier to troubleshoot HTTP requests, we have mapped low-level errors returned by the HTTP library to numbers between 0 and 99. These custom errors are returned as the HTTP status code and can be used to trigger alerts in the same way as regular HTTP status codes.

| Code | Error                                                             |
| :--- | ----------------------------------------------------------------- |
| 0    | Connection not found                                              |
| 1    | Connection reset                                                  |
| 2    | Connection refused                                                |
| 3    | Too many redirects                                                |
| 4    | Bad option value                                                  |
| 5    | Bad option                                                        |
| 6    | Timed out                                                         |
| 7    | Network error                                                     |
| 8    | Deprecated                                                        |
| 9    | Bad response                                                      |
| 11   | Bad request                                                       |
| 12   | Canceled                                                          |
| 13   | Not Supported                                                     |
| 14   | Invalid URL                                                       |
| 18   | Header / response size limit exceeded                             |
| 19   | HTTP status code returns >= 400                                   |
| 20   | Invalid HTTP arguments                                            |
| 21   | Unexpected HTTP response to handle                                |
| 22   | Connection closed unexpectedly                                    |
| 23   | Unsupported HTTP functionality                                    |
| 24   | Request / response size mismatch with Content-Length header value |
| 25   | Missing HTTP client pool                                          |
| 26   | Expected error, exact reason is shown on runtime                  |
| 99   | Others                                                            |
| 599  | Connection aborted                                                |

## Execution order

In a configuration with multiple probes, `Monika` will load the requests in the order that they are entered, one after another. However, probes may be performed out of sequence depending on their interval setting, network latency and response times. By default Monika loops through all the probe configurations in the order they are entered, but you can use the `--id` or the `--repeat` flags to specify or repeat a particular sequence. See the [cli options here](https://monika.hyperjump.tech/guides/cli-options) for more information.

In general, Monika will sleep until the next `interval` timer to repeat a probe. If no `interval` time is specified for a probe, the default value will be used. If the configured probe `interval` is shorter than the amount of time to dispatch all the requests, then `Monika` will immediately repeat after the last response and any notification alerts sent.

## Fake Data

You can use fake data to pass through your URLs, request body, and request headers. Here is the list of available fake data:

| Expression                    | Description                                                                                                                | Examples                                                                                                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{ alpha <count> }}`         | returns random string with length `count` which contains only alphabetical characters. The default value for `count` is 8. | `{{ alpha }}` returns `abcdefgh`<br/>`{{ alpha 3 }}` returns `abcd`                                                                                                              |
| `{{ alphaNumeric <count> }}`  | returns random string with length `count` which contains alphabets and digits. The default value for `count` is 8.         | `{{ alphaNumeric }}` returns `ab12ef34`<br/>`{{ alphaNumeric 4 }}` returns `ab12`                                                                                                |
| `{{ countryCode }}`           | returns a random country code.                                                                                             | `{{ countryCode }}` returns `US`                                                                                                                                                 |
| `{{ color }}`                 | returns a random color string.                                                                                             | `{{ color }}` returns `lime` or `green`                                                                                                                                          |
| `{{ currency }}`              | returns a random currency code.                                                                                            | `{{ currency }}` returns `USD`                                                                                                                                                   |
| `{{ email }}`                 | returns a random email address.                                                                                            | `{{ email }}` returns `monika@hyperjump.tech`                                                                                                                                    |
| `{{ fullName }}`              | returns a random full name.                                                                                                | `{{ fullName }}` returns `John Doe`                                                                                                                                              |
| `{{ gender <binary> }}`       | returns a random gender. The default value for `binary` is `true`.                                                         | `{{ gender }}` returns `Male`<br/>`{{ gender false }}` returns `Trans*Man`                                                                                                       |
| `{{ isodate }}`               | returns the date of the request sending in ISO format.                                                                     | `{{ isodate }}` returns `2022-08-24T04:36:46.019Z`                                                                                                                               |
| `{{ latitude <min> <max> }}`  | returns a random latitude between `min` and `max` value. The default value for `min` and `max` are `-90` and `90`.         | `{{ latitude }}` returns `-30.9501`<br/>`{{ latitude 0 30 }}` returns `3.9521`                                                                                                   |
| `{{ lines <lineCount> }}`     | return `lineCount` number of lines of "Lorem ipsum" strings.                                                               | `{{ lines }}` returns `Lorem ipsum dolor sit amet`<br/>`{{ lines 2 }}` returns `Commodi non ex vol uptatibus quibusdam nisi aliquam dolor nihil. Eos maiore s enim praesentium.` |
| `{{ longitude <min> <max> }}` | returns a random longitude between `min` and `max` value. The default value for `min` and `max` are `-180` and `180`.      | `{{ longitude }}` returns `-30.9501`<br/>`{{ longitude 0 30 }}` returns `3.9521`                                                                                                 |
| `{{ number <min> <max> }}`    | returns a random integer number between `min` and `max`. The default value for `min` and `max` are `0` and `1000`.         | `{{ number }}` returns `720`<br/>`{{ number 0 500 }}` returns `480`                                                                                                              |
| `{{ objectId }}`              | returns a random MongoDB ObjectID.                                                                                         | `{{ objectId }}` returns `63034695eca3670c4e083657`                                                                                                                              |
| `{{ statusCode }}`            | returns a random HTTP status code.                                                                                         | `{{ statusCode }}` returns `200`                                                                                                                                                 |
| `{{ timestamp }}`             | returns current time in a form of a UNIX timestamp.                                                                        | `{{ timestamp }}` returns `1661159139803`                                                                                                                                        |
| `{{ uuid }}`                  | returns a random UUID.                                                                                                     | `{{ uuid }}` returns `d8ffd51c-88cd-453e-906e-389b145891e7`                                                                                                                      |
| `{{ word }}`                  | returns a random English word.                                                                                             | `{{ word }}` returns `nicely`                                                                                                                                                    |
| `{{ words <count> }}`         | returns `count` number of random English words. The default value for `words` is `3`.                                      | `{{ words }}` returns `such fascinating energies`                                                                                                                                |

To use the fake data, all you need to do is to wrap them in the double curly brackets like the example below:

```yaml
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

```yaml
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

```yaml
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
