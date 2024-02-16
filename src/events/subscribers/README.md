You need to import the subscriber file from [the loaders file](/src/loaders/index.ts) to activate it when the application starts.

For example:

```typescript
// import the subscriber file to activate the event emitter subscribers
import '../events/subscribers/application'
import '../events/subscribers/probe.js'
```
