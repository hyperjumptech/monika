---
id: new-notifications
title: New Notifications
---

## Introduction

Out of the box, Monika support a multitude of notification channels, from chat applications such as Slack, Discourse, Microsoft Teams, Google Chats to email based platform such as Mailgun, to generic webhooks and the SMTP protocol ([full list can be found in Notifications here](https://monika.hyperjump.tech/guides/notifications)). Should you have a favorite tool we haven't supported, we invite you to add it to Monika's growing list. Here's how.

## Prerequisites

There are few requirements to start adding a new notification to Monika:

1. Some basic TypeScript may be helpful.
2. Some familiarity with git is required to clone and create pull requests.
3. A GitHub account to fork and clone the [Monika open source repository](https://github.com/hyperjumptech/monika).
4. An environment already set up for development in JavaScript/TypeScript. See the project [README](https://github.com/hyperjumptech/monika/blob/main/README.md) for an overview.
5. A code editor such as [Vim](https://www.vim.org/) or [Visual Studio Code](https://code.visualstudio.com/) is recommended.

## Add a New Notification

1. Create a new file in the `src/components/notification/channel` directory that satisfies the `NotificationChannel` type from the `src/components/notification/channel/index.ts` file and implement the new notification.

```typescript
type NotificationChannel<T = any> = {
  validator: Joi.AnySchema
  send: (notificationData: T, message: NotificationMessage) => Promise<void>
  additionalStartupMessage?: (notificationData: T) => string
}
```

| Property                 | Description                                                                            | Example                                                     |
| ------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| validator                | To validate the `notificationData` field by using [Joi](https://github.com/hapijs/joi) | `Joi.object().keys({ url: Joi.string().uri().required() })` |
| send                     | It will be invoked if the application needs to send a message through the channel      | -                                                           |
| additionalStartupMessage | To display additional message on the startup when using `verbose` flag                 | -                                                           |

2. Import the implemented notification file to the `src/components/notification/channel/index.ts` file.

```typescript
import * as whatsapp from './whatsapp'
```

3. Register it to the `channels` variable in the same file. The key in the channels variable will be used in the Monika configuration to identify the notification type.

```typescript
export const channels: Record<string, NotificationChannel> = {
  desktop,
  'google-chat': googlechat,
  // ...
  whatsapp,
  workplace,
}
```

## Events

You can access different type of events from the `message` argument from the `send` function. It available on the `meta.type` property. Some of the events you need to handle are:

- `start`: This is a "start-of-monitoring" message when monika is first fired up.
- `termination`: A termination message occurs as Monika is shutting down.
- `incident`: Incident is an alert triggered whenever we've detected an incident in the probes.
- `recovery`: Recovery alert indicates the probe has recovered from the previous incident.
- `status-update`: Status update is a daily summary message of the probe events.

This is the example how we handle the different events.

```typescript
function getContent(
  { body, meta, summary }: NotificationMessage,
  notificationType: string
): Content {
  switch (notificationType) {
    case 'start':
      ... code to send start notifications
    case 'termination':
      ... code to send termination notifications
    case `incident`:
      ... code to send incident notifications

```

This is where you can get creative and really customize the look and feel of the notifications. You can use icons, widgets, fonts and colors of your choice. In the example `googlechat.ts` below, you can see how headers, text coloring are used to create the incident notifications. Your choices and available options will vary depending on your application. Refer to the app's development/integration documentation for more information.

```typescript
    case 'incident':
      return {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: `New ${notificationType} from Monika`,
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `<b>Message: <font color=#ff0000>Alert!</font></b> ${summary}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>URL:</b> <a href>${url}</a>`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Time:</b> ${time}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>From:</b> ${monikaInstance}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
```

## Validating

Monika users have the option to use JSON schema validation from their favorite editors. This is super convenient and provide useful real time feedback. Therefore it is mandatory to add a new schema to reflect your changes, otherwise, your new notification type will not be recognized and flagged as an unknown type.

Update the json schema in `src/monika-config-schema.json` to be able to validate your new notification.

In the example above, the google chat schema validation may look something like:

```yaml
{
  "title": "Google Chat",
  "type": "object",
  "required": ["id", "type", "data"],
  "additionalProperties": false,
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique notification id",
      "default": "google-chat-01"
    },
    "type": {
      "const": "google-chat"
    },
    "data": {
      "type": "object",
      "description": "Data for your payload",
      "additionalProperties": false,
      "required": ["url"],
      "properties": {
        "url": {
          "$ref": "#/definitions/urlFormat",
          "description": "The webhook URL for your google chat",
          "examples": [
            "https://chat.googleapis.com/v1/spaces/XXXXX/messages?key=1122334455"
          ]
        }
      }
    }
  }
},
```

For further documentation on json schemas, you can visit the [json schema website here.](https://json-schema.org/)

## Testing

To make sure your integration won't break in the future, add your unit test(s) into the folder `test/components/notification.test.ts`. This will also ensure that all your code behaves as designed. We use [`Mocha.js`](https://mochajs.org/) testing framework and [`Chai.js`'](https://www.chaijs.com/) expect for assertion and checking.

## Documentation

To wrap it up, add some documentation about your new app, specifically how to set it up for others to use. Users will love you for it.

That's it. Finally push your changes and create a pull request back to Monika's mainline repository and we'll merge it.
