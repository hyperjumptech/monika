(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[4],{"2qu3":function(e,t,r){"use strict";var n=r("oI91");function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}t.__esModule=!0,t.default=void 0;var i,l=(i=r("q1tI"))&&i.__esModule?i:{default:i},s=r("8L3h"),c=r("jwwS");var d=[],u=[],p=!1;function m(e){var t=e(),r={loading:!0,loaded:null,error:null};return r.promise=t.then(e=>(r.loading=!1,r.loaded=e,e)).catch(e=>{throw r.loading=!1,r.error=e,e}),r}function f(e){var t={loading:!1,loaded:{},error:null},r=[];try{Object.keys(e).forEach(n=>{var a=m(e[n]);a.loading?t.loading=!0:(t.loaded[n]=a.loaded,t.error=a.error),r.push(a.promise),a.promise.then(e=>{t.loaded[n]=e}).catch(e=>{t.error=e})})}catch(n){t.error=n}return t.promise=Promise.all(r).then(e=>(t.loading=!1,e)).catch(e=>{throw t.loading=!1,e}),t}function b(e,t){return l.default.createElement(function(e){return e&&e.__esModule?e.default:e}(e),t)}function g(e,t){var r=Object.assign({loader:null,loading:null,delay:200,timeout:null,render:b,webpack:null,modules:null},t),n=null;function a(){if(!n){var t=new h(e,r);n={getCurrentValue:t.getCurrentValue.bind(t),subscribe:t.subscribe.bind(t),retry:t.retry.bind(t),promise:t.promise.bind(t)}}return n.promise()}if(!p&&"function"===typeof r.webpack){var o=r.webpack();u.push(e=>{for(var t of o)if(-1!==e.indexOf(t))return a()})}var i=(e,t)=>{a();var o=l.default.useContext(c.LoadableContext),i=(0,s.useSubscription)(n);return l.default.useImperativeHandle(t,()=>({retry:n.retry}),[]),o&&Array.isArray(r.modules)&&r.modules.forEach(e=>{o(e)}),l.default.useMemo(()=>i.loading||i.error?l.default.createElement(r.loading,{isLoading:i.loading,pastDelay:i.pastDelay,timedOut:i.timedOut,error:i.error,retry:n.retry}):i.loaded?r.render(i.loaded,e):null,[e,i])};return i.preload=()=>a(),i.displayName="LoadableComponent",l.default.forwardRef(i)}class h{constructor(e,t){this._loadFn=e,this._opts=t,this._callbacks=new Set,this._delay=null,this._timeout=null,this.retry()}promise(){return this._res.promise}retry(){this._clearTimeouts(),this._res=this._loadFn(this._opts.loader),this._state={pastDelay:!1,timedOut:!1};var{_res:e,_opts:t}=this;e.loading&&("number"===typeof t.delay&&(0===t.delay?this._state.pastDelay=!0:this._delay=setTimeout(()=>{this._update({pastDelay:!0})},t.delay)),"number"===typeof t.timeout&&(this._timeout=setTimeout(()=>{this._update({timedOut:!0})},t.timeout))),this._res.promise.then(()=>{this._update({}),this._clearTimeouts()}).catch(e=>{this._update({}),this._clearTimeouts()}),this._update({})}_update(e){this._state=o(o({},this._state),{},{error:this._res.error,loaded:this._res.loaded,loading:this._res.loading},e),this._callbacks.forEach(e=>e())}_clearTimeouts(){clearTimeout(this._delay),clearTimeout(this._timeout)}getCurrentValue(){return this._state}subscribe(e){return this._callbacks.add(e),()=>{this._callbacks.delete(e)}}}function v(e){return g(m,e)}function x(e,t){for(var r=[];e.length;){var n=e.pop();r.push(n(t))}return Promise.all(r).then(()=>{if(e.length)return x(e,t)})}v.Map=function(e){if("function"!==typeof e.render)throw new Error("LoadableMap requires a `render(loaded, props)` function");return g(f,e)},v.preloadAll=()=>new Promise((e,t)=>{x(d).then(e,t)}),v.preloadReady=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];return new Promise(t=>{var r=()=>(p=!0,t());x(u,e).then(r,r)})},window.__NEXT_PRELOADREADY=v.preloadReady;var y=v;t.default=y},"5Wrh":function(e,t,r){"use strict";r.d(t,"a",(function(){return o}));var n=r("q1tI"),a=r.n(n).a.createElement;function o(e){return e.outline?a(i,e,e.children):a("button",{className:"px-4 py-2 bg-gradient-to-r from-purple-monika to-aqua-monika font-sans text-white ".concat(e.className?e.className:""," ").concat(!1!==e.rounded?"rounded-full":"rounded-md")},e.children)}function i(e){return a("button",{className:"px-4 py-2 border-2 border-purple-monika text-purple-monika font-sans ".concat(e.className?e.className:""," ").concat(!1!==e.rounded?"rounded-full":"rounded-md")},e.children)}},"7ljp":function(e,t,r){"use strict";r.d(t,"a",(function(){return u})),r.d(t,"b",(function(){return f}));var n=r("q1tI"),a=r.n(n);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=a.a.createContext({}),d=function(e){var t=a.a.useContext(c),r=t;return e&&(r="function"===typeof e?e(t):l(l({},t),e)),r},u=function(e){var t=d(e.components);return a.a.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},m=a.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,i=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),u=d(r),m=n,f=u["".concat(i,".").concat(m)]||u[m]||p[m]||o;return r?a.a.createElement(f,l(l({ref:t},c),{},{components:r})):a.a.createElement(f,l({ref:t},c))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"===typeof e||n){var o=r.length,i=new Array(o);i[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"===typeof e?e:n,i[1]=l;for(var c=2;c<o;c++)i[c]=r[c];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,r)}m.displayName="MDXCreateElement"},"8Dvh":function(e){e.exports=JSON.parse('{"routes":[{"title":"Getting Started","heading":true,"routes":[{"title":"Overview","path":"/overview","editUrl":"/overview.md"},{"title":"Installation","path":"/installation","editUrl":"/installation.md"},{"title":"Quick Start","path":"/quick-start","editUrl":"/quick-start.md"}]},{"title":"Guides","heading":true,"routes":[{"title":"Probes","path":"/guides/probes","editUrl":"/guides/probes.md"},{"title":"Notifications","path":"/guides/notifications","editUrl":"/guides/notifications.md"},{"title":"Alerts","path":"/guides/alerts","editUrl":"/guides/alerts.md"},{"title":"TLS Checkers","path":"/guides/tls-checkers","editUrl":"/guides/tls-checkers.md"},{"title":"CLI Options","path":"/guides/cli-options","editUrl":"/guides/cli-options.md"}]},{"title":"Examples","heading":true,"routes":[{"title":"Minimal Configuration","path":"/guides/examples#minimal-configuration","editUrl":"/guides/examples.md"},{"title":"Enabling Notification","path":"/guides/examples#enabling-notification","editUrl":"/guides/examples.md"},{"title":"HTML Form Submission","path":"/guides/examples#html-form-submission-example","editUrl":"/guides/examples.md"},{"title":"Multiple Request","path":"/guides/examples#multiple-request","editUrl":"/guides/examples.md"},{"title":"Requests Chaining","path":"/guides/examples#requests-chaining","editUrl":"/guides/examples.md"}]},{"title":"Tutorial","heading":true,"routes":[{"title":"Run Monika in Raspberry Pi","path":"/tutorial/run-in-raspberry-pi","editUrl":"/tutorial/run-in-raspberry-pi.md"}]}]}')},Ff2n:function(e,t,r){"use strict";function n(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}r.d(t,"a",(function(){return n}))},QhJM:function(e,t,r){e.exports={markdown:"markdown_markdown__3gxWv","code-block":"markdown_code-block__1jcT2"}},a6RD:function(e,t,r){"use strict";var n=r("oI91");function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}t.__esModule=!0,t.noSSR=s,t.default=function(e,t){var r=i.default,n={loading:e=>{var{error:t,isLoading:r,pastDelay:n}=e;return null}};e instanceof Promise?n.loader=()=>e:"function"===typeof e?n.loader=e:"object"===typeof e&&(n=o(o({},n),e));if(n=o(o({},n),t),"object"===typeof e&&!(e instanceof Promise)&&(e.render&&(n.render=(t,r)=>e.render(r,t)),e.modules)){r=i.default.Map;var a={},l=e.modules();Object.keys(l).forEach(e=>{var t=l[e];"function"!==typeof t.then?a[e]=t:a[e]=()=>t.then(e=>e.default||e)}),n.loader=a}n.loadableGenerated&&delete(n=o(o({},n),n.loadableGenerated)).loadableGenerated;if("boolean"===typeof n.ssr){if(!n.ssr)return delete n.ssr,s(r,n);delete n.ssr}return r(n)};l(r("q1tI"));var i=l(r("2qu3"));function l(e){return e&&e.__esModule?e:{default:e}}function s(e,t){return delete t.webpack,delete t.modules,e(t)}},er9C:function(e,t,r){"use strict";r.d(t,"a",(function(){return Ee}));var n=r("MX0m"),a=r.n(n),o=r("q1tI"),i=r.n(o),l=r("7ljp"),s=r("Gi+Z"),c=r("TSYQ"),d=r.n(c),u=r("t4m3"),p=o.createElement,m=()=>{var{onOpen:e}=Object(u.b)();return p("div",null,p("button",{type:"button",className:"group form-input hover:text-gray-600 hover:border-gray-300 transition duration-150 ease-in-out pointer flex items-center bg-gray-50 text-left w-full  text-gray-500 rounded-lg text-sm align-middle",onClick:e},p("svg",{width:"1em",height:"1em",className:"mr-3 align-middle text-gray-600 flex-shrink-0 group-hover:text-gray-700",style:{marginBottom:2},viewBox:"0 0 20 20"},p("path",{d:"M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z",stroke:"currentColor",fill:"none",strokeWidth:"2",fillRule:"evenodd",strokeLinecap:"round",strokeLinejoin:"round"})),"Search docs",p("span",{className:"ml-auto invisible lg:visible"},p("kbd",{className:"border border-gray-300 mr-1 bg-gray-100 align-middle p-0 inline-flex justify-center items-center  text-xs text-center mr-0 rounded group-hover:border-gray-300 transition duration-150 ease-in-out ",style:{minWidth:"1.8em"}},"\u2318"),p("kbd",{className:"border border-gray-300 bg-gray-100 align-middle p-0 inline-flex justify-center items-center  text-xs text-center ml-auto mr-0 rounded group-hover:border-gray-300 transition duration-150 ease-in-out ",style:{minWidth:"1.8em"}},"K"))))};m.displayName="Search";var f=i.a.createElement,b=e=>{var{active:t,children:r,fixed:n}=e,{0:i,1:l}=Object(o.useState)(!1);return f("aside",{className:"jsx-3651371114 "+(d()("sidebar bg-white top-24 flex-shrink-0 pr-2",{active:t,"pb-0 flex flex-col z-1 sticky":n,fixed:n,searching:i})||"")},f("div",{className:"jsx-3651371114 sidebar-search my-2 lg:hidden"},f(m,null)),f("div",{className:"jsx-3651371114 sidebar-content overflow-y-auto pb-4"},r),f(a.a,{id:"3651371114"},[".sidebar.jsx-3651371114{-webkit-overflow-scrolling:touch;}",".sidebar.fixed.jsx-3651371114{width:300px;padding-right:2.5rem;height:calc(100vh - 1.5rem - 64px - 42px);}",".sidebar.fixed.searching.jsx-3651371114>.sidebar-content.jsx-3651371114{display:none;}",".sidebar-search.jsx-3651371114{position:relative;z-index:1;}","@media screen and (max-width:1024px){.sidebar.jsx-3651371114,.sidebar.fixed.jsx-3651371114{display:none;}.sidebar.active.jsx-3651371114{display:block;}}"]))},g={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},h=o.createContext&&o.createContext(g),v=function(){return(v=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var a in t=arguments[r])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e}).apply(this,arguments)},x=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var a=0;for(n=Object.getOwnPropertySymbols(e);a<n.length;a++)t.indexOf(n[a])<0&&(r[n[a]]=e[n[a]])}return r};function y(e){return function(t){return o.createElement(w,v({attr:v({},e.attr)},t),function e(t){return t&&t.map((function(t,r){return o.createElement(t.tag,v({key:r},t.attr),e(t.child))}))}(e.child))}}function w(e){var t=function(t){var r,n=e.size||t.size||"1em";t.className&&(r=t.className),e.className&&(r=(r?r+" ":"")+e.className);var a=e.attr,i=e.title,l=x(e,["attr","title"]);return o.createElement("svg",v({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},t.attr,a,l,{className:r,style:v({color:e.color||t.color},t.style,e.style),height:n,width:n,xmlns:"http://www.w3.org/2000/svg"}),i&&o.createElement("title",null,i),e.children)};return void 0!==h?o.createElement(h.Consumer,null,(function(e){return t(e)})):t(g)}function j(e){return y({tag:"svg",attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"polyline",attr:{points:"6 9 12 15 18 9"}}]})(e)}function k(e){return y({tag:"svg",attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"polyline",attr:{points:"9 18 15 12 9 6"}}]})(e)}function O(e){return y({tag:"svg",attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"path",attr:{d:"M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"}}]})(e)}function N(e){return y({tag:"svg",attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"path",attr:{d:"M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"}}]})(e)}var P=i.a.createElement;function E(e){var{isMobile:t,level:r=1,title:n,selected:i,opened:l,children:s}=e,c=Object(o.useRef)(null),{0:{toggle:u,shouldScroll:p=!1},1:m}=Object(o.useState)({toggle:i||l}),f="level-".concat(r);return Object(o.useEffect)(()=>{i&&m({toggle:!0})},[i]),Object(o.useEffect)(()=>{if(u&&p&&null!=c.current){var e=document.querySelector(t?".docs-dropdown":".sidebar-content");if(e){var r=c.current.offsetTop-(t?10:e.offsetTop);e.scrollTop=r,m({toggle:u})}}},[u,p,t]),P("div",{ref:c,className:"jsx-4221507945 "+(d()("category",f,{open:u,selected:i})||"")},P("a",{onClick:()=>{m({toggle:!u,shouldScroll:!0})},className:"jsx-4221507945 label"},n,P(j,{className:"text-gray-600"})),P("div",{className:"jsx-4221507945 posts"},s),P(a.a,{id:"4221507945"},[".category.jsx-4221507945{margin:12px 0;}",".category.jsx-4221507945:first-child{margin-top:0;}",".category.jsx-4221507945:last-child{margin-bottom:0;}",".label.jsx-4221507945{font-size:1rem;line-height:1.5rem;font-weight:400;cursor:pointer;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-align-items:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:justify;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between;color:#4b5563;}",".label.jsx-4221507945>svg{margin-right:16px;-webkit-transform-origin:center;-ms-transform-origin:center;transform-origin:center;-webkit-transition:-webkit-transform 0.15s ease;-webkit-transition:transform 0.15s ease;transition:transform 0.15s ease;}",".selected.jsx-4221507945>.label.jsx-4221507945{font-weight:600;color:#161e2e;}",".open.jsx-4221507945>.label.jsx-4221507945{color:#161e2e;}",".open.jsx-4221507945>.label.jsx-4221507945>svg{margin-left:1px;-webkit-transform-origin:center;-ms-transform-origin:center;transform-origin:center;-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg);}",".level-2.jsx-4221507945 .label.jsx-4221507945{text-transform:none;-webkit-letter-spacing:0;-moz-letter-spacing:0;-ms-letter-spacing:0;letter-spacing:0;}",".label.jsx-4221507945:hover{color:#1a202c;}",".separated.jsx-4221507945{margin-bottom:32px;}",".posts.jsx-4221507945{border-left:1px solid #e5e7eb;margin-top:0;height:0;overflow:hidden;padding-left:19px;margin-left:3px;}",".open.jsx-4221507945>.posts.jsx-4221507945{margin-top:12px;height:auto;}","@media screen and (max-width:950px){.category.jsx-4221507945{margin:24px 0;}}"]))}var _=o.createElement,S=e=>{var{title:t,children:r}=e;return _("div",{className:"heading"},_("h4",{className:"my-2 mr-auto"},_("span",{className:"bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-semibold text-xl"},t)),_("div",null,r))};S.displayName="SidebarHeading";var C=!1;if("undefined"!==typeof window){var D={get passive(){C=!0}};window.addEventListener("testPassive",null,D),window.removeEventListener("testPassive",null,D)}var M="undefined"!==typeof window&&window.navigator&&window.navigator.platform&&(/iP(ad|hone|od)/.test(window.navigator.platform)||"MacIntel"===window.navigator.platform&&window.navigator.maxTouchPoints>1),L=[],R=!1,T=-1,q=void 0,I=void 0,U=function(e){return L.some((function(t){return!(!t.options.allowTouchMove||!t.options.allowTouchMove(e))}))},W=function(e){var t=e||window.event;return!!U(t.target)||(t.touches.length>1||(t.preventDefault&&t.preventDefault(),!1))},B=function(){void 0!==I&&(document.body.style.paddingRight=I,I=void 0),void 0!==q&&(document.body.style.overflow=q,q=void 0)},F=function(e,t){if(e){if(!L.some((function(t){return t.targetElement===e}))){var r={targetElement:e,options:t||{}};L=[].concat(function(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}(L),[r]),M?(e.ontouchstart=function(e){1===e.targetTouches.length&&(T=e.targetTouches[0].clientY)},e.ontouchmove=function(t){1===t.targetTouches.length&&function(e,t){var r=e.targetTouches[0].clientY-T;!U(e.target)&&(t&&0===t.scrollTop&&r>0||function(e){return!!e&&e.scrollHeight-e.scrollTop<=e.clientHeight}(t)&&r<0?W(e):e.stopPropagation())}(t,e)},R||(document.addEventListener("touchmove",W,C?{passive:!1}:void 0),R=!0)):function(e){if(void 0===I){var t=!!e&&!0===e.reserveScrollBarGap,r=window.innerWidth-document.documentElement.clientWidth;t&&r>0&&(I=document.body.style.paddingRight,document.body.style.paddingRight=r+"px")}void 0===q&&(q=document.body.style.overflow,document.body.style.overflow="hidden")}(t)}}else console.error("disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.")},z=r("wx14"),A=o.createElement,H=e=>A("div",Object(z.a)({className:d()("container mx-auto")},e));H.displayName="Container";var G=r("nOHt"),K=o.createElement;function V(e){var{children:t}=e,[r,n]=o.useState(!1),i=o.useRef(null),l=(o.useRef(null),Object(G.useRouter)()),s=()=>{var e;null!=i.current&&((e=i.current)?(L=L.filter((function(t){return t.targetElement!==e})),M?(e.ontouchstart=null,e.ontouchmove=null,R&&0===L.length&&(document.removeEventListener("touchmove",W,C?{passive:!1}:void 0),R=!1)):L.length||B()):console.error("enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices."),n(!1))};return o.useEffect(()=>(s(),()=>{M?(L.forEach((function(e){e.targetElement.ontouchstart=null,e.targetElement.ontouchmove=null})),R&&(document.removeEventListener("touchmove",W,C?{passive:!1}:void 0),R=!1),T=-1):B(),L=[]}),[l.asPath]),K("div",{className:"lg:hidden"},K(H,null,K("div",{className:"jsx-1647504227 sidebar-search py-2 z-10"},K(m,null)),K("label",{htmlFor:"dropdown-input",className:"jsx-1647504227 "+(d()("w-full",{opened:r})||"")},K("input",{id:"dropdown-input",type:"checkbox",checked:r,onChange:()=>{r?s():null!=i.current&&(F(i.current),n(!0))},className:"jsx-1647504227 hidden"}),K("div",{className:"jsx-1647504227 docs-select flex w-full items-center"},K(k,{className:"text-gray-600 -ml-1"}),"Menu")),K("div",{ref:i,className:"jsx-1647504227 docs-dropdown shadow-xl"},K(H,null,K("nav",{className:"jsx-1647504227"},t))),K(a.a,{id:"1647504227"},[".docs-select.jsx-1647504227{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:2.5rem;width:100%;line-height:3rem;-webkit-align-items:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;text-align:left;cursor:pointer;}",".docs-dropdown.jsx-1647504227{position:absolute;left:0;right:0;top:100%;bottom:100%;background:white;overflow-y:auto;-webkit-overflow-scrolling:touch;}",".docs-dropdown.jsx-1647504227 nav.jsx-1647504227{padding:10px 0;}",".opened.jsx-1647504227~.docs-dropdown.jsx-1647504227{min-height:80px;bottom:calc(153px - 90vh);border-top:1px solid #eaeaea;}",".docs-select.jsx-1647504227 svg{margin-left:1px;margin-right:14px;-webkit-transition:-webkit-transform 0.15s ease;-webkit-transition:transform 0.15s ease;transition:transform 0.15s ease;}",".opened.jsx-1647504227>.docs-select.jsx-1647504227 svg{-webkit-transform:rotate(90deg);-ms-transform:rotate(90deg);transform:rotate(90deg);}","@media screen and (max-width:640px){.opened.jsx-1647504227~.docs-dropdown.jsx-1647504227{bottom:calc(203px - 90vh);}}"])))}var Y=r("Ff2n"),J=r("YFqc"),Q=r.n(J),X=o.createElement;function Z(e){var{route:{href:t,pathname:r,title:n,selected:o},onClick:i}=e,l=Object(G.useRouter)(),s=r===l.pathname;return X("div",{className:"jsx-918302968 "+(d()("nav-link pl-4",{selected:o},o?"border-2 py-2 border-purple-monika rounded-md":"text-black-monika text-opacity-50 font-semibold")||"")},s?X("a",{href:"".concat(l.basePath).concat(r),className:"jsx-918302968 "+((o?"selected text-purple-monika hover:text-purple-700":"text-black-monika text-opacity-50 font-semibold")||"")},n):X(Q.a,{href:t,as:r},X("a",{className:"jsx-918302968 text-black-monika text-opacity-50 font-semibold"},n)),X(a.a,{id:"918302968"},["div.selected.jsx-918302968{box-sizing:border-box;}",".nav-link.jsx-918302968{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;width:100%;}",".nav-link.jsx-918302968 a{-webkit-text-decoration:none;text-decoration:none;font-size:1rem;line-height:1.5rem;width:100%;box-sizing:border-box;}",".selected.jsx-918302968 a{font-weight:600;}","span.jsx-918302968{color:#a0aec0;}","@media screen and (max-width:950px){div.jsx-918302968{padding-left:0.5rem;}.nav-link.jsx-918302968 a{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-align-items:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;}}"]))}Z.displayName="SidebarNavLink";var $=o.createElement,ee=e=>{var{isMobile:t,route:r,level:n=1,onClick:i}=e,l=Object(Y.a)(e,["isMobile","route","level","onClick"]),s=o.useRef(null),c=r.selected?s:null;return o.useEffect(()=>{if(c&&c.current&&!t){var e=document.querySelector(".sidebar-content"),r=c.current.offsetTop-32;e&&(e.scrollTop=r-e.offsetHeight/2)}},[c,t]),$("div",{ref:c,className:"jsx-540246980 "+(d()("link","level-".concat(n))||"")},$(Z,{route:r,scrollSelectedIntoView:l.scrollSelectedIntoView,categorySelected:l.categorySelected,level:n,onClick:i}),$(a.a,{id:"540246980"},[".link.jsx-540246980{margin:12px 0;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-align-items:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;}",".link.jsx-540246980:first-child{margin-top:0;}",".link.jsx-540246980:last-child{margin-bottom:0;}","@media screen and (max-width:950px){.link.jsx-540246980{margin:24px 0;}}"]))},te=r("mAZM"),re=()=>(e=>{var{0:t,1:r}=Object(o.useState)(!1),n=Object(o.useCallback)(e=>{e.matches?r(!0):r(!1)},[]);return Object(o.useEffect)(()=>{var t=window.matchMedia("(max-width: ".concat(e,"px)"));return t.addListener(n),t.matches&&r(!0),()=>t.removeListener(n)},[]),t})(1024);function ne(e,t){var r=e.lastIndexOf(t);return-1===r?e:e.substring(0,r)}var ae=r("rePB");function oe(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function ie(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?oe(Object(r),!0).forEach((function(t){Object(ae.a)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):oe(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var le=r("QhJM"),se=r.n(le),ce=r("9BOD"),de=r("mrum"),ue=r("5Wrh"),pe=o.createElement;function me(e,t){var r,n;return(null===(r=e.route)||void 0===r?void 0:r.path)===(null===(n=t.route)||void 0===n?void 0:n.path)}var fe=o.memo(e=>{var{route:t,prevRoute:r,nextRoute:n}=e,a=null!==t&&void 0!==t&&t.editUrl||null!==t&&void 0!==t&&t.path?"".concat(de.a.editUrl).concat((null===t||void 0===t?void 0:t.editUrl)||(null===t||void 0===t?void 0:t.path)):null;return pe(o.Fragment,null,pe("div",{className:"py-8"},pe("div",{className:"flex flex-col space-between items-center"},pe("span",{className:"h-px w-full bg-gradient-to-r from-purple-monika to-aqua-monika"}),pe("div",{className:"flex flex-col md:flex-row w-full py-8"},r&&r.path?pe(Q.a,{href:ne(r.path,".")},pe("a",{className:"flex flex-col block md:mr-auto md:ml-0 mx-auto"},pe("span",{className:"md:mr-auto md:ml-0 mx-auto text-base block text-gray-500 mb-1 font-semibold"},"\u2190 Prev"),pe("span",{className:"text-xl block bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold"},r.title))):pe("div",null),pe("div",{className:"flex flex-col justify-center"},pe("div",{className:"font-semibold mx-auto text-center mb-4"},"Was this page helpful?"),pe("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3 w-auto max-w-xs mx-auto"},pe(ue.a,{rounded:!1,className:"w-21 h-11 inline-flex self-center font-semibold"},pe(N,{className:"mt-1 mr-2"})," Yes"),pe(ue.a,{outline:!0,rounded:!1,className:"w-21 h-11 inline-flex self-center font-semibold"},pe(O,{className:"mt-1 mr-2"})," No"))),n&&n.path&&pe(Q.a,{href:ne(n.path,".")},pe("a",{className:"flex flex-col text-right block mt-4 md:mt-0 md:ml-auto md:mr-0 mx-auto"},pe("span",{className:"md:ml-auto md:mr-0 mx-auto text-base block text-gray-500 mb-1 font-semibold"},"Next \u2192"),pe("span",{className:"text-xl block bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold"},n.title)))))),a?pe("div",{className:"mb-8"},pe("a",{href:a,target:"_blank",rel:"noopener noreferrer",className:"text-gray-600 underline"},"Edit this page on GitHub")):null)},me);fe.displayName="DocsPageFooter";var be=r("9CUm"),ge=r("a6RD"),he=r.n(ge),ve=o.createElement,xe={pre:e=>ve("pre",e),code:he()(()=>r.e(23).then(r.bind(null,"WdOL")),{loadableGenerated:{webpack:()=>["WdOL"],modules:["./Highlight2"]}})},ye=r("8Kt/"),we=r.n(ye),je=r("8Dvh"),ke={},Oe=(Object.keys(ke),r("qj2Z")),Ne=o.createElement,Pe=e=>{var t=e.split("/");return"1.5.8"===t[2]||"2.1.4"===t[2]?{tag:t[2],slug:"/docs/".concat(t.slice(2).join("/"))}:{slug:e}},Ee=e=>{var t=Object(G.useRouter)(),{slug:r,tag:n}=Pe(t.asPath),{routes:i}=(e=>e?ke[e]:je)(n),c=function e(t,r){for(var n of r){if(n.path&&ne(n.path,".")===t)return n;var a=n.routes&&e(t,n.routes);if(a)return a}}(ne(r,"#"),i),{route:d,prevRoute:u,nextRoute:p}=function e(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!t)return n;for(var{path:a}=t,{parent:o}=n,i=0;i<r.length;i+=1){var l,s=r[i];if(s.routes&&(n.parent=s,(n=e(t,s.routes,n)).nextRoute))return n;if(s&&s.path){if(n.route)return n.nextRoute=o&&0===i?ie(ie({},s),{},{title:"".concat(o.title,": ").concat(s.title)}):s,n;s&&s.path===a?n.route=ie(ie({},t),{},{title:o&&!o.heading?"".concat(o.title,": ").concat(t.title):t.title}):n.prevRoute=!o||o.heading||null!==(l=r[i+1])&&void 0!==l&&l.path?s:ie(ie({},s),{},{title:"".concat(o.title,": ").concat(s.title)})}}return n}(c,i),m=d&&"".concat(d.title),f=re();return Ne(o.Fragment,null,n&&Ne(we.a,null,Ne("meta",{name:"robots",content:"noindex",className:"jsx-99718258"})),Ne("div",{className:"jsx-99718258"},f?Ne(o.Fragment,null,Ne(s.a,null),Ne(te.a,{shadow:!0},Ne(V,null,Ne(_e,{isMobile:!0,routes:i})))):Ne(te.a,null,Ne(s.a,null)),Ne(be.a,{title:e.meta.title||m,description:e.meta.description}),Ne("div",{className:"jsx-99718258 block"},Ne(o.Fragment,null,Ne("div",{className:"jsx-99718258 container mx-auto pb-12 pt-6 content"},Ne("div",{className:"jsx-99718258 flex relative"},!f&&Ne(b,{fixed:!0},Ne(_e,{routes:i})),Ne("div",{className:"jsx-99718258 "+(se.a.markdown+" w-full docs"||!1)},Ne("div",{className:"jsx-99718258 flex"},Ne("h1",{id:"_top",className:"jsx-99718258 mr-auto"},e.meta.title)," ",Ne(Oe.a,null)),Ne(l.a,{components:xe},e.children),Ne(fe,{href:(null===d||void 0===d?void 0:d.path)||"",route:d,prevRoute:u,nextRoute:p}))))))),Ne(ce.a,{className:"bg-black-monika"}),Ne(a.a,{id:"99718258"},[".docs.jsx-99718258{min-width:calc(100% - 300px - 1rem - 200px);}"]))};function _e(e){var{isMobile:t,routes:r,level:n=1}=e,{asPath:a}=Object(G.useRouter)(),{slug:o,tag:i}=Pe(a);return r.map((e,r)=>{var{path:a,title:l,routes:s,heading:c,open:d}=e;if(s){var u=function(e){var t=e.find(e=>e.path);return t&&ne(t.path,"/")}(s),p=o.startsWith(u),m=!p&&!t&&d;return c?Ne(S,{key:"parent"+r,title:l},Ne(_e,{isMobile:t,routes:s,level:n+1})):Ne(E,{key:u,isMobile:t,level:n,title:l,selected:p,opened:m},Ne(_e,{isMobile:t,routes:s,level:n+1}))}var f=ne(a,"."),b=((e,t)=>t?"/docs/".concat(t,"/").concat(e.replace("/docs/","")):e)(f,i);return Ne(ee,{key:l,isMobile:t,level:n,route:{href:f,path:a,title:l,pathname:b,selected:o===f}})})}Ee.displayName="LayoutDocs"},jwwS:function(e,t,r){"use strict";var n;t.__esModule=!0,t.LoadableContext=void 0;var a=((n=r("q1tI"))&&n.__esModule?n:{default:n}).default.createContext(null);t.LoadableContext=a},rePB:function(e,t,r){"use strict";function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}r.d(t,"a",(function(){return n}))},t4m3:function(e,t,r){"use strict";r.d(t,"b",(function(){return y})),r.d(t,"a",(function(){return w}));var n=r("wx14"),a=r("rePB"),o=r("q1tI"),i=r.n(o),l=r("i8i4"),s=r("nOHt"),c=r.n(s),d=r("8Kt/"),u=r.n(d),p=r("YFqc"),m=r.n(p);var f=r("mrum"),b=i.a.createElement;function g(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function h(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?g(Object(r),!0).forEach((function(t){Object(a.a)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):g(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var v=i.a.createContext(),x=null,y=()=>i.a.useContext(v);function w(e){var{children:t,searchParameters:a={hitsPerPage:5}}=e,[o,s]=i.a.useState(!1),d=i.a.useCallback((function(){(x?Promise.resolve():r.e(22).then(r.bind(null,"m3sE")).then(e=>{var{DocSearchModal:t}=e;return x=t})).then(()=>{s(!0)})}),[]),p=i.a.useCallback(()=>s(!1),[]);!function(e){var t=e.isOpen,r=e.onOpen,n=e.onClose;i.a.useEffect((function(){function e(e){(27===e.keyCode&&t||"k"===e.key&&(e.metaKey||e.ctrlKey))&&(e.preventDefault(),t?n():r())}return window.addEventListener("keydown",e),function(){window.removeEventListener("keydown",e)}}),[t,r,n])}({isOpen:o,onOpen:d,onClose:p});var m={appId:f.a.algolia.appId,apiKey:f.a.algolia.apiKey,indexName:f.a.algolia.indexName,renderModal:!0};return b(i.a.Fragment,null,b(u.a,null,b("link",{key:"algolia",rel:"preconnect",href:"https://".concat(m.appId,"-dsn.algolia.net"),crossOrigin:"true"})),b(v.Provider,{value:{DocSearchModal:x,onOpen:d}},t),o&&Object(l.createPortal)(b(x,Object(n.a)({},m,{searchParameters:a,onClose:p,navigator:{navigate(e){var{suggestionUrl:t}=e;c.a.push(t)}},transformItems:e=>e.map(e=>{var t=new URL(e.url);return h(h({},e),{},{url:e.url.replace(t.origin,"").replace("#__next","").replace("/docs/#","/docs/overview#")})}),hitComponent:j})),document.body))}function j(e){var{hit:t,children:r}=e;return b(m.a,{href:t.url.replace()},b("a",null,r))}}}]);