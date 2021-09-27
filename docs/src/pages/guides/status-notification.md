---
id: status-notification
title: Status Notification
---

Monika sends status notification periodically based on a schedule with following information:

- Host
- Number of probes
- Average response time in the run time
- Incidents in the last 24 hours
- Recoveries in the last 24 hours
- Number of sent notifications in the last 24 hours
- Application version

By default the schedule is set to 6 AM everyday. You can configure the schedule with cron syntax via command line argument like so:

```bash
monika --status-notification "0 6 * * *"
```

or via configuration file like so:

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
