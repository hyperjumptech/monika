# Probes

Probes are the heart of the monitoring requests. Probes are arrays of request objects defined in the config file `config.json` like so.

```json
  "probes": [
    {
      "id": "1",
      "name": "Name of the probe",
      "description": "Probe to check GET time",
      "interval": 10,
      "requests": [{ }],
      "alerts": []
    },
    {
      "id": "2",
      "name": "Name of the probe 2",
      "description": "Probe to check GET health",
      "interval": 10,
      "requests": [{ }],
      "alerts": []
    }
  ]
```

Monika goes through each probe object, sends it out, and determines whether an alert or notification need to be sent out.

## Request Anatomy

An actual probe request may be something like below.

```json
  "probes": [
    {
      "id": "1",
      "name": "Example: get Time",
      "description": "Probe",
      "interval": 10,
      "requests": [{
        "method": "POST",
        "url": "https://mybackend.org/user/login",
        "timeout": 7000,
        "headers": {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhlbGxvIGZyb20gSHlwZXJqdW1wIiwiaWF0IjoxNTE2MjM5MDIyfQ.T2SbP1G39CMD4MMfkOZYGFgNIQgNkyi0sPdiFi_DfVA"
        },
        "body": {
          "username": "someusername",
          "password": "somepassword"
        }
      }],
      "incidentThreshold": 3,
      "recoveryThreshold": 3,
      "alerts": ["status-not-2xx", "response-time-greater-than-200-ms"]
    },
  ]
```

Details of the field are give in the table below.

| Topic                        | Description                                                                                                                                                                                                                                                                                                                                               |
| :--------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| method                       | Http method such as GET, POST, PUT, DELETE                                                                                                                                                                                                                                                                                                                |
| url                          | This is the url endpoint to dispatch the request to                                                                                                                                                                                                                                                                                                       |
| timeout                      | Request timeout, after which time, `Monika`will assume timeout                                                                                                                                                                                                                                                                                            |
| headers                      | Your http header                                                                                                                                                                                                                                                                                                                                          |
| body                         | Any http body if your method requires it                                                                                                                                                                                                                                                                                                                  |
| interval (optional)          | Number of probe's interval (in seconds). Default value is 10 seconds.                                                                                                                                                                                                                                                                                     |
| incidentThreshold (optional) | Number of times an alert should return true before Monika sends notifications. For example, when incidentThreshold is 3, Monika will only send notifications when the probed URL returns non-2xx status 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5. |
| recoveryThreshold (optional) | Number of times an alert should return false before Monika sends notifications. For example, when recoveryThreshold is 3, Monika will only send notifications when the probed URL returns status 2xx 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5.    |
| alerts                       | The condition which will trigger an alert, and the subsequent notification method to send out the alert. See below for further details on alerts and notifications.                                                                                                                                                                                       |

### HTML-form-submission Example

Here is probes example with POST request to simulate HTML form submission

```json
  "probes": [
    {
      "id": "1",
      "name": "HTML form submission",
      "description": "simulate html form submission",
      "interval": 10,
      "requests": [{
        "method": "POST",
        "url": "http://www.foo.com/login.php",
        "timeout": 7000,
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": {
          "username": "someusername",
          "password": "somepassword"
        }
      }],
      "incidentThreshold": 3,
      "recoveryThreshold": 3,
      "alerts": ["status-not-2xx", "response-time-greater-than-200-ms"]
    },
  ]
```

### Multiple request

Here is an example configuration with multiple requests:

```json
  "probes": [
    {
      "id": "1",
      "name": "Probing Github",
      "description": "simulate html form submission",
      "interval": 10,
      "requests": [{
        "method": "GET",
        "url": "https://github.com/",
        "timeout": 7000,
      },{
        "method": "GET",
        "url": "https://github.com/hyperjumptech",
        "timeout": 7000,
      }],
      "incidentThreshold": 3,
      "recoveryThreshold": 3,
      "alerts": ["status-not-2xx", "response-time-greater-than-200-ms"]
    },
  ]
```

In the configuration above, "Probing Github" probe will execute a GET request to `https://github.com`. If there are no triggered alerts such as `status-not-2xx` or `response-time-greater-than-200-ms`, it will execute a GET request to `https://github.com/hyperjumptech`.

If there is a case where executing GET request to `https://github.com` triggered an alert, the next request will not be executed.

### Chaining Request

Monika supports chaining request, which enables you to use previous request(s) response. For example, after executing a GET request to certain API, the next request could use the previous request(s) response into their path/query parameters.

Here is an example configuration of chaining requests:

```json
  "probes": [
    {
      "id": "1",
      "name": "Probing Github",
      "description": "simulate html form submission",
      "interval": 10,
      "requests": [{
        "method": "GET",
        "url": "https://reqres.in/api/users",
        "timeout": 7000,
      },{
        "method": "GET",
        "url": "https://reqres.in/api/users/{{ responses.[0].data.data.[0].id }}",
        "timeout": 7000,
      },{
        "method": "GET",
        "url": "https://reqres.in/api/users/{{ responses.[0].data.data.[1].id }}",
        "timeout": 7000,
      }],
      "incidentThreshold": 3,
      "recoveryThreshold": 3,
      "alerts": ["status-not-2xx", "response-time-greater-than-2000-ms"]
    },
  ]
```

In the configuration above, the process is explained below:

- First request should fetch a list of users.
- If there are no alerts triggered, in the next request, it will fetch the first user by ID that has been fetched from the first request response.
- If there are no alerts triggered, in the next request, it will fetch the second user by ID that has been fetched from the first request response.

#### Response Anatomy

Monika uses [Axios](https://github.com/axios/axios) to do requests, so the response body is similar just like when you're using Axios. An actual response from a request may be something like below:

```json
{
  "status": 200,
  "statusText": "OK",
  "headers": { ... },
  "config": {
    "url": "https://reqres.in/api/users",
    "method": "GET",
    ...
  },
  "headers": { ... },
  "request": { ... },
  "data": { ... }
}
```

## Execution order

In a configuration with multiple probes, `Monika` will perform the requests in sequence in the order that they are entered, one after another.

On completion, `Monika` will sleep until the next interval to start again. At the top of the `config.json` file there is an `interval` setting. The execution will be restarted after every `interval`. If interval is shorter than the amount of time to dispatch all the requests, then `Monika` will immediately repeat after the last probe response and any notification alerts sent.

## Further reading

1. [Alerts](./alerts)
2. [Notifications](./notifications)
