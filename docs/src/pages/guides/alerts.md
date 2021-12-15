---
id: alerts
title: Alerts
---

Alerts are the types of condition that will trigger Monika to send notification. It is an array located on probes defined in the config file `monika.yml` like so.

```yaml
probes:
  id: '1'
  name: Name of the probe
  requests:
    - alerts:
        - query: response.size >= 10000
          message: Response size is {{ response.size }}, expecting less than 10000
```

You can define alerts in two ways: **request alerts** and **probe alerts**

### Request Alerts

Request alerts are `alerts` configurations that are put under the `requests` key. Alerts defined under a specific request will run for that request only. Take a look at an example below:

```yaml
probes:
  id: '1'
  name: Name of the probe
  requests:
    - method: GET
      url: https://github.com
      alerts:
        - query: response.status != 200
          message: Status not 2xx # (This alert is only triggered for the github.com request)
    - method: GET
      url: https://gitlab.com
      alerts:
        - query: response.status != 200
          message: Status not 2xx # (This alert is only triggered for the gitlab.com request)
```

### Probe Alerts

Probe alerts are `alerts` configurations that are put under the `probe` key. Alerts defined under a specific probe will run for all requests. Take a look at an example below:

```yaml
probes:
  id: '1'
  name: Name of the probe
  requests:
    - method: GET
      url: https://github.com
      alerts:
        - query: response.status != 200
          message: Status not 2xx # (This alert is only triggered for the github.com request)
    - method: GET
      url: https://gitlab.com
      alerts:
        - query: response.status != 200
          message: Status not 2xx # (This alert is only triggered for the gitlab.com request)
  alerts:
    - query: response.time > 10000
      message: Response time is longer than 10 seconds # (This alert is triggered for all request)
```

## Alert Timing

Probes are performed after every interval, and alerts are generated after a specified threshold. Monika can perform probes once a second, therefore a theoretical maximum rate of one alert a second. Please keep in mind that there also some delays to your network, notification channels (slack, email, etc), so your result will vary.

In general it will be something like:

```text
Alert resolution = interval period (s) x threshold + network_and_channel_latencies
```

From above, the theoretical maximum resolution is one second.

## Alert Query

Query contains any arbitrary expression that will trigger alert when it returns a truthy value

```yaml
alerts:
  - query: response.status == 500
```

Inside the query expression you can get the response object.

These are values that are available:

- response.status: HTTP status code of the reponse
- response.time: the time it takes to perform a HTTP request
- response.size: size of the response in bytes
- response.headers: HTTP response headers
- response.body: HTTP response body (if content-type is JSON, it will be parsed automatically)

The `response.headers` and `response.body` can be queried further with object access syntax.

For example, to trigger alert when content-type is not json you may use

```yaml
alerts:
  - query: response.headers['content-type'] != "application/json"
```

Or to query value inside the body

```yaml
alerts:
  - query: response.body.data.todos[0].title != "Drink water"
```

Additionaly you can have proccessing done in your queries. For instance, to ensure case insensitivity, you might want to convert to lower case. It might look something like this:

```yaml
alerts:
  - query: has(lowerCase(response.body.status), "success")
```

These operators are available:

| Numeric arithmetic | Description |
| ------------------ | ----------- |
| x + y              | Add         |
| x - y              | Subtract    |
| x \* y             | Multiply    |
| x / y              | Divide      |
| x % y              | Modulo      |
| x ^ y              | Power       |

| Comparisons        | Description                                  |
| ------------------ | -------------------------------------------- |
| x == y             | Equals                                       |
| x != y             | Does not equal                               |
| x < y              | Less than                                    |
| x <= y             | Less than or equal to                        |
| x > y              | Greater than                                 |
| x >= y             | Greater than or equal to                     |
| x ~= y             | Regular expression match                     |
| x in (a, b, c)     | Equivalent to (x == a or x == b or x == c)   |
| x not in (a, b, c) | Equivalent to (x != a and x != b and x != c) |

| Boolean logic | Description                   |
| ------------- | ----------------------------- |
| x or y        | Boolean or                    |
| x and y       | Boolean and                   |
| not x         | Boolean not                   |
| x ? y : z     | If boolean x, value y, else z |
| ( x )         | Explicity operator precedence |

There are also several helper functions available:

- **has(object, property)**: Checks whether an object has searched property.

  example: `has(response.body, "data")` checks if there is "data" property inside response.body

- **lowerCase(string)**: Converts string to lower case

  example: `lowerCase(response.body.message)` converts message string value to lower case

- **upperCase(string)**: Converts string to upper case

  example: `upperCase(response.body.message)` converts message string value to upper case

- **startsWith(string, target)**: Checks if string starts with the given target string

  example: `startsWith(response.body.message, "Hello")` checks if message string value starts with "Hello"

- **endsWith(string, target)**: Checks if string ends with the given target string

  example: `startsWith(response.body.message, "world!")` checks if message string value ends with "world!"

- **includes(collection, value)**: Checks if value is in collection. If collection is a string, it's checked for a substring of value

  example 1: `includes(response.body.prizes, "gold")` checks if "gold" exists in prizes array.

  example 2: `includes(response.body.message, "ello")` checks if "ello" is substring of message string.

- **size(collection)**: Gets length of array or string values.

  example: `size(response.body.data.items)` gets the count of items.

- **isEmpty(value)**: Checks if value is an empty object, empty array, empty string, null, or undefined.

  example: `isEmpty(response.body.data)` checks whether the data propery is empty or not

## Alert Message

```yaml
alerts:
  - query: response.status != 200
    message: HTTP Status code is different, expecting 200
```

This is the message that is used in the sent notification.

Inside the message string, you can also get the response object similar to query by surrounding the expression with double curly braces like the example above.

## Further reading

1. [Probes](./probes)
2. [Notifications](./notifications)
