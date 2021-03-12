# Alerts

Alerts are the types of condition that will trigger Monika to send notification. It is an array located on probes defined in the config file `config.json` like so.

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

Now there is 2 supported types of alerts. Static and dynamic:

### Static value


| Value   | Description                                            |
| :------ | ------------------------------------------------------      |
| status-not-2xx  | Condition met if the returned http code from the probes is less than 200 or greater than 299 |

### Dynamic value

| Value   | Description                                            |
| :------ | ------------------------------------------------------      |
| response-time-greater-than-`200`-`ms`     | Condition met if the returned response time from the probes is greater than 200 milliseconds |

- The time value can be changed to any positif integer value. In above example, the value is 200
- The time unit can be changed to `s` second. In above example, the unit is `ms` for milliseconds

## Further reading

1. [Alerts](./alerts)
2. [Notifications](./notifications)

