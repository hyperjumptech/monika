---
id: status-notification
title: Status Notification
---

Monika sends status notification periodically based on a set schedule with the following information:

- Host
- Number of probes
- Average response time in the last 24 hours
- Incidents in the last 24 hours
- Recoveries in the last 24 hours
- Number of sent notifications in the last 24 hours
- Application version

By default the schedule is set to 6:00 AM everyday. You can configure the schedule with cron syntax via command line argument like so:

```bash
monika --status-notification "0 6 * * *"
```

or via the configuration file with the `status-notification` field like below:

```yml
notifications:
  - id: desktop
    type: desktop
probes:
  - requests:
      - url: http://example.com
status-notification: 0 6 * * *
```

You can also choose to disable this feature altogether. Just set the value to `false`

```bash
monika --status-notification false
```

or

```yml
notifications: ...
probes: ...
status-notification: false
```

## Cron Syntax

To schedule the status notification we use standard cron syntax. You can tryout your configuration on [crontab.guru](https://crontab.guru/).

In addition to he standard 5 cront syntax, Monika supports an optional seconds field.

```bash
 ┌────────────── second (optional)
 │ ┌──────────── minute
 │ │ ┌────────── hour
 │ │ │ ┌──────── day of month
 │ │ │ │ ┌────── month
 │ │ │ │ │ ┌──── day of week
 │ │ │ │ │ │
 │ │ │ │ │ │
 * * * * * *
```

### Valid Field Values

| Field           | Data                                 |
| --------------- | ------------------------------------ |
| second          | 0-59                                 |
| minute          | 0-59                                 |
| hour            | 0-23                                 |
| day             | 1-31                                 |
| month           | 1-12 (or month names)                |
| day of the week | 0 - 7, or names (0 and 7 are Sunday) |

Examples:

```bash
status-notification "1,2,5,7 * * * *"
```

Notifies every minutes 1, 2, 5 and 7. In other words every xx:01, xx:02, xx:05, xx:07 of every hour.

```bash
status-notification "1-5 * * * *"
```

Notifies with the range of minute 1 to 5.

```bash
status-notification "*/2 * * * *"
```

Notifies every two minutes.

```bash
status-notification "* * * Feb,Mar Sun"
```

Notifies every Sunday in February and March.
