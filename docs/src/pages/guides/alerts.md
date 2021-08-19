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

## Alerts formats

You can configure alerts either in string format or object format for more advanced case and flexible use:

### 1. Alert in string format

This is the initial format used by Monika. It supports 2 types of alerts conditions:

**HTTP Code**

To measure returned HTTP code.

| Value          | Description                                                                                   |
| :------------- | --------------------------------------------------------------------------------------------- |
| status-not-2xx | Condition met if the returned http code from the probes is less than 200 or greater than 299. |

**Response Time**

To measure response time. The time value and unit can be changed.

| Value                                 | Description                                                                              |
| :------------------------------------ | ---------------------------------------------------------------------------------------- |
| response-time-greater-than-`200`-`ms` | Condition met if the response time from the probes URL is greater than 200 milliseconds. |

- The time value can be changed to any positive integer value. In above example, the value is `200`.
- The time unit can be changed to `s` second. In above example, the unit is `ms` for milliseconds.

Example changed time value and unit:

```
response-time-greater-than-1-s
```

means Monika will send notification if the response of the probes URL is received after 1 second.

### 2. Alert in object format

This is the new format for more complex condition. Use this one if the previous format doesn't cater to your need.

Define alert like so

```json
  "alerts" : [
    {
      "query": "response.status == 500",
      "subject": "Subject for notification purpose",
      "message": "Message for notification purpose"
    }
  ]
```

The response object can be queried in the `query` property of the alert. Alert will be triggered when the query is returning truthy value.

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
      "subject": "Invalid Content-Type",
      "message": "The url does not return response with expected content-type."
    }
  ]
```

Or to query value inside the body

```json
`json
  "alerts" : [
    {
      "query": "response.body.data.todos[0].title != \"Drink water\"",
      "subject": "Invalid order of data",
      "message": "'Drink water' should always be the first in the list"
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

## Further reading

1. [Probes](./probes)
2. [Notifications](./notifications)
