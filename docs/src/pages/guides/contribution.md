---
id: contribution
title: Contribution
---

## Custom Notifications

Out of the box, Monika support a multitude of notification channels, from chat applications such as Slack, Discourse, Microsoft Teams, Google Chats to email based platform such as Mailgun, to generic webhooks and the SMPT protocol ([click here for the full list](https://monika.hyperjump.tech/guides/notifications)). Should you have a favorite tool not already supported, we invite you to add it to Monika's growing list. Here's how.

## Prequisites

Adding a custom notification to Monika is quite straight forward. There are just a few requirements

1. Some javascript basic may be helpful.
2. Some familiarity with git is required to clone and create pull requests.
3. A Github account to fork and clone the [Monika open source repository](https://github.com/hyperjumptech/monika).
4. A development environment already setup for javascript/typescript. See the project [readme](https://github.com/hyperjumptech/monika/blob/main/README.md) for an overview.
5. A code editor such as vim or visual code is recommended.

## Extending

The first step in adding custom notification is to extend the existing BaseNotification.

1. Extend your new notification in `src/interfaces/notification.ts`

Inside `notification.ts` define a new type, something to identify your new channel externally. In the example below, a google chat channel is defined as `google-chat` with a `GoogleChatData` data type.

```typescript
interface GoogleChatNotification extends BaseNotification {
  type: 'google-chat'
  data: GoogleChatData
}
```

2. Add your new interface to `src/interfaces/data.ts`

Next define all the data your channel require in `data.ts`. If your data is a bit complex, you can define them in a separate module such as `whatsapp.ts`. For our google example, google chat only require a url as input data.

```javascript
export interface GoogleChatData {
  url: string;
}
```

The app whatsapp however, requires a few more data to be passed ot it. Below is an example.

```javascript
export interface WhatsappData extends MailData {
  url: string
  username: string
  password: string
}
```

## Link sendNotifications

After defining your interfaces and data types, we'll head over to `src/components/notification/index.ts` to link your notifications API. Find a function called `sendNotifications`, then add your app label previously defined. This is where we also map the data from monika, an array called `Notification[]` and an object called `NotificationMessage` should be passed to your app.

```typescript
export async function sendNotifications(
  notifications: Notification[],
  message: NotificationMessage
): Promise<void>
```

Going back to our example for google-chat, we linked `sendNotifications` to our API `sendGoogleChat()`.

```typescript
    case 'google-chat': {
          await sendGoogleChat(notification.data, message)
          break
        }
```

## Implementation

Finally we head over to `src/components/notification/channel/`. Create a new module specific for your application, something like `src/components/notification/channel/myChatApp.ts`. This is where we will be implementing all the notification transmission for each Monika events. The events and messages you need to handle are embedded in the `NotificationMessage` object passed over from `sendNotifications()` above.

Some of the events you need to handle are:

- start: This is a "start-of-monitoring" message when monika is first fired up.
- termination: A termination message occurs as Monika is shutting down.
- incident: Incident is an alert triggered whenever we've detected an incident in the probes.
- recovery: Recovery alert indicates the probe have recovered from the previous incident.
- status-update: Status update is a daily summary message of the probe events.

Back on our google-chat example this is how we use `message.meta.type` to handle the different events.

```typescript
export const sendGoogleChat = async (
  data: GoogleChatData,
  message: NotificationMessage
): Promise<any> => {

  const notifType =
    message.meta.type[0].toUpperCase() + message.meta.type.substring(1)

  switch (message.meta.type) {
    case 'start':
      ...
    case 'termination':
      ...

```

This is where you can get creative and really customize the look and feel of the notification. You can use icons, widgets, fonts and colors of your choice. In the example `googlechat.ts` below, you can see how headers, text coloring are used to create the incident notifications. Your choice and available options will vary depending on the app. Please refer to your application development documentation.

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

Finally, head over to `src/components/config/validate.ts` and look for the `validateNotification()` function. This is called at the beginning to verify that the user's configuration is setup properly.

```typescript
    case 'google-chat': {
        if (!notification.data.url) return WEBHOOK_NO_URL
        break
      }
```

In the example above, we make sure that the `google-chat` identifier is properly identified, and that the `url` field is set. Otherwise a standardized "no-url-found" message is returned.

## Testing

Next add unit test into the folder `test/components/notification.test.ts` to ensure that all your code behaves as designed. We use the `mocha` testing framework and `chai`'s expect for assertion and checking.

## Documentation

To wrap it up, add some documentation about your new app, how to set it up for other users to use. Users will love you for it.

That's it. Push your changes and create a pull request back to Monika's mainline repository and we'll merge it.
