(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[191],{4017:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/tutorial/run-in-background",function(){return t(5048)}])},5048:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return p},meta:function(){return o}});t(7294);var a=t(3905),i=t(1860);function r(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var o={id:"run-in-background",title:"Run Monika in Background"},l={meta:o},s=function(e){var n=e.children,t=r(e,["children"]);return(0,a.kt)(i.C,Object.assign({meta:o},t),n)};function p(e){var n=e.components,t=r(e,["components"]);return(0,a.kt)(s,Object.assign({},l,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"By default Monika will run in the foreground. Like other Node.js applications, there are several ways to run Monika in the background on Unix, Linux, and macOS."),(0,a.kt)("h3",Object.assign({},{id:"using-docker"}),"Using Docker",(0,a.kt)("a",Object.assign({parentName:"h3"},{href:"#using-docker",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("p",null,"Refer to the ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://monika.hyperjump.tech/tutorial/run-in-docker"}),"Run in Docker")," documentation page."),(0,a.kt)("h3",Object.assign({},{id:"using-pm2"}),"Using PM2",(0,a.kt)("a",Object.assign({parentName:"h3"},{href:"#using-pm2",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Make sure you already have NPM installed"),(0,a.kt)("li",{parentName:"ul"},"Run ",(0,a.kt)("inlineCode",{parentName:"li"},"npm install -g pm2")," to install PM2"),(0,a.kt)("li",{parentName:"ul"},"Run ",(0,a.kt)("inlineCode",{parentName:"li"},"pm2 start monika -- -c <your_full_path_to_the_monika.yml>")," to start Monika using PM2")),(0,a.kt)("p",null,"If you want to add more Monika parameters such as ",(0,a.kt)("inlineCode",{parentName:"p"},"--prometheus"),", add it after the double dashes. But if you want to add more PM2 parameters such as ",(0,a.kt)("inlineCode",{parentName:"p"},"-i max"),", add it before the double dashes."),(0,a.kt)("p",null,"Refer to the ",(0,a.kt)("a",Object.assign({parentName:"p"},{href:"https://pm2.keymetrics.io/docs/usage/quick-start/"}),"PM2 Official Documentation")," for all available PM2 parameters."),(0,a.kt)("h3",Object.assign({},{id:"using-nohup"}),"Using ",(0,a.kt)("inlineCode",{parentName:"h3"},"nohup"),(0,a.kt)("a",Object.assign({parentName:"h3"},{href:"#using-nohup",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"On your terminal, run ",(0,a.kt)("inlineCode",{parentName:"p"},"nohup monika &"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"You'll get an output similar to the following."),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",Object.assign({parentName:"pre"},{className:"language-text"}),"[1] 93457\nappending output to nohup.out\n")),(0,a.kt)("p",{parentName:"li"},"In the above example, 93457 is the process ID (pid). And the output of Monika is written to ",(0,a.kt)("inlineCode",{parentName:"p"},"nohup.out")," file.")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"To stop Monika, run ",(0,a.kt)("inlineCode",{parentName:"p"},"kill -9 <pid>"),"."))),(0,a.kt)("h3",Object.assign({},{id:"using-screen"}),"Using ",(0,a.kt)("inlineCode",{parentName:"h3"},"screen"),(0,a.kt)("a",Object.assign({parentName:"h3"},{href:"#using-screen",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"On Debian/Ubuntu, you can install it by running ",(0,a.kt)("inlineCode",{parentName:"p"},"sudo apt install screen"),".")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Run ",(0,a.kt)("inlineCode",{parentName:"p"},"screen"),".")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Run ",(0,a.kt)("inlineCode",{parentName:"p"},"monika -c monika.yaml"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Press Ctrl+a then D. This will cause Monika to run on a different screen in the background.")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"To go back to the screen, run ",(0,a.kt)("inlineCode",{parentName:"p"},"screen -ls")," to list the running screens. You will get an output similar to the following."),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",Object.assign({parentName:"pre"},{className:"language-text"}),"There is a screen on:\n  9049.pts-0.the-server (03/23/21 08:34:38) (Detached)\n  1 Socket in /run/screen/S-server.\n")),(0,a.kt)("p",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"p"},"9049.pts-0.the-server")," is the name of the screen.")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Then run ",(0,a.kt)("inlineCode",{parentName:"p"},"screen -r <name_of_the_screen>"),".")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"To stop Monika, hit CTRL+C and then CTRL+D to exit/terminate Screen."))),(0,a.kt)("h3",Object.assign({},{id:"using-systemd"}),"Using ",(0,a.kt)("inlineCode",{parentName:"h3"},"systemd"),(0,a.kt)("a",Object.assign({parentName:"h3"},{href:"#using-systemd",title:"Direct link to heading",className:"anchor"}),(0,a.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"To use the systemd service unit, you need to locate the Monika binary. For example, if you installed Monika using NPM, run which monika to know where is your Monika located.\ne.g"),(0,a.kt)("ol",{parentName:"li"},(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"/home/hyperjump/.nvm/versions/node/v14.17.6/bin/monika")," is the full path to Monika binary file"),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"/home/hyperjump/.nvm/versions/node/v14.17.6/bin/")," is the full path to Monika binary directory"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Create a new file and copy the contents below into the file:"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",Object.assign({parentName:"pre"},{}),"[Unit]\nDescription=Monika\n\n[Service]\nExecStart=/bin/sh -c '<full_path_to_your_monika_binary_file> -c <full_path_to_your_monika.yml>'\nRestart=on-failure\nUser=<your_user>\nGroup=<your_group>\nWorkingDirectory=<full_path_to_your_monika_binary_directory>\n\n[Install]\nWantedBy=multi-user.target\n"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Replace the values to the correct values and save the file as ",(0,a.kt)("inlineCode",{parentName:"p"},"monika.service"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Adjust the service file permissions to 644 by running ",(0,a.kt)("inlineCode",{parentName:"p"},"sudo chmod 644 monika.service"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Copy the ",(0,a.kt)("inlineCode",{parentName:"p"},"monika.service")," file to ",(0,a.kt)("inlineCode",{parentName:"p"},"/etc/systemd/system/")," folder by running ",(0,a.kt)("inlineCode",{parentName:"p"},"sudo cp monika.service /etc/systemd/system/monika.service"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Reload the daemon server by running ",(0,a.kt)("inlineCode",{parentName:"p"},"sudo systemctl daemon-reload"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"Start Monika service by running ",(0,a.kt)("inlineCode",{parentName:"p"},"sudo systemctl restart monika.service"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},"To confirm that Monika is working flawlessly, run ",(0,a.kt)("inlineCode",{parentName:"p"},"sudo systemctl status monika.service")," in your terminal."))))}p.isMDXComponent=!0}},function(e){e.O(0,[547,778,860,774,888,179],(function(){return n=4017,e(e.s=n);var n}));var n=e.O();_N_E=n}]);