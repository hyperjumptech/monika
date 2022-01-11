(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[12],{"+72/":function(e,t,n){"use strict";n.r(t),n.d(t,"meta",(function(){return l})),n.d(t,"default",(function(){return u}));var a=n("wx14"),s=n("Ff2n"),i=n("q1tI"),o=n.n(i),r=n("7ljp"),c=n("er9C"),l=(o.a.createElement,{id:"configuration-file",title:"Configuration File"}),p={meta:l},b=e=>{var{children:t}=e,n=Object(s.a)(e,["children"]);return Object(r.b)(c.a,Object(a.a)({meta:l},n),t)};function u(e){var{components:t}=e,n=Object(s.a)(e,["components"]);return Object(r.b)(b,Object(a.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(r.b)("p",null,"Monika uses a YAML file format to describe all the settings and configurations. A sample is included in the pproject can be seen ",Object(r.b)("inlineCode",{parentName:"p"},"monika.example.yml")),Object(r.b)("p",null,"The following are a summary of their settings. In general Monika and its configuration file, ",Object(r.b)("inlineCode",{parentName:"p"},"monika.yml")," is divided into three sections. A probe, an alert and a notification section."),Object(r.b)("h2",{id:"probes"},"Probes",Object(r.b)("a",{parentName:"h2",href:"#probes",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Probes describe the request(s) to perform on your service to test. A probe will include the request, the http url to test, its method, timeout and any headers that you might wish to add.."),Object(r.b)("p",null,"Here is an example probe:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"probes:\n  - id: 'submission_test'\n    name: HTML form submission\n    description: simulate html form submission\n    interval: 10\n    requests:\n      - url: https://httpbin.org/status/200\n        method: POST\n        timeout: 7000\n        headers:\n          Content-Type: application/x-www-form-urlencoded\n")),Object(r.b)("p",null,"For further details on probes, check the ",Object(r.b)("a",{parentName:"p",href:"https://monika.hyperjump.tech/guides/probes"},"guide here"),"."),Object(r.b)("h2",{id:"alerts"},"Alerts",Object(r.b)("a",{parentName:"h2",href:"#alerts",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Alerts are part of probes, and describe the conditions to trigger an alert. Alerts are basicaly test condition for your service, such as http status, response time, or a particular response body."),Object(r.b)("p",null,"The sample below shows an alert will be generated if http response status is 500 or the response time is greater than 150ms."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"alerts:\n  - query: response.status == 500\n    message: resonse status is 500\n  - query: response.time > 150\n    message: response time is slow\n")),Object(r.b)("p",null,"For details on alerts and how you can configure different triggers, see the ",Object(r.b)("a",{parentName:"p",href:"https://monika.hyperjump.tech/guides/alerts"},"guide here")," here."),Object(r.b)("h2",{id:"notifications"},"Notifications",Object(r.b)("a",{parentName:"h2",href:"#notifications",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Once an alert is triggered, Monika can send a notification through any of the supported channels."),Object(r.b)("p",null,"A simple desktop alert for instance is done in two lines, see below:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"notifications:\n  - id: my-desktop-notif\n    type: desktop\n\n")),Object(r.b)("p",null,"Monika supports standard channels such as email smtp:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"notifications:\n  - id: random-string-smtp\n    type: smtp\n    data:\n      recipients: [RECIPIENT_EMAIL_ADDRESS]\n      hostname: SMTP_HOSTNAME\n      port: 587\n      username: SMTP_USERNAME\n      password: SMTP_PASSWORD\n")),Object(r.b)("p",null,"Monika also support a wide variety of chat channels such as whatsapp, discord, Google chat, and even Lark Suite:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"notifications:\n  - id: myGoogleChatNotif\n    type: google-chat\n    data:\n      url: https://chat.googleapis.com/v1/spaces/XXXXX/messages?key=1122334455\n\n")),Object(r.b)("p",null,"For the complete list of the different notification channels supported, visit the ",Object(r.b)("a",{parentName:"p",href:"https://monika.hyperjump.tech/guides/notifications"},"guide here"),"."))}u.isMDXComponent=!0},EyYY:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/guides/configuration-file",function(){return n("+72/")}])}},[["EyYY",0,1,2,3,4]]]);