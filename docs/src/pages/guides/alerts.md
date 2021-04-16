# Alerts

Alerts are the types of condition that will trigger Monika to send notification. It is an array located on probes defined in the config file `monika.json` like so.

```json
  "probes": [
    {
      "id": "1",
      "name": "Name of the probe",
      ...
      "alerts": ["status-not-2xx", "response-time-greater-than-200-ms"]
    },
  ]
```

## Alerts types

Now there are 2 supported types of alerts conditions:

### 1. HTTP Code

To measure returned HTTP code.

| Value          | Description                                                                                   |
| :------------- | --------------------------------------------------------------------------------------------- |
| status-not-2xx | Condition met if the returned http code from the probes is less than 200 or greater than 299. |

### 2. Response Time

To measure response time. The time value and unit can be changed.

| Value                                 | Description                                                                              |
| :------------------------------------ | ---------------------------------------------------------------------------------------- |
| response-time-greater-than-`200`-`ms` | Condition met if the response time from the probes URL is greater than 200 milliseconds. |

- The time value can be changed to any positif integer value. In above example, the value is `200`.
- The time unit can be changed to `s` second. In above example, the unit is `ms` for milliseconds.

Example changed time value and unit:

```
response-time-greater-than-1-s
```

means Monika will send notification if the response of the probes URL is received after 1 second.

## Further reading

1. [Probes](./probes)
2. [Notifications](./notifications)
