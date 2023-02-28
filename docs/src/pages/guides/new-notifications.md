---
id: new-notifications
title: New Notifications
---

## Introduction

Out of the box, Monika support a multitude of notification channels, from chat applications such as Slack, Discourse, Microsoft Teams, Google Chats to email based platform such as Mailgun, to generic webhooks and the SMTP protocol ([full list can be found in Notifications here](https://monika.hyperjump.tech/guides/notifications)). Should you have a favorite tool we haven't supported, we invite you to add it to Monika's growing list. Here's how.

## Prerequisites

There are few requirements to start adding a new notification to Monika:

1. Some basic Typescript may be helpful.
2. Some familiarity with git is required to clone and create pull requests.
3. A Github account to fork and clone the [Monika open source repository](https://github.com/hyperjumptech/monika).
4. An environment already set up for development in Javascript/Typescript. See the project [README](https://github.com/hyperjumptech/monika/blob/main/README.md) for an overview.
5. A code editor such as vim or visual code is recommended.

## Extending

The first step in adding custom notification is to extend the existing BaseNotification.

1. Extend your new interface in `src/interfaces/notification.ts`

Inside `notification.ts` define a new type, something to identify your new app/channel externally. In the example below, the google chat app is defined as `"google-chat"` with a `GoogleChatData` data type.

```typescript
interface GoogleChatNotification extends BaseNotification {
  type: 'google-chat'
  data: GoogleChatData
}
```

2. Add your app specific data to `src/interfaces/data.ts`

Most of the time, your notification channel may require some data such as API key, Namespace key etc. You can define all your requirements in `data.ts`. If your data is a bit complex, you can create a separate module such as `whatsapp.ts`. For our example, google chat only requires a url as input data.

```javascript
export interface GoogleChatData {
  url: string;
}
```

The WhatsApp application however, requires more data to be passed to it such as the following:

```javascript
export interface WhatsappData extends MailData {
  url: string
  username: string
  password: string
}
```

## Linking

After defining your interfaces and data types, we'll head over to `src/components/notification/index.ts` to link your notifications API. Find a function called `sendNotifications`, then add your app's type you've defined in step 1 above. This is where we also map the data from Monika, an array called `Notification[]` and an object called `NotificationMessage` to your app.

```typescript
export async function sendNotifications(
  notifications: Notification[],
  message: NotificationMessage
): Promise<void>
```

Going back to our example for google-chat, we linked `sendNotifications` to our API `sendGoogleChat()` as follows:

```typescript
    case 'google-chat': {
          await sendGoogleChat(notification.data, message)
          break
        }
```

## Implementation

We now head over to `src/components/notification/channel/`. Create a new module specific for your application, something like `src/components/notification/channel/myChatApp.ts`. This is where all the notification implementations for each Monika event are coded. The events and messages you need to handle are embedded in the `NotificationMessage` object passed over from `sendNotifications()` above.

Some of the events you need to handle are:

- `start`: This is a "start-of-monitoring" message when monika is first fired up.
- `termination`: A termination message occurs as Monika is shutting down.
- `incident`: Incident is an alert triggered whenever we've detected an incident in the probes.
- `recovery`: Recovery alert indicates the probe has recovered from the previous incident.
- `status-update`: Status update is a daily summary message of the probe events.

Back to our google-chat example, this is how we use `message.meta.type` to handle the different events.

```typescript
export const sendGoogleChat = async (
  data: GoogleChatData,
  message: NotificationMessage
): Promise<any> => {

  const notifType =
    message.meta.type[0].toUpperCase() + message.meta.type.substring(1)

  switch (message.meta.type) {
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
      chatMessage = {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: `New ${notifType} from Monika`,
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `<b>Message: <font color=#ff0000>Alert!</font></b> ${message.summary}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>URL:</b> <a href>${message.meta.url}</a>`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Time:</b> ${message.meta.time}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>From:</b> ${message.meta.monikaInstance}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
      break
```

## Validating

Finally, head over to `src/components/config/validate.ts` and look for the `validateNotification()` function. We'd like to make sure Monika is configured properly before each run and `validate.ts` handles the checking. This function is called at the beginning to verify that the user's configuration contains no error.

```typescript
    case 'google-chat': {
        if (!notification.data.url) return WEBHOOK_NO_URL
        break
      }
```

In the example above, we made sure that the user provided the `url` when using the notification type `google-chat`. Otherwise a standardized "no-url-found" message is displayed.

In addition the the in-code-validations above, Monika users have the option to use JSON schema validation from their favorite editors. This is super convenient and it is highly recommended to add new schemas to reflect your changes.

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
