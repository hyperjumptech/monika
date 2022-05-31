(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[676],{4536:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/guides/examples",function(){return n(6846)}])},6846:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return p},meta:function(){return r}});n(7294);var s=n(3905),a=n(1860);function i(e,t){if(null==e)return{};var n,s,a=function(e,t){if(null==e)return{};var n,s,a={},i=Object.keys(e);for(s=0;s<i.length;s++)n=i[s],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(s=0;s<i.length;s++)n=i[s],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var r={id:"examples",title:"Examples"},o={meta:r},l=function(e){var t=e.children,n=i(e,["children"]);return(0,s.kt)(a.C,Object.assign({meta:r},n),t)};function p(e){var t=e.components,n=i(e,["components"]);return(0,s.kt)(l,Object.assign({},o,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h2",Object.assign({},{id:"minimal-configuration"}),"Minimal Configuration",(0,s.kt)("a",Object.assign({parentName:"h2"},{href:"#minimal-configuration",title:"Direct link to heading",className:"anchor"}),(0,s.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,s.kt)("p",null,"Here is a probe example with GET request to hit github.com:"),(0,s.kt)("pre",null,(0,s.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"probes:\n  - requests:\n      - url: https://github.com\n")),(0,s.kt)("p",null,"By default if you didn't define the method, it will be set as GET. Please note that with this configuration, you will not get any notifications when github.com is down since the notification configuration is not defined."),(0,s.kt)("h2",Object.assign({},{id:"enabling-notification"}),"Enabling Notification",(0,s.kt)("a",Object.assign({parentName:"h2"},{href:"#enabling-notification",title:"Direct link to heading",className:"anchor"}),(0,s.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,s.kt)("p",null,"Here is a probe example to monitor Monika landing page:"),(0,s.kt)("pre",null,(0,s.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"notifications:\n  - id: unique-id-smtp\n    type: smtp\n    data:\n      recipients:\n        - YOUR_EMAIL_ADDRESS_HERE\n      hostname: smtp.gmail.com\n      port: 587\n      username: YOUR_GMAIL_ACCOUNT\n      password: YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD\nprobes:\n  - id: '1'\n    name: Monika Landing Page\n    description: Landing page of awesome Monika\n    interval: 10\n    requests:\n      - url: https://hyperjumptech.github.io/monika\n        timeout: 7000\n    alerts:\n      - status-not-2xx\n")),(0,s.kt)("p",null,"Using the above configuration, Monika will check the landing page every 10 seconds and will send a notification by email when the landing page is down 5 times in a row. For more information about available notification channels, refer to ",(0,s.kt)("a",Object.assign({parentName:"p"},{href:"https://hyperjumptech.github.io/monika/guides/notifications"}),"Notifications"),"."),(0,s.kt)("h2",Object.assign({},{id:"html-form-submission-example"}),"HTML Form Submission Example",(0,s.kt)("a",Object.assign({parentName:"h2"},{href:"#html-form-submission-example",title:"Direct link to heading",className:"anchor"}),(0,s.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,s.kt)("p",null,"Here is probe example with POST request to simulate HTML form submission"),(0,s.kt)("pre",null,(0,s.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"probes:\n  - id: '1'\n    name: HTML form submission\n    description: simulate html form submission\n    interval: 10\n    requests:\n      - method: POST\n        url: http://www.foo.com/login.php\n        timeout: 7000\n        headers:\n          Content-Type: application/x-www-form-urlencoded\n        body:\n          username: someusername\n          password: somepassword\n")),(0,s.kt)("p",null,"Using the configuration above, Monika will send a POST request to ",(0,s.kt)("a",Object.assign({parentName:"p"},{href:"http://www.foo.com/login.php"}),"http://www.foo.com/login.php")," with the defined request's body."),(0,s.kt)("h2",Object.assign({},{id:"multiple-request"}),"Multiple request",(0,s.kt)("a",Object.assign({parentName:"h2"},{href:"#multiple-request",title:"Direct link to heading",className:"anchor"}),(0,s.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,s.kt)("p",null,"Here is an example configuration with multiple requests:"),(0,s.kt)("pre",null,(0,s.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"probes:\n  - id: '1'\n    name: Probing Github\n    description: simulate html form submission\n    interval: 10\n    requests:\n      - method: GET\n        url: https://github.com/\n        timeout: 7000\n        saveBody: false\n      - method: GET\n        url: https://github.com/hyperjumptech\n        timeout: 7000\n        saveBody: true\n    incidentThreshold: 3\n    recoveryThreshold: 3\n    alerts:\n      - status-not-2xx\n      - response-time-greater-than-200-ms\n")),(0,s.kt)("p",null,"In the configuration above, Monika will first check ",(0,s.kt)("inlineCode",{parentName:"p"},"https://github.com/")," then ",(0,s.kt)("inlineCode",{parentName:"p"},"https://github.com/hyperjumptech"),". If the status code of ",(0,s.kt)("inlineCode",{parentName:"p"},"https://github.com/")," is not 2xx (e.g., 200, 201), Monika ",(0,s.kt)("strong",{parentName:"p"},"will not")," check ",(0,s.kt)("inlineCode",{parentName:"p"},"https://github.com/hyperjumptech"),"."),(0,s.kt)("p",null,"If there is a case where executing GET request to ",(0,s.kt)("inlineCode",{parentName:"p"},"https://github.com")," triggers an alert, the next request will not be executed."),(0,s.kt)("h2",Object.assign({},{id:"requests-chaining"}),"Requests Chaining",(0,s.kt)("a",Object.assign({parentName:"h2"},{href:"#requests-chaining",title:"Direct link to heading",className:"anchor"}),(0,s.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,s.kt)("p",null,"Monika supports request chaining, which enables you to do multiple requests and the ability to use past responses from earlier requests. For example, after executing a GET request to certain API, the next request could use the previous request(s) response into their path/query parameters or headers."),(0,s.kt)("p",null,"Here is an example on how you could get previous request(s) response data into your next request:"),(0,s.kt)("pre",null,(0,s.kt)("code",Object.assign({parentName:"pre"},{className:"language-shell"}),"{{ response.[0].status }} ==> Get status code from first request response\n{{ response.[1].data.token }} ==> Get token from second request response\n{{ response.[2].headers.SetCookie[0] }} ==> Get first cookie from third request response\n")),(0,s.kt)("p",null,"In the example above, ",(0,s.kt)("inlineCode",{parentName:"p"},"response.[0]")," refers to the response from the first request in the probe, ",(0,s.kt)("inlineCode",{parentName:"p"},"response.[1]")," refers to the response from the second request in the probe, and so on. Please note that you can only use the response from previous requests in the same probe."),(0,s.kt)("p",null,"Please refer to ",(0,s.kt)("a",Object.assign({parentName:"p"},{href:"https://hyperjumptech.github.io/monika/guides/probes#probe-response-anatomy"}),"Probe Response Anatomy")," in order to know which value could be used from the response body for the next request(s)."),(0,s.kt)("p",null,"In the sections below, you can find several examples of configuration file which contains chaining requests."),(0,s.kt)("h3",Object.assign({},{id:"pass-response-data-as-pathquery-parameters"}),"Pass Response Data as Path/Query Parameters",(0,s.kt)("a",Object.assign({parentName:"h3"},{href:"#pass-response-data-as-pathquery-parameters",title:"Direct link to heading",className:"anchor"}),(0,s.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,s.kt)("p",null,"Here is an example of using previous request's response in the path/query parameters:"),(0,s.kt)("pre",null,(0,s.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"probes:\n  - id: '1'\n    name: Probing Github\n    description: simulate html form submission\n    interval: 10\n    requests:\n      - method: GET\n        url: https://reqres.in/api/users\n        timeout: 7000\n      - method: GET\n        url: https://reqres.in/api/users/{{ responses.[0].data.data.[0].id }}\n        timeout: 7000\n    incidentThreshold: 3\n    recoveryThreshold: 3\n    alerts:\n      - status-not-2xx\n      - response-time-greater-than-2000-ms\n")),(0,s.kt)("p",null,"In the configuration above, the first request will fetch all users from ",(0,s.kt)("inlineCode",{parentName:"p"},"https://reqres.in/api/users"),". Then in the second request, Monika will fetch the details of the first user from the first request. If there are no triggered alerts, the response returned from the first request is ready to be used by the second request using values from ",(0,s.kt)("inlineCode",{parentName:"p"},"{{ responses.[0].data }}"),"."),(0,s.kt)("p",null,"Let's say the response from fetching all users in JSON format as follows:"),(0,s.kt)("pre",null,(0,s.kt)("code",Object.assign({parentName:"pre"},{className:"language-json"}),'{\n  "page": 2,\n  "per_page": 6,\n  "total": 12,\n  "total_pages": 2,\n  "data": [\n    {\n        "id": 7,\n        "email": "michael.lawson@reqres.in",\n        "first_name": "Michael",\n        "last_name": "Lawson",\n        "avatar": "https://reqres.in/img/faces/7-image.jpg"\n    },\n    ...\n  ]\n}\n')),(0,s.kt)("p",null,"To use the user ID of the first user in the second request, we define the url of the second request as ",(0,s.kt)("inlineCode",{parentName:"p"},"{{ responses.[0].data.data.[0].id }}"),"."),(0,s.kt)("h3",Object.assign({},{id:"pass-response-data-as-headers-value"}),"Pass Response Data as Headers value",(0,s.kt)("a",Object.assign({parentName:"h3"},{href:"#pass-response-data-as-headers-value",title:"Direct link to heading",className:"anchor"}),(0,s.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,s.kt)("p",null,"Here is an example of using previous request's response in the headers:"),(0,s.kt)("pre",null,(0,s.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"probes:\n  - id: '1'\n    name: Probing Github\n    description: simulate html form submission\n    interval: 10\n    requests:\n      - method: POST\n        url: https://reqres.in/api/login\n        timeout: 7000\n        body:\n          email: eve.holt@reqres.in\n          password: cityslicka\n      - method: POST\n        url: https://reqres.in/api/users/\n        timeout: 7000\n        body:\n          name: morpheus\n          job: leader\n        headers:\n          Authorization: Bearer {{ responses.[0].data.token }}\n    incidentThreshold: 3\n    recoveryThreshold: 3\n    alerts:\n      - status-not-2xx\n      - response-time-greater-than-2000-ms\n")),(0,s.kt)("p",null,"Using the above configuration, Monika will perform login request in the first request, then use the returned token in the Authorization header of the second request."))}p.isMDXComponent=!0}},function(e){e.O(0,[547,778,860,774,888,179],(function(){return t=4536,e(e.s=t);var t}));var t=e.O();_N_E=t}]);