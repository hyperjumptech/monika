(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[12],{OPEj:function(e,n,t){"use strict";t.r(n),t.d(n,"meta",(function(){return p})),t.d(n,"default",(function(){return h}));var a=t("wx14"),s=t("Ff2n"),i=t("q1tI"),o=t.n(i),r=t("7ljp"),l=t("er9C"),p=(o.a.createElement,{}),c={meta:p},u=e=>{var{children:n}=e,t=Object(s.a)(e,["children"]);return Object(r.b)(l.a,Object(a.a)({meta:p},t),n)};function h(e){var{components:n}=e,t=Object(s.a)(e,["components"]);return Object(r.b)(u,Object(a.a)({},c,t,{components:n,mdxType:"MDXLayout"}),Object(r.b)("h1",{id:"examples"},"Examples",Object(r.b)("a",{parentName:"h1",href:"#examples",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("h2",{id:"minimal-configuration"},"Minimal Configuration",Object(r.b)("a",{parentName:"h2",href:"#minimal-configuration",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Here is a probe example with GET request to hit github.com:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-json"},'{\n  "probes": [\n    {\n      "requests": [\n        {\n          "url": "https://github.com"\n        }\n      ]\n    }\n  ]\n}\n')),Object(r.b)("p",null,"By default if you didn't define the method, it will be set as GET. Please note that with this configuration, you will not get any notifications when github.com is down since the notification configuration is not defined."),Object(r.b)("h2",{id:"enabling-notification"},"Enabling Notification",Object(r.b)("a",{parentName:"h2",href:"#enabling-notification",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Here is a probe example to monitor Monika landing page:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-json"},'{\n  "notifications": [\n    {\n      "id": "unique-id-smtp",\n      "type": "smtp",\n      "data": {\n        "recipients": ["YOUR_EMAIL_ADDRESS_HERE"],\n        "hostname": "smtp.gmail.com",\n        "port": 587,\n        "username": "YOUR_GMAIL_ACCOUNT",\n        "password": "YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD"\n      }\n    }\n  ],\n  "probes": [\n    {\n      "id": "1",\n      "name": "Monika Landing Page",\n      "description": "Landing page of awesome Monika",\n      "interval": 10,\n      "requests": [\n        {\n          "url": "https://hyperjumptech.github.io/monika",\n          "timeout": 7000\n        }\n      ],\n      "alerts": ["status-not-2xx"]\n    }\n  ]\n}\n')),Object(r.b)("p",null,"Using the above configuration, Monika will check the landing page every 10 seconds and will send a notification by email when the landing page is down 5 times in a row. For more information about available notification channels, refer to ",Object(r.b)("a",{parentName:"p",href:"https://hyperjumptech.github.io/monika/guides/notifications"},"Notifications"),"."),Object(r.b)("h2",{id:"html-form-submission-example"},"HTML Form Submission Example",Object(r.b)("a",{parentName:"h2",href:"#html-form-submission-example",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Here is probe example with POST request to simulate HTML form submission"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-json"},'{\n  "probes": [\n    {\n      "id": "1",\n      "name": "HTML form submission",\n      "description": "simulate html form submission",\n      "interval": 10,\n      "requests": [\n        {\n          "method": "POST",\n          "url": "http://www.foo.com/login.php",\n          "timeout": 7000,\n          "headers": {\n            "Content-Type": "application/x-www-form-urlencoded"\n          },\n          "body": {\n            "username": "someusername",\n            "password": "somepassword"\n          }\n        }\n      ]\n    }\n  ]\n}\n')),Object(r.b)("p",null,"Using the configuration above, Monika will send a POST request to ",Object(r.b)("a",{parentName:"p",href:"http://www.foo.com/login.php"},"http://www.foo.com/login.php")," with the defined request's body."),Object(r.b)("h2",{id:"multiple-request"},"Multiple request",Object(r.b)("a",{parentName:"h2",href:"#multiple-request",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Here is an example configuration with multiple requests:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-json"},'{\n  "probes": [\n    {\n      "id": "1",\n      "name": "Probing Github",\n      "description": "simulate html form submission",\n      "interval": 10,\n      "requests": [\n        {\n          "method": "GET",\n          "url": "https://github.com/",\n          "timeout": 7000,\n          "saveBody": false\n        },\n        {\n          "method": "GET",\n          "url": "https://github.com/hyperjumptech",\n          "timeout": 7000,\n          "saveBody": true\n        }\n      ],\n      "incidentThreshold": 3,\n      "recoveryThreshold": 3,\n      "alerts": ["status-not-2xx", "response-time-greater-than-200-ms"]\n    }\n  ]\n}\n')),Object(r.b)("p",null,"In the configuration above, Monika will first check ",Object(r.b)("inlineCode",{parentName:"p"},"https://github.com/")," then ",Object(r.b)("inlineCode",{parentName:"p"},"https://github.com/hyperjumptech"),". If the status code of ",Object(r.b)("inlineCode",{parentName:"p"},"https://github.com/")," is not 2xx (e.g., 200, 201), Monika ",Object(r.b)("strong",{parentName:"p"},"will not")," check ",Object(r.b)("inlineCode",{parentName:"p"},"https://github.com/hyperjumptech"),"."),Object(r.b)("p",null,"If there is a case where executing GET request to ",Object(r.b)("inlineCode",{parentName:"p"},"https://github.com")," triggers an alert, the next request will not be executed."),Object(r.b)("h2",{id:"requests-chaining"},"Requests Chaining",Object(r.b)("a",{parentName:"h2",href:"#requests-chaining",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Monika supports request chaining, which enables you to do multiple requests and the ability to use past responses from earlier requests. For example, after executing a GET request to certain API, the next request could use the previous request(s) response into their path/query parameters or headers."),Object(r.b)("p",null,"Here is an example on how you could get previous request(s) response data into your next request:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre"},"{{ response.[0].status }} ==> Get status code from first request response\n{{ response.[1].data.token }} ==> Get token from second request response\n{{ response.[2].headers.SetCookie[0] }} ==> Get first cookie from third request response\n")),Object(r.b)("p",null,"In the example above, ",Object(r.b)("inlineCode",{parentName:"p"},"response.[0]")," refers to the response from the first request in the probe, ",Object(r.b)("inlineCode",{parentName:"p"},"response.[1]")," refers to the response from the second request in the probe, and so on. Please note that you can only use the response from previous requests in the same probe."),Object(r.b)("p",null,"Please refer to ",Object(r.b)("a",{parentName:"p",href:"https://hyperjumptech.github.io/monika/guides/probes#probe-response-anatomy"},"Probe Response Anatomy")," in order to know which value could be used from the response body for the next request(s)."),Object(r.b)("p",null,"In the sections below, you can find several examples of configuration file which contains chaining requests."),Object(r.b)("h3",{id:"pass-response-data-as-pathquery-parameters"},"Pass Response Data as Path/Query Parameters",Object(r.b)("a",{parentName:"h3",href:"#pass-response-data-as-pathquery-parameters",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Here is an example of using previous request's response in the path/query parameters:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-json"},'{\n  "probes": [\n    {\n      "id": "1",\n      "name": "Probing Github",\n      "description": "simulate html form submission",\n      "interval": 10,\n      "requests": [\n        {\n          "method": "GET",\n          "url": "https://reqres.in/api/users",\n          "timeout": 7000\n        },\n        {\n          "method": "GET",\n          "url": "https://reqres.in/api/users/{{ responses.[0].data.data.[0].id }}",\n          "timeout": 7000\n        }\n      ],\n      "incidentThreshold": 3,\n      "recoveryThreshold": 3,\n      "alerts": ["status-not-2xx", "response-time-greater-than-2000-ms"]\n    }\n  ]\n}\n')),Object(r.b)("p",null,"In the configuration above, the first request will fetch all users from ",Object(r.b)("inlineCode",{parentName:"p"},"https://reqres.in/api/users"),". Then in the second request, Monika will fetch the details of the first user from the first request. If there are no triggered alerts, the response returned from the first request is ready to be used by the second request using values from ",Object(r.b)("inlineCode",{parentName:"p"},"{{ responses.[0].data }}"),"."),Object(r.b)("p",null,"Let's say the response from fetching all users in JSON format as follows:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-json"},'{\n  "page": 2,\n  "per_page": 6,\n  "total": 12,\n  "total_pages": 2,\n  "data": [\n    {\n        "id": 7,\n        "email": "michael.lawson@reqres.in",\n        "first_name": "Michael",\n        "last_name": "Lawson",\n        "avatar": "https://reqres.in/img/faces/7-image.jpg"\n    },\n    ...\n  ]\n}\n')),Object(r.b)("p",null,"To use the user ID of the first user in the second request, we define the url of the second request as ",Object(r.b)("inlineCode",{parentName:"p"},"{{ responses.[0].data.data.[0].id }}"),"."),Object(r.b)("h3",{id:"pass-response-data-as-headers-value"},"Pass Response Data as Headers value",Object(r.b)("a",{parentName:"h3",href:"#pass-response-data-as-headers-value",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Here is an example of using previous request's response in the headers:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-json"},'{\n  "probes": [\n    {\n      "id": "1",\n      "name": "Probing Github",\n      "description": "simulate html form submission",\n      "interval": 10,\n      "requests": [\n        {\n          "method": "POST",\n          "url": "https://reqres.in/api/login",\n          "timeout": 7000,\n          "body": {\n            "email": "eve.holt@reqres.in",\n            "password": "cityslicka"\n          }\n        },\n        {\n          "method": "POST",\n          "url": "https://reqres.in/api/users/",\n          "timeout": 7000,\n          "body": {\n            "name": "morpheus",\n            "job": "leader"\n          },\n          "headers": {\n            "Authorization": "Bearer {{ responses.[0].data.token }}"\n          }\n        }\n      ],\n      "incidentThreshold": 3,\n      "recoveryThreshold": 3,\n      "alerts": ["status-not-2xx", "response-time-greater-than-2000-ms"]\n    }\n  ]\n}\n')),Object(r.b)("p",null,"Using the above configuration, Monika will perform login request in the first request, then use the returned token in the Authorization header of the second request."))}h.isMDXComponent=!0},"UQ/4":function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/guides/examples",function(){return t("OPEj")}])}},[["UQ/4",0,2,4,1,3,5]]]);