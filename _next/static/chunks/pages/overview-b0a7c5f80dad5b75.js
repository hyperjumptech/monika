(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[709],{3813:function(e,t,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/overview",function(){return a(7070)}])},7070:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return c},meta:function(){return o}});a(7294);var n=a(3905),i=a(4512);function s(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},s=Object.keys(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var o={id:"overview",title:"Overview"},r={meta:o},l=function(e){var t=e.children,a=s(e,["children"]);return(0,n.kt)(i.C,Object.assign({meta:o},a),t)};function c(e){var t=e.components,a=s(e,["components"]);return(0,n.kt)(l,Object.assign({},r,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Monika is an ",(0,n.kt)("strong",{parentName:"p"},"open source")," and ",(0,n.kt)("strong",{parentName:"p"},"free synthetic monitoring"),' command line application. The name Monika stands for "',(0,n.kt)("strong",{parentName:"p"},"Moni"),"toring Ber",(0,n.kt)("strong",{parentName:"p"},"ka"),'la", which means "periodic monitoring" in the Indonesian language.'),(0,n.kt)("h2",Object.assign({},{id:"how-it-works"}),"How it works",(0,n.kt)("a",Object.assign({parentName:"h2"},{href:"#how-it-works",title:"Direct link to heading",className:"anchor"}),(0,n.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,n.kt)("p",null,"Monika operates by reading everything from a configuration file. Based on the configuration, it will build and send out HTTP or TCP requests. If the request's response is not as expected, Monika will send notification via various channels (E-mail, webhook, Telegram, WhatsApp, and many more)."),(0,n.kt)("p",null,"For more information, please refer to the detailed documentations below."),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",Object.assign({parentName:"tr"},{align:null}),"Topic"),(0,n.kt)("th",Object.assign({parentName:"tr"},{align:null}),"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),(0,n.kt)("a",Object.assign({parentName:"td"},{href:"/guides/probes"}),"Probes")),(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),"How requests are set up and dispatched")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),(0,n.kt)("a",Object.assign({parentName:"td"},{href:"/guides/alerts"}),"Alerts")),(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),"How alerts are triggered and how to setup an alert")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),(0,n.kt)("a",Object.assign({parentName:"td"},{href:"/guides/notifications"}),"Notifications")),(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),"How to receive notifications when alerts are triggered")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),(0,n.kt)("a",Object.assign({parentName:"td"},{href:"/guides/tls-checkers"}),"TLS Checkers")),(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),"Check TLS validity and send notification before the expiry time")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),(0,n.kt)("a",Object.assign({parentName:"td"},{href:"/guides/cli-options"}),"CLI Options")),(0,n.kt)("td",Object.assign({parentName:"tr"},{align:null}),"How to run monika from the command line")))),(0,n.kt)("h2",Object.assign({},{id:"features"}),"Features",(0,n.kt)("a",Object.assign({parentName:"h2"},{href:"#features",title:"Direct link to heading",className:"anchor"}),(0,n.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,n.kt)("p",null,"Monika has grown rapidly since its conception and currently it has variety of the following features."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"Monitor ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/probes"}),"multiple probes")," in which each probes can contain multiple HTTP requests."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/examples#requests-chaining"}),"Request chaining")," to use data from a response in subsequent requests."),(0,n.kt)("li",{parentName:"ul"},"Monitor ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/probes#tcp"}),"TCP servers"),"."),(0,n.kt)("li",{parentName:"ul"},"Get notifications when an alert is triggered via a growing number of ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/notifications"}),"notification channels"),"."),(0,n.kt)("li",{parentName:"ul"},"Run Monika or create configuration file from a ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/probes#har-file-support"}),"HAR file"),", a ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/probes#postman-json-file-support"}),"Postman file"),", an ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/probes#insomnia-file-support"}),"Insomnia file"),", and a ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/cli-options#sitemap"}),"sitemap file"),"."),(0,n.kt)("li",{parentName:"ul"},"Check ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/tls-checkers"}),"TLS certificate status"),"."),(0,n.kt)("li",{parentName:"ul"},"Create complex ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/alerts#alert-query"}),"alert's query")," to trigger an alert based on the response's status code, response's time, size, headers, and the received data."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/quick-start#run-monika"}),"Run Monika from a URL"),"."),(0,n.kt)("li",{parentName:"ul"},"Receive periodical ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/status-notification"}),"status notification")," about the status of Monika and the probes."),(0,n.kt)("li",{parentName:"ul"},"Connect to ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/cli-options#prometheus"}),"Prometheus"),"."),(0,n.kt)("li",{parentName:"ul"},"Run Monika from ",(0,n.kt)("a",Object.assign({parentName:"li"},{href:"/guides/cli-options#multiple-configurations"}),"multiple configuration files"),".")),(0,n.kt)("h2",Object.assign({},{id:"motivation"}),"Motivation",(0,n.kt)("a",Object.assign({parentName:"h2"},{href:"#motivation",title:"Direct link to heading",className:"anchor"}),(0,n.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,n.kt)("p",null,"Anyone who has created a website or a backend service would want them to be fast, robust and perform well all the time. Good design, engineering excellence, and proper processes will contribute to these goals. Yet, what is often overlooked is the importance of monitoring tools have on a project's success. Hence the budget for some type of monitoring tool is often marked as optional rather than a must have. This what motivates us. We believe proper monitoring tools must be setup from the very beginning. Any development team should integrate monitoring tools in their development process. Then they should be able to extend it into production deployment."),(0,n.kt)("h3",Object.assign({},{id:"not-just-another-tool"}),"Not just another tool",(0,n.kt)("a",Object.assign({parentName:"h3"},{href:"#not-just-another-tool",title:"Direct link to heading",className:"anchor"}),(0,n.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,n.kt)("p",null,"There are plenty of free monitoring tools online, but many fall short of our requirements. Free uptime monitors exists, but they only ping for service's availability. Most users don't use services only with pings. There are also plenty of real time monitoring tools. These tools need real users, which make them less suitable during development. Monika however, can synthesize usage scenarios during development, and you can use the same scenarios in production. ",(0,n.kt)("strong",{parentName:"p"},"Synthetic monitoring")," tool like Monika enables you to generate complex usage flows for quality assurance. Those same flows later on can be deployed to check the production environment. All without the need to install agents or third party libraries."),(0,n.kt)("p",null,"In addition, Monika is relatively easy to deploy. You can deploy Monika to multiple servers in different locations (for example via ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"/tutorial/run-in-docker"}),"Docker"),"). Afterwards, Monika can generate and send notifications when service's degradation is detected from any of the locations. ",(0,n.kt)("strong",{parentName:"p"},"All these features are available for free"),"."),(0,n.kt)("h3",Object.assign({},{id:"open-source"}),"Open source",(0,n.kt)("a",Object.assign({parentName:"h3"},{href:"#open-source",title:"Direct link to heading",className:"anchor"}),(0,n.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,n.kt)("p",null,"Monika is ",(0,n.kt)("strong",{parentName:"p"},"open source")," and ",(0,n.kt)("strong",{parentName:"p"},"free")," because we want it to be available even for budget strapped teams. Monika's source code is always open for inspection. Follow any updates or give feedbacks through our ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://github.com/hyperjumptech/monika/discussions"}),"discussion forum"),". You can also contribute to this project by reporting and fixing bugs or by ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"/guides/new-notifications"}),"adding a new notification channel"),"."))}c.isMDXComponent=!0}},function(e){e.O(0,[547,50,512,774,888,179],(function(){return t=3813,e(e.s=t);var t}));var t=e.O();_N_E=t}]);