(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[737],{279:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/guides/configuration-file",function(){return n(8919)}])},8919:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return p},meta:function(){return r}});n(7294);var a=n(3905),s=n(4512);function i(e,t){if(null==e)return{};var n,a,s=function(e,t){if(null==e)return{};var n,a,s={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(s[n]=e[n])}return s}var r={id:"configuration-file",title:"Configuration File"},o={meta:r},l=function(e){var t=e.children,n=i(e,["children"]);return(0,a.kt)(s.C,Object.assign({meta:r},n),t)};function p(e){var t=e.components,n=i(e,["components"]);return(0,a.kt)(l,Object.assign({},o,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Monika uses a YAML file format to describe all the settings and configurations. A sample is included in the project in the file ",(0,a.kt)("inlineCode",{parentName:"p"},"monika.example.yml")),(0,a.kt)("p",null,"The following are a summary of their settings. In general Monika and its configuration file, ",(0,a.kt)("inlineCode",{parentName:"p"},"monika.yml")," is divided into three sections. A probe, an alert and a notification section."),(0,a.kt)("h2",Object.assign({},{id:"probes"}),"Probes",(0,a.kt)("a",Object.assign({parentName:"h2"},{href:"#probes",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("p",null,"Probes describe the request(s) to perform on your service to test. A probe will include the request, the http url to test, its method, timeout and any headers that you might wish to add.."),(0,a.kt)("p",null,"Here is an example probe:"),(0,a.kt)("pre",null,(0,a.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"probes:\n  - id: 'submission_test'\n    name: HTML form submission\n    description: simulate html form submission\n    interval: 10\n    requests:\n      - url: https://httpbin.org/status/200\n        method: POST\n        timeout: 7000\n        headers:\n          Content-Type: application/x-www-form-urlencoded\n")),(0,a.kt)("p",null,"For further details on probes, check the ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://monika.hyperjump.tech/guides/probes"}),"guide here"),"."),(0,a.kt)("h2",Object.assign({},{id:"alerts"}),"Alerts",(0,a.kt)("a",Object.assign({parentName:"h2"},{href:"#alerts",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("p",null,"Alerts are part of probes, and describe the conditions to trigger an alert. Alerts are basically test conditions for your service, such as http status, response time, or a particular response body."),(0,a.kt)("p",null,"The sample below shows an alert will be generated if http response status is 500 or the response time is greater than 150ms."),(0,a.kt)("pre",null,(0,a.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"alerts:\n  - query: response.status == 500\n    message: response status is 500\n  - query: response.time > 150\n    message: response time is slow\n")),(0,a.kt)("p",null,"For details on alerts and how you can configure different triggers, see the ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://monika.hyperjump.tech/guides/alerts"}),"guide here")," here."),(0,a.kt)("h2",Object.assign({},{id:"notifications"}),"Notifications",(0,a.kt)("a",Object.assign({parentName:"h2"},{href:"#notifications",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("p",null,"Once an alert is triggered, Monika can send a notification through any of the supported channels."),(0,a.kt)("p",null,"A simple desktop alert for instance is done in two lines, see below:"),(0,a.kt)("pre",null,(0,a.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"notifications:\n  - id: my-desktop-notif\n    type: desktop\n")),(0,a.kt)("p",null,"Monika supports standard channels such as email smtp:"),(0,a.kt)("pre",null,(0,a.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"notifications:\n  - id: random-string-smtp\n    type: smtp\n    data:\n      recipients: [RECIPIENT_EMAIL_ADDRESS]\n      hostname: SMTP_HOSTNAME\n      port: 587\n      username: SMTP_USERNAME\n      password: SMTP_PASSWORD\n")),(0,a.kt)("p",null,"Monika also support a wide variety of chat channels such as whatsapp, discord, Google chat, and even Lark Suite:"),(0,a.kt)("pre",null,(0,a.kt)("code",Object.assign({parentName:"pre"},{className:"language-yaml"}),"notifications:\n  - id: myGoogleChatNotif\n    type: google-chat\n    data:\n      url: https://chat.googleapis.com/v1/spaces/XXXXX/messages?key=1122334455\n")),(0,a.kt)("p",null,"For the complete list of the different notification channels supported, visit the ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://monika.hyperjump.tech/guides/notifications"}),"guide here"),"."))}p.isMDXComponent=!0}},function(e){e.O(0,[547,50,512,774,888,179],(function(){return t=279,e(e.s=t);var t}));var t=e.O();_N_E=t}]);