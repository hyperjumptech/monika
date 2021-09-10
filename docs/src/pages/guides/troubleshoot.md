---
id: troubleshoot
title: Troubleshoot
---

If you have problem installing using `npm`, please check this [issue #216](https://github.com/hyperjumptech/monika/issues/216). It might be related to permission issue. In most cases, it can be solved by running

```
sudo npm i -g @hyperjumptech/monika --unsafe-perm=true --allow-root
```
