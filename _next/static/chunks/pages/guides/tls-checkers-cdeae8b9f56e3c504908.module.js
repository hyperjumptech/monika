(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[14],{JTcQ:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/guides/tls-checkers",function(){return n("lbSf")}])},lbSf:function(e,t,n){"use strict";n.r(t),n.d(t,"meta",(function(){return o})),n.d(t,"default",(function(){return u}));var a=n("wx14"),r=n("Ff2n"),l=n("q1tI"),b=n.n(l),c=n("7ljp"),i=n("er9C"),o=(b.a.createElement,{}),m={meta:o},p=e=>{var{children:t}=e,n=Object(r.a)(e,["children"]);return Object(c.b)(i.a,Object(a.a)({meta:o},n),t)};function u(e){var{components:t}=e,n=Object(r.a)(e,["components"]);return Object(c.b)(p,Object(a.a)({},m,n,{components:t,mdxType:"MDXLayout"}),Object(c.b)("h1",{id:"tls-checkers"},"TLS Checkers",Object(c.b)("a",{parentName:"h1",href:"#tls-checkers",title:"Direct link to heading",className:"anchor"},Object(c.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(c.b)("p",null,"You can check TLS validity and set the threshold to send notification before the expiry time."),Object(c.b)("pre",null,Object(c.b)("code",{parentName:"pre",className:"language-json"},'{\n  "probes": [{ "requests": [{ "url": "http://example.com" }] }],\n  "certificate": {\n    "domains": ["example.com", "expired.badssl.com"],\n    "reminder": 30\n  }\n}\n')),Object(c.b)("table",null,Object(c.b)("thead",{parentName:"table"},Object(c.b)("tr",{parentName:"thead"},Object(c.b)("th",{parentName:"tr",align:null},"Name"),Object(c.b)("th",{parentName:"tr",align:null},"Data Type"),Object(c.b)("th",{parentName:"tr",align:null},"Required"),Object(c.b)("th",{parentName:"tr",align:null},"Default Value"),Object(c.b)("th",{parentName:"tr",align:null},"Description"))),Object(c.b)("tbody",{parentName:"table"},Object(c.b)("tr",{parentName:"tbody"},Object(c.b)("td",{parentName:"tr",align:null},"domains"),Object(c.b)("td",{parentName:"tr",align:null},"Array"),Object(c.b)("td",{parentName:"tr",align:null},"true"),Object(c.b)("td",{parentName:"tr",align:null},"-"),Object(c.b)("td",{parentName:"tr",align:null},"The list of domains to check.")),Object(c.b)("tr",{parentName:"tbody"},Object(c.b)("td",{parentName:"tr",align:null},"reminder"),Object(c.b)("td",{parentName:"tr",align:null},"Number"),Object(c.b)("td",{parentName:"tr",align:null},"false"),Object(c.b)("td",{parentName:"tr",align:null},"30"),Object(c.b)("td",{parentName:"tr",align:null},"The number of days to send notification to user before the domain expires.")))))}u.isMDXComponent=!0}},[["JTcQ",0,1,2,3,4]]]);