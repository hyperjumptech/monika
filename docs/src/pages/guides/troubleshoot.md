---
id: troubleshoot
title: Troubleshoot
---

If you have problem installing using `npm`, please check this [issue #216](https://github.com/hyperjumptech/monika/issues/216). It might be related to permission issue. In most cases, it can be solved by running

```bash
sudo npm i -g @hyperjumptech/monika --unsafe-perm=true --allow-root
```

If you have issues probing a particular target we suggest:

1. Try sending the request through curl or a separate tool such as Insomnia.
2. Isolate the problematic probes in your `monika.yml` configuration file by removing others while you troubleshoot.
3. Check the examples in our [documentations here](https://monika.hyperjump.tech/guides/examples).

Found something you can't solve, have questions or feedback? By all means reach out through our [discussion forums in github](https://github.com/hyperjumptech/monika/discussions). We would love to hear from you.
