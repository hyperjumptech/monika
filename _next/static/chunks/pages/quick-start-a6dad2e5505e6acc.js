(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[122],{2849:function(e,a,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/quick-start",function(){return n(1030)}])},1030:function(e,a,n){"use strict";n.r(a),n.d(a,{default:function(){return l},meta:function(){return s}});var t=n(9534),i=(n(7294),n(3905)),o=n(2290),s={id:"quick-start",title:"Quick Start"},r={meta:s},c=function(e){var a=e.children,n=(0,t.Z)(e,["children"]);return(0,i.kt)(o.C,Object.assign({meta:s},n),a)};function l(e){var a=e.components,n=(0,t.Z)(e,["components"]);return(0,i.kt)(c,Object.assign({},r,n,{components:a,mdxType:"MDXLayout"}),(0,i.kt)("h2",Object.assign({},{id:"installation"}),"Installation",(0,i.kt)("a",Object.assign({parentName:"h2"},{href:"#installation",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("p",null,"There are many ways to install Monika. However, currently only x64 architecture is supported."),(0,i.kt)("h3",Object.assign({},{id:"windows"}),"Windows",(0,i.kt)("a",Object.assign({parentName:"h3"},{href:"#windows",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("p",null,"The recommended approach is to use ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://community.chocolatey.org/packages/monika"}),"Chocolatey"),", a popular package manager for Windows. Check ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://community.chocolatey.org/packages/monika"}),"Monika page on Chocolatey")," for more detailed information."),(0,i.kt)("p",null,"If you have installed Chocolatey in your PC, then run the following command to install Monika:"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"choco install monika\n")),(0,i.kt)("p",null,"If it does not work right away, try again on a command prompt or PowerShell with the Administrator permission."),(0,i.kt)("p",null,"Alternatively, Monika for Windows can be installed from its prebuilt binary. Head over to ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://github.com/hyperjumptech/monika/releases"}),"Monika Releases page")," and download the release archive marked with ",(0,i.kt)("inlineCode",{parentName:"p"},"win-x64"),". Extract the contents of the archive and the executable ",(0,i.kt)("inlineCode",{parentName:"p"},"monika.exe")," is ready to use."),(0,i.kt)("h3",Object.assign({},{id:"macos"}),"macOS",(0,i.kt)("a",Object.assign({parentName:"h3"},{href:"#macos",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("p",null,"The recommended approach is to use ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://brew.sh/"}),"Homebrew"),", a popular package manager for macOS. Check ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://formulae.brew.sh/formula/monika"}),"Monika page on Homebrew")," for more detailed information."),(0,i.kt)("p",null,"If you have installed Homebrew, then run the following command to install Monika:"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"brew install monika\n")),(0,i.kt)("p",null,"Alternatively, Monika for macOS can be installed from its prebuilt binary. Head over to ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://github.com/hyperjumptech/monika/releases"}),"Monika Releases page")," and download the release archive marked with ",(0,i.kt)("inlineCode",{parentName:"p"},"macos-x64"),". Extract the contents of the archive and the executable ",(0,i.kt)("inlineCode",{parentName:"p"},"monika")," is ready to use. If necessary, make the file executable with ",(0,i.kt)("inlineCode",{parentName:"p"},"sudo chmod +x monika"),"."),(0,i.kt)("h3",Object.assign({},{id:"linux"}),"Linux",(0,i.kt)("a",Object.assign({parentName:"h3"},{href:"#linux",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("p",null,"The recommended approach is to use ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://snapcraft.io/"}),"Snapcraft"),", a universal package manager for Linux. Check ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://snapcraft.io/monika"}),"Monika page on Snapcraft")," for more detailed information."),(0,i.kt)("p",null,"Alternatively, Monika for Linux can be automatically downloaded and installed by running an installation script as follows:"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"curl https://raw.githubusercontent.com/hyperjumptech/monika/main/scripts/monika-install.sh | sh\n")),(0,i.kt)("p",null,"The binary will be placed into ",(0,i.kt)("inlineCode",{parentName:"p"},"~/.local/bin"),"."),(0,i.kt)("p",null,"If you prefer to perform the installation manually, head over to ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://github.com/hyperjumptech/monika/releases"}),"Monika Releases page")," and download the release archive marked with ",(0,i.kt)("inlineCode",{parentName:"p"},"linux-x64"),". Extract the contents of the archive and the executable ",(0,i.kt)("inlineCode",{parentName:"p"},"monika")," is ready to use. If necessary, make the file executable with ",(0,i.kt)("inlineCode",{parentName:"p"},"sudo chmod +x monika"),"."),(0,i.kt)("h3",Object.assign({},{id:"via-nodejs"}),"Via Node.js",(0,i.kt)("a",Object.assign({parentName:"h3"},{href:"#via-nodejs",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("p",null,"If you have installed Node.js in your machine, you can install Monika directly from ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://npmjs.com"}),"npm"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"npm i -g @hyperjumptech/monika\n")),(0,i.kt)("p",null,"or ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://yarnpkg.com"}),"yarn"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"yarn global add @hyperjumptech/monika\n")),(0,i.kt)("h2",Object.assign({},{id:"download-the-configuration-file"}),"Download the configuration file",(0,i.kt)("a",Object.assign({parentName:"h2"},{href:"#download-the-configuration-file",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("p",null,"Once you have installed Monika, let's confirm that it's working by downloading the example configuration that uses Desktop notification called ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml"}),"config.desktop.example.yml")," and rename it as monika.yml."),(0,i.kt)("h2",Object.assign({},{id:"run-monika"}),"Run Monika",(0,i.kt)("a",Object.assign({parentName:"h2"},{href:"#run-monika",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("p",null,"Monika by default reads a yaml configuration file called ",(0,i.kt)("inlineCode",{parentName:"p"},"monika.yml")," in the current working directory if it exists. To run monika with the configuration file that you have downloaded before, run this command in the Terminal from the directory that contains the monika.yml file:"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"monika\n")),(0,i.kt)("p",null,"Otherwise, you can also specify a path to a YAML configuration file with ",(0,i.kt)("inlineCode",{parentName:"p"},"-c")," flag if you didn't rename your configuration file as monika.yml:"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"monika -c <path_to_configuration_file>\n")),(0,i.kt)("p",null,"Better yet, you can provide a URL that contains monika configuration"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"monika -c https://domain.com/path/to/your/configuration.yml\n")),(0,i.kt)("p",null,"When using remote configuration file, you can use the ",(0,i.kt)("inlineCode",{parentName:"p"},"--config-interval")," to tell Monika to check the configuration file periodically. For example, to check every 10 seconds:"),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"monika -c https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml --config-interval 10\n")),(0,i.kt)("h2",Object.assign({},{id:"run-monika-on-docker"}),"Run Monika on Docker",(0,i.kt)("a",Object.assign({parentName:"h2"},{href:"#run-monika-on-docker",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("pre",null,(0,i.kt)("code",Object.assign({parentName:"pre"},{className:"language-bash"}),"docker run --name monika \\\n    --net=host \\\n    -d hyperjump/monika:latest \\\n    monika -c https://domain.com/path/to/your/configuration.yml\n")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"On ARM / Apple Silicon chip"),", you need to pass ",(0,i.kt)("inlineCode",{parentName:"p"},"--platform linux/amd64")," to docker."),(0,i.kt)("p",null,"Congratulations, you have successfully run Monika in your machine!"),(0,i.kt)("h2",Object.assign({},{id:"next-step"}),"Next Step",(0,i.kt)("a",Object.assign({parentName:"h2"},{href:"#next-step",title:"Direct link to heading",className:"anchor"}),(0,i.kt)("span",Object.assign({parentName:"a"},{className:"icon icon-link"})))),(0,i.kt)("p",null,"Now it's time to ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://monika.hyperjump.tech/guides/configuration-file"}),"write your own configuration file"),". You can use ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://medium.com/hyperjump-tech/creating-monika-configuration-from-scratch-using-autocomplete-in-visual-studio-code-d7bc86c1d36a"}),"VSCode with YAML extension for the auto completion feature")," or you can also use the",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://monika-config.hyperjump.tech/"})," Monika Config Generator web app")," if you prefer using Graphical User Interface (GUI)."),(0,i.kt)("p",null,"For advanced configuration such as configuring ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://monika.hyperjump.tech/guides/notifications"}),"notifications"),", ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://monika.hyperjump.tech/guides/probes"}),"probes"),", and ",(0,i.kt)("a",Object.assign({parentName:"p"},{href:"https://monika.hyperjump.tech/guides/alerts"}),"alerts"),", you can find them on the sidebar menu."))}l.isMDXComponent=!0}},function(e){e.O(0,[357,513,290,774,888,179],(function(){return a=2849,e(e.s=a);var a}));var a=e.O();_N_E=a}]);