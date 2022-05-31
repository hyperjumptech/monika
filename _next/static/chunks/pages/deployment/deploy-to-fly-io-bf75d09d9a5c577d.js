(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[80],{6079:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/deployment/deploy-to-fly-io",function(){return n(5260)}])},5260:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return c},meta:function(){return l}});n(7294);var a=n(3905),o=n(1860);function i(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l={id:"deploy-to-fly-io",title:"Deploy to Fly.io"},r={meta:l},p=function(e){var t=e.children,n=i(e,["children"]);return(0,a.kt)(o.C,Object.assign({meta:l},n),t)};function c(e){var t=e.components,n=i(e,["components"]);return(0,a.kt)(p,Object.assign({},r,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"This article covers how to deploy a Monika instance to Fly.io."),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Go to the ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://github.com/hyperjumptech/monika"}),"Monika Github repository")," and download two files: Dockerfile.flyio and fly.toml.example")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Rename the ",(0,a.kt)("inlineCode",{parentName:"p"},"fly.toml.example")," to fly.toml`.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Edit the contents of the fly.toml:"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",Object.assign({parentName:"pre"},{className:"language-toml"}),'app = "monika" # Change the app name to the desired name\n\nkill_signal = "SIGINT"\nkill_timeout = 5\n\n[build]\ndockerfile = "Dockerfile.flyio"\n\n[build.args]\nPARAMS = "-v" # Change the parameters according to your needs\n\n[env]\nPARAMS = "-v" # Match the content of this PARAMS variable to the one in `build.args` block\n\n[experimental]\nauto_rollback = true\n')),(0,a.kt)("p",{parentName:"li"},"Refer to the ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://fly.io/docs/reference/configuration/"}),"Fly.io App Configuration Docs")," to customize the example TOML even further.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Install ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://fly.io/docs/flyctl/installing/"}),"Fly.io CLI tools")," (",(0,a.kt)("inlineCode",{parentName:"p"},"flyctl"),") in your computer")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"a. Proceed to authenticate to Fly.io by running ",(0,a.kt)("inlineCode",{parentName:"p"},"flyctl auth login")," in your terminal."),(0,a.kt)("p",{parentName:"li"},"b. If you haven't signed up to Fly.io yet, you can sign up by running ",(0,a.kt)("inlineCode",{parentName:"p"},"flyctl auth signup")," in your terminal.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Create a new Fly.io app by running ",(0,a.kt)("inlineCode",{parentName:"p"},"flyctl apps create")," and enter the app name according to your ",(0,a.kt)("inlineCode",{parentName:"p"},"fly.toml")," you have created before.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Deploy Monika to your Fly.io by running ",(0,a.kt)("inlineCode",{parentName:"p"},"flyctl deploy"))),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Wait until the deployment is finished, and check Monika logs from the Fly.io dashboard to confirm that your Monika instance is running."))))}c.isMDXComponent=!0}},function(e){e.O(0,[547,778,860,774,888,179],(function(){return t=6079,e(e.s=t);var t}));var t=e.O();_N_E=t}]);