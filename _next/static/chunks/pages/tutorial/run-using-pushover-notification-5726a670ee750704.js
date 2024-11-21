(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[334],{2602:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/tutorial/run-using-pushover-notification",function(){return n(2433)}])},2433:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return l},meta:function(){return s}});var o=n(9534),a=(n(7294),n(3905)),i=n(2290),s={id:"run-using-pushover-notification",title:"Run using Pushover Notification"},r={meta:s},u=function(e){var t=e.children,n=(0,o.Z)(e,["children"]);return(0,a.kt)(i.C,Object.assign({meta:s},n),t)};function l(e){var t=e.components,n=(0,o.Z)(e,["components"]);return(0,a.kt)(u,Object.assign({},r,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"This tutorial will show you how to integrate Monika with Pushover to get your Monika notifications through your Pushover clients."),(0,a.kt)("h2",Object.assign({},{id:"setup-pushover"}),"Setup Pushover",(0,a.kt)("a",Object.assign({parentName:"h2"},{href:"#setup-pushover",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("p",null,"To use Pushover with Monika, head to ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://pushover.net"}),"https://pushover.net")," and create an account. Then, you need to confirm your email. After that, log in to the dashboard and pay attention to the \u201c",(0,a.kt)("strong",{parentName:"p"},"Your User Key"),"\u201d. Save the user key to a safe place as we are going to need it later."),(0,a.kt)("img",Object.assign({},{src:"https://miro.medium.com/max/1400/1*CNvmMECn2qm2_qT5Jge7Mw.png",alt:null})),(0,a.kt)("p",null,"Then, scroll down to the bottom of the page. Click the ",(0,a.kt)("strong",{parentName:"p"},"Create a new Application/API Token"),". Fill out the forms, and click ",(0,a.kt)("strong",{parentName:"p"},"Create Application"),". You should see your ",(0,a.kt)("strong",{parentName:"p"},"API Token/Key.")," Save the token to a safe place as we are going to need it later."),(0,a.kt)("img",Object.assign({},{src:"https://miro.medium.com/max/1400/1*ECMUAviGQlkJmLzE-e6j_A.png",alt:null})),(0,a.kt)("p",null,"After you created the API Token, go back to the main Dashboard. Then, click the ",(0,a.kt)("strong",{parentName:"p"},"Add Phone, Tablet, or Desktop"),". For this case, use the ",(0,a.kt)("strong",{parentName:"p"},"Pushover for Desktop"),". Then, enter your Device Name and click ",(0,a.kt)("strong",{parentName:"p"},"Register Web Browser"),". You will be redirected to your created Pushover desktop client."),(0,a.kt)("img",Object.assign({},{src:"https://miro.medium.com/max/1400/1*0Ta1LgUKTRYTBU60T6AXMg.png",alt:null})),(0,a.kt)("p",null,"Once that\u2019s done, it\u2019s time to configure Monika to integrate with the Pushover desktop client."),(0,a.kt)("h2",Object.assign({},{id:"integrate-monika-with-pushover"}),"Integrate Monika with Pushover",(0,a.kt)("a",Object.assign({parentName:"h2"},{href:"#integrate-monika-with-pushover",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("p",null,"Now that we have our User and API Token from Pushover, it\u2019s time to create a Monika configuration called ",(0,a.kt)("inlineCode",{parentName:"p"},"monika.yml")),(0,a.kt)("pre",null,(0,a.kt)("code",Object.assign({parentName:"pre"},{}),"notifications:\n  - id: pushover-notification\n    type: pushover\n    data:\n      token: <YOUR_PUSHOVER_API_TOKEN>\n      user: <YOUR_PUSHOVER_USER_KEY>\nprobes:\n  - id: 6a31bcff-48f1-40b0-98aa-8c7610f4f428\n    name: Localhost\n    description: ''\n    requests:\n      - url: http://localhost:8080/health\n        method: GET\n        headers: {}\n        body: '{}'\n        timeout: 0\n    alerts:\n      - query: response.status < 200 or response.status > 299\n        message: HTTP Status is not 200\n      - query: response.time > 2000\n        message: Response time is more than 2000ms\n")),(0,a.kt)("p",null,"Let\u2019s take a look at the configuration above:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"The Pushover notification channel will use the API Token and User Key you created from the previous step."),(0,a.kt)("li",{parentName:"ul"},"It will probe ",(0,a.kt)("a",Object.assign({parentName:"li"},{href:"https://www.google.com%2C/"}),"http://localhost:8080/health,")," with the method GET"),(0,a.kt)("li",{parentName:"ul"},"It will alert you if the response status code is not 200, or the response time is longer than two seconds")),(0,a.kt)("p",null,"Once that\u2019s done, run Monika with the configuration above with the command ",(0,a.kt)("inlineCode",{parentName:"p"},"monika -c monika.yml")),(0,a.kt)("img",Object.assign({},{src:"https://miro.medium.com/max/1400/0*WRJ6XIrycynPulRw.png",alt:null})),(0,a.kt)("p",null,"Congratulations! You have successfully integrated Monika with Pushover! Note that Pushover integration is only available from the Monika version 1.8.0."))}l.isMDXComponent=!0}},function(e){e.O(0,[357,513,290,774,888,179],(function(){return t=2602,e(e.s=t);var t}));var t=e.O();_N_E=t}]);