_N_E=(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[17],{LSgu:function(e,t,n){"use strict";n.r(t),n.d(t,"meta",(function(){return p})),n.d(t,"default",(function(){return h}));var a=n("wx14"),r=n("Ff2n"),i=n("q1tI"),o=n.n(i),l=n("7ljp"),s=n("er9C"),b=["children"],c=["components"],p=(o.a.createElement,{id:"probes",title:"Probes"}),d={meta:p},m=function(e){var t=e.children,n=Object(r.a)(e,b);return Object(l.b)(s.a,Object(a.a)({meta:p},n),t)};function h(e){var t=e.components,n=Object(r.a)(e,c);return Object(l.b)(m,Object(a.a)({},d,n,{components:t,mdxType:"MDXLayout"}),Object(l.b)("p",null,"Probes are the heart of the monitoring requests. Probes are arrays of request objects defined in the config file ",Object(l.b)("inlineCode",{parentName:"p"},"monika.yml")," like so."),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-yaml"},"probes:\n  - id: '1'\n    name: Name of the probe\n    description: Probe to check GET time\n    interval: 10\n    requests:\n      - {}\n    alerts: []\n  - id: '2'\n    name: Name of the probe 2\n    description: Probe to check GET health\n    interval: 10\n    requests:\n      - {}\n    alerts: []\n")),Object(l.b)("p",null,"Monika goes through each probe object, sends it out, and determines whether an alert or notification need to be sent out."),Object(l.b)("h2",{id:"probe-request-anatomy"},"Probe Request Anatomy",Object(l.b)("a",{parentName:"h2",href:"#probe-request-anatomy",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"An actual probe request may be something like below."),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-yaml"},"  probes: [\n    id: '1'\n    name: 'Example: get Time'\n    description: Probe\n    interval: 10\n    requests:\n    - method: POST\n      url: https://mybackend.org/user/login\n      timeout: 7000\n      saveBody: true\n      headers:\n        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhlbGxvIGZyb20gSHlwZXJqdW1wIiwiaWF0IjoxNTE2MjM5MDIyfQ.T2SbP1G39CMD4MMfkOZYGFgNIQgNkyi0sPdiFi_DfVA\n      body:\n        username: someusername\n        password: somepassword\n      alerts: ARRAY-HERE\n    incidentThreshold: 3\n    recoveryThreshold: 3\n    alerts:\n    - query: response.status != 200\n      message: HTTP response status is {{ response.status }}, expecting 200\n  ]\n")),Object(l.b)("p",null,"Details of the field are give in the table below."),Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",{parentName:"tr",align:"left"},"Topic"),Object(l.b)("th",{parentName:"tr",align:null},"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"method"),Object(l.b)("td",{parentName:"tr",align:null},"Http method such as GET, POST, PUT, DELETE.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"url"),Object(l.b)("td",{parentName:"tr",align:null},"This is the url endpoint to dispatch the request to.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"timeout"),Object(l.b)("td",{parentName:"tr",align:null},"Request timeout, after which time, ",Object(l.b)("inlineCode",{parentName:"td"},"Monika")," will assume timeout.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"headers"),Object(l.b)("td",{parentName:"tr",align:null},"Http headers you might need for your request.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"body"),Object(l.b)("td",{parentName:"tr",align:null},"Any http body if your method requires it.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"interval (optional)"),Object(l.b)("td",{parentName:"tr",align:null},"Number of probe's interval (in seconds). Default value is 10 seconds.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"incidentThreshold (optional)"),Object(l.b)("td",{parentName:"tr",align:null},"Number of times an alert should return true before Monika sends notifications. For example, when incidentThreshold is 3, Monika will only send notifications when the probed URL returns non-2xx status 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"recoveryThreshold (optional)"),Object(l.b)("td",{parentName:"tr",align:null},"Number of times an alert should return false before Monika sends notifications. For example, when recoveryThreshold is 3, Monika will only send notifications when the probed URL returns status 2xx 3 times in a row. After sending the notifications, Monika will not send notifications anymore until the alert status changes. Default value is 5.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"alerts"),Object(l.b)("td",{parentName:"tr",align:null},"The condition which will trigger an alert, and the subsequent notification method to send out the alert. See below for further details on alerts and notifications.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"saveBody (optional)"),Object(l.b)("td",{parentName:"tr",align:null},"When set to true, the response body of the request is stored in the internal database. The default is off when not defined. This is to keep the log files size small as some responses can be sizeable. The setting is for each probe request.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"alerts (optional)"),Object(l.b)("td",{parentName:"tr",align:null},"See ",Object(l.b)("a",{parentName:"td",href:"./alerts"},"alerts")," section for detailed information.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"ping (optional)"),Object(l.b)("td",{parentName:"tr",align:null},"(boolean), If set true then send a PING to the specified url instead.")))),Object(l.b)("h3",{id:"ping"},"PING",Object(l.b)("a",{parentName:"h3",href:"#ping",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"You can send an ICMP echo request, to a specific url by enabling the ",Object(l.b)("inlineCode",{parentName:"p"},"ping: true")," field.\nIn this mode the http method is ignored and a PING echo request is sent to the specified url."),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-yaml"},"probes:\n  - id: 'ping_test'\n    name: ping_test\n    description: requesting icmp ping\n    interval: 10\n    requests:\n      - url: http://google.com\n        ping: true\n")),Object(l.b)("h2",{id:"probe-response-anatomy"},"Probe Response Anatomy",Object(l.b)("a",{parentName:"h2",href:"#probe-response-anatomy",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"The default shape of a response when Monika has successfully fetched a request is as the following."),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-yaml"},"status: 200\nstatusText: OK\nheaders:\n  test-header: ...\nconfig:\n  url: https://reqres.in/api/users\n  method: GET\n  data:\n    mydata: value\n  headers:\n    Accept: application/json, text/plain, */*\n    User-Agent: axios/0.21.1\ndata: ...\n")),Object(l.b)("p",null,"Details of the fields are shown in the table below."),Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",{parentName:"tr",align:"left"},"Topic"),Object(l.b)("th",{parentName:"tr",align:null},"Description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"status"),Object(l.b)("td",{parentName:"tr",align:null},"HTTP Status Code (e.g 200, 403, 500)")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"statusText"),Object(l.b)("td",{parentName:"tr",align:null},"HTTP Status Code Explanation (e.g OK, Forbidden, Internal Server Error)")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"config"),Object(l.b)("td",{parentName:"tr",align:null},"Request configuration (e.g URL, Method, Data, Headers, Body, etc.)")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"headers"),Object(l.b)("td",{parentName:"tr",align:null},"Response headers from the fetched request (e.g SetCookie, ETag, etc.).")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",{parentName:"tr",align:"left"},"data"),Object(l.b)("td",{parentName:"tr",align:null},"Response payload from the fetched request (e.g token, results, data).")))),Object(l.b)("p",null,"Probe response data could be used for ",Object(l.b)("a",{parentName:"p",href:"https://hyperjumptech.github.io/monika/guides/examples#requests-chaining"},"Request Chaining"),"."),Object(l.b)("h2",{id:"execution-order"},"Execution order",Object(l.b)("a",{parentName:"h2",href:"#execution-order",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"In a configuration with multiple probes, ",Object(l.b)("inlineCode",{parentName:"p"},"Monika")," will perform the requests in sequence in the order that they are entered, one after another. When the ",Object(l.b)("inlineCode",{parentName:"p"},"--id")," flag is used, the sequence of IDs are executed as entered."),Object(l.b)("p",null,"On completion, ",Object(l.b)("inlineCode",{parentName:"p"},"Monika")," will sleep until the next interval to start again. At the top of the ",Object(l.b)("inlineCode",{parentName:"p"},"monika.yml")," file there is an ",Object(l.b)("inlineCode",{parentName:"p"},"interval")," setting. The execution will be restarted after every ",Object(l.b)("inlineCode",{parentName:"p"},"interval"),". If interval is shorter than the amount of time to dispatch all the requests, then ",Object(l.b)("inlineCode",{parentName:"p"},"Monika")," will immediately repeat after the last probe response and any notification alerts sent. When the ",Object(l.b)("inlineCode",{parentName:"p"},"--repeat")," flag is set with a value, Monika will not run indefinitely, instead, it will stop after executing the probes as many times as specified."),Object(l.b)("h2",{id:"content-type-header"},"Content-Type header",Object(l.b)("a",{parentName:"h2",href:"#content-type-header",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"Currently, Monika only supports Content-Type value ",Object(l.b)("inlineCode",{parentName:"p"},"application/x-www-form-urlencoded")," and ",Object(l.b)("inlineCode",{parentName:"p"},"application/json")," with UTF-8 encoding."),Object(l.b)("h2",{id:"request-body"},"Request Body",Object(l.b)("a",{parentName:"h2",href:"#request-body",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"By default, request body will be treated as-is. If request header's ",Object(l.b)("inlineCode",{parentName:"p"},"Content-Type")," is set to ",Object(l.b)("inlineCode",{parentName:"p"},"application/x-www-form-urlencoded"),", it will be serialized into URL-safe string in UTF-8 encoding."),Object(l.b)("h2",{id:"postman-json-file-support"},"Postman JSON file support",Object(l.b)("a",{parentName:"h2",href:"#postman-json-file-support",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"To run monika using a ",Object(l.b)("a",{parentName:"p",href:"https://www.postman.com/"},"Postman")," JSON file, use ",Object(l.b)("inlineCode",{parentName:"p"},"--postman")," flag as follows:"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-bash"},"monika --postman <path_to_postman_file>\n")),Object(l.b)("h2",{id:"insomnia-file-support"},"Insomnia file support",Object(l.b)("a",{parentName:"h2",href:"#insomnia-file-support",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"Monika supports ",Object(l.b)("a",{parentName:"p",href:"https://insomnia.rest/"},"Insomnia")," collection file in ",Object(l.b)("strong",{parentName:"p"},"version 4")," format. Both ",Object(l.b)("inlineCode",{parentName:"p"},"json")," and ",Object(l.b)("inlineCode",{parentName:"p"},"yaml")," files are supported.\nTo run Monika using an Insomnia collection file, use ",Object(l.b)("inlineCode",{parentName:"p"},"--insomnia")," flag as follows:"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-bash"},"monika --insomnia <path_to_insomnia_file>\n")),Object(l.b)("h2",{id:"har-file-support"},"HAR file support",Object(l.b)("a",{parentName:"h2",href:"#har-file-support",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("p",null,"HAR ",Object(l.b)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/HAR_(file_format)"},"HTTP-Archive")," format was created by the Web Performance Working Group and has become the standard in browser archive request data definition. To run monika using a HAR file, use ",Object(l.b)("inlineCode",{parentName:"p"},"--har")," flag as follows:"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-bash"},"monika --har <path_to_HAR_file>\n")),Object(l.b)("h2",{id:"further-reading"},"Further reading",Object(l.b)("a",{parentName:"h2",href:"#further-reading",title:"Direct link to heading",className:"anchor"},Object(l.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(l.b)("ol",null,Object(l.b)("li",{parentName:"ol"},Object(l.b)("a",{parentName:"li",href:"./alerts"},"Alerts")),Object(l.b)("li",{parentName:"ol"},Object(l.b)("a",{parentName:"li",href:"./notifications"},"Notifications"))))}h.isMDXComponent=!0},nDaH:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/guides/probes",function(){return n("LSgu")}])}},[["nDaH",0,1,2,3,4,5]]]);