# Probes

Probes are the heart of the monitoring requests. Probes are arrays of request objects defined in the config file `config.json` like so.

```json
  "probes": [
    {
      "id": "1",
      "name": "Name of the probe",
      "description": "Probe to check GET time",
      "request": { },
      "alerts": []
    },
    {
      "id": "2",
      "name": "Name of the probe 2",
      "description": "Probe to check GET health",
      "request": { },
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
      "request": {
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
      },
      "alerts": ["status-not-2xx", "response-time-greater-than-200-ms"]
    },
  ]
```

Details of the field are give in the table below.

| Topic   | Description                                                    |
| :------ | -------------------------------------------------------------- |
| method  | Http method such as GET, POST, PUT, DELETE                     |
| url     | This is the url endpoint to dispatch the request to            |
| timeout | Request timeout, after which time, `Monika`will assume timeout |
| headers | Your http header                                               |
| body    | Any http body if your method requires it                       |
|         |                                                                |

Alerts are the condition which will trigger an alert, and the subsequent notification method to send out the alert. See below for further details on alerts and notifications.

## Execution order

In a configuration with multiple probes, `Monika` will perform the requests in sequence in the order that they are entered, one after another.

On completion, `Monika` will sleep until the next interval to start again. At the top of the `config.json` file there is an `interval` setting. The execution will be restarted after every `interval`. If interval is shorter than the amount of time to dispatch all the requests, then `Monika` will immediately repeat after the last probe response and any notification alerts sent.

## Further reading

1. [Alerts](./alerts.md)
2. [Notifications](./notifications.md)
