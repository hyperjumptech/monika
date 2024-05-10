---
id: tls-checkers
title: TLS Checkers
---

You can check TLS validity and set the threshold to send notification before the expiry time.

```yaml
certificate:
  domains:
    - example.com
    - expired.badssl.com
    - domain: example.com
      options:
        path: '/foo'
  reminder: 30
```

| Name     | Data Type | Required | Default Value | Description                                                                |
| -------- | --------- | -------- | ------------- | -------------------------------------------------------------------------- |
| domains  | Array     | true     | -             | The list of domains to check.                                              |
| reminder | Number    | false    | 30            | The number of days to send notification to user before the domain expires. |

The `domains` array can be a mix of strings (host name only, no path), or objects
that contain a `domain` string property for the host name, and an `options` object
property that contains custom HTTPS options for the TLS checker, such as `path`.
