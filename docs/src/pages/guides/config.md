---
id: monika.yml
title: monka.yml
---

Monika uses a yaml file format to describe all the settings and configurations. Built-in example is included can be seen `monika.example.yml`

## Probes

```bash
probes:
  - id: '1'
    name: HTML form submission
    description: simulate html form submission
    interval: 10
    requests:
      - url: https://httpbin.org/status/200
        method: POST
        timeout: 7000
        headers:
          Content-Type: application/x-www-form-urlencoded
```

id:  
name:  
description:  
interval:  
request:

## Requests

url:  
method:  
timeout:  
headers:

```bash

```

## Alerts

```bash

```

## Notifications

```bash


```

```bash

```

```bash

```
