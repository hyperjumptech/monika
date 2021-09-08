---
id: tls-checkers
title: TLS Checkers
---

You can check TLS validity and set the threshold to send notification before the expiry time.

```json
{
  "probes": [{ "requests": [{ "url": "http://example.com" }] }],
  "certificate": {
    "domains": ["example.com", "expired.badssl.com"],
    "reminder": 30
  }
}
```

| Name     | Data Type | Required | Default Value | Description                                                                |
| -------- | --------- | -------- | ------------- | -------------------------------------------------------------------------- |
| domains  | Array     | true     | -             | The list of domains to check.                                              |
| reminder | Number    | false    | 30            | The number of days to send notification to user before the domain expires. |
