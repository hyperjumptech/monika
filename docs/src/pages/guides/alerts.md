---
id: alerts
title: Alerts
---

Alerts are the types of condition that will trigger Monika to send notification. It is an array located on probes defined in the config file `monika.json` like so.

```json
  "probes": [
    {
      "id": "1",
      "name": "Name of the probe",
      "requests": [
        ...
        {
          ...
          "alerts": [
            {
              "query": "response.size >= 10000",
              "message": "Response size is {{ response.size }}, expecting less than 10000"
            }
          ]
        }
      ],
      "alerts": [
        {
          "query": "response.status != 200",
          "message": "HTTP Status code is {{ response.status }}, expecting 200"
        }
      ]
    },
  ]
```

The `alerts` configuration can be put under `probe` or under each `requests` as displayed above. Alerts defined under `probe` will run for all requests, while the alerts defined under specific request will run for that request only.

## Alert Query

Query contains any arbitrary expression that will trigger alert when it returns a truthy value

```json
  "alerts" : [
    {
      "query": "response.status == 500",
      ...
    }
  ]
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

```json
  "alerts" : [
    {
      "query": "response.headers['content-type'] != \"application/json\"",
      ...
    }
  ]
```

Or to query value inside the body

```json
`json
  "alerts" : [
    {
      "query": "response.body.data.todos[0].title != \"Drink water\"",
      ...
    }
  ]
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

## Alert Message

```json
  "alerts": [
    {
      "query": "response.status != 200",
      "message": "HTTP Status code is {{ response.status }}, expecting 200"
    }
  ]
```

This is the message that is used in the sent notification.

Inside the message string, you can also get the response object similar to query by surrounding the expression with double curly braces like the example above.

## Further reading

1. [Probes](./probes)
2. [Notifications](./notifications)
