(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[10],{E3FS:function(e,a,t){"use strict";t.r(a),t.d(a,"meta",(function(){return c})),t.d(a,"default",(function(){return m}));var n=t("wx14"),i=t("Ff2n"),o=t("q1tI"),l=t.n(o),r=t("7ljp"),b=t("er9C"),c=(l.a.createElement,{}),s={meta:c},p=e=>{var{children:a}=e,t=Object(i.a)(e,["children"]);return Object(r.b)(b.a,Object(n.a)({meta:c},t),a)};function m(e){var{components:a}=e,t=Object(i.a)(e,["components"]);return Object(r.b)(p,Object(n.a)({},s,t,{components:a,mdxType:"MDXLayout"}),Object(r.b)("h1",{id:"command-line-options"},"Command Line Options",Object(r.b)("a",{parentName:"h1",href:"#command-line-options",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Monika can be run with the single command ",Object(r.b)("inlineCode",{parentName:"p"},"monika")," typed into the command shell. However to fully enjoy its flexibility, there are several options and arguments that can be used."),Object(r.b)("p",null,"The common ",Object(r.b)("inlineCode",{parentName:"p"},"-h")," or ",Object(r.b)("inlineCode",{parentName:"p"},"--help")," displays all available options"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika -h\n")),Object(r.b)("h2",{id:"configuration"},"Configuration",Object(r.b)("a",{parentName:"h2",href:"#configuration",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Monika by default will look for the ",Object(r.b)("inlineCode",{parentName:"p"},"monika.json")," config file.\nYou may want to store different configurations for different environments or projects. This is straight forward by using the ",Object(r.b)("inlineCode",{parentName:"p"},"-c")," or ",Object(r.b)("inlineCode",{parentName:"p"},"--config")," flag followed by the filename."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --config staging-set.json\n")),Object(r.b)("p",null,"Configuration files may be placed remotely which you can specify using the same flag and using a URI."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika -c https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.json\n")),Object(r.b)("p",null,"A neat feature is that the configuration file will be re-read and monitoring updated if Monika detects any changes to it."),Object(r.b)("h2",{id:"create-config"},"Create Config",Object(r.b)("a",{parentName:"h2",href:"#create-config",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Just starting out? Want to make a new configuration? The ",Object(r.b)("inlineCode",{parentName:"p"},"--create-config")," flag will spin up an easy Web based configuration file generator."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --create-config\n")),Object(r.b)("p",null,"As an alternative, the generator is able to read HAR or postman files as input to convert into monika.json configuration files."),Object(r.b)("p",null,"Use the ",Object(r.b)("inlineCode",{parentName:"p"},"--har")," or the ",Object(r.b)("inlineCode",{parentName:"p"},"--postman")," in combination with ",Object(r.b)("inlineCode",{parentName:"p"},"--create-config")," on the command line to convert those files."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --create-config --har myfile.har\n")),Object(r.b)("p",null,"The above example creates a config file from an existing HAR archive. Auto generated files defaults to 'monika.json'. Use the ",Object(r.b)("inlineCode",{parentName:"p"},"-o")," output flag to specify another name."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --create-config --postman mypostman.json -o new-monika.json\n")),Object(r.b)("p",null,"When generating config files, if an existing monika.json file already exist, the user is prompted before overwriting. To bypass the user prompt, use the ",Object(r.b)("inlineCode",{parentName:"p"},"--force")," flag."),Object(r.b)("h2",{id:"force"},"Force",Object(r.b)("a",{parentName:"h2",href:"#force",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"The ",Object(r.b)("inlineCode",{parentName:"p"},"--force")," flag forces the execution of a command. The force flag will bypass any user prompts with an affirmative. If a Yes/No prompt is normally presented, ",Object(r.b)("inlineCode",{parentName:"p"},"--force")," will bypass the prompt and assume a Yes."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --flush --force\n")),Object(r.b)("p",null,"The example above flushes the database bypassing without waiting for user confirmation."),Object(r.b)("h2",{id:"har"},"HAR",Object(r.b)("a",{parentName:"h2",href:"#har",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Monika supports HAR files as input. HAR are JSON formatted HTTP ARchive file. Generate a HAR file from the site you've visited then use Monika to refetch the pages and ensure they still work."),Object(r.b)("p",null,"You use the ",Object(r.b)("inlineCode",{parentName:"p"},"-H")," or ",Object(r.b)("inlineCode",{parentName:"p"},"--har")," to specify a HAR file."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika -H my-file.har\n")),Object(r.b)("p",null,"You can use the combination of --create-config and --har flags to convert the HAR archive into to a monika.json configuration file."),Object(r.b)("p",null,"Please note, HAR files may contain sensitive information, use caution when distributing HAR filles."),Object(r.b)("h2",{id:"id"},"Id",Object(r.b)("a",{parentName:"h2",href:"#id",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"By default Monika loops through all the probe configuration in order they are entered. However, you can specify any run order you want using the ",Object(r.b)("inlineCode",{parentName:"p"},"-i")," or ",Object(r.b)("inlineCode",{parentName:"p"},"--id")," flags."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika -i 1,3,1,2,4,5,7,7\n")),Object(r.b)("p",null,"The above example will run probe id 1, 3, 1, 2, 4, 5, 7, 7 in that order just once. All id must be valid ids on the configuration file. You can combine the ",Object(r.b)("inlineCode",{parentName:"p"},"--id")," flag with the ",Object(r.b)("inlineCode",{parentName:"p"},"-r")," repeat flag to continuously repeat the specific ids."),Object(r.b)("h2",{id:"logging"},"Logging",Object(r.b)("a",{parentName:"h2",href:"#logging",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"All command and responses are stored in an internal log file. You can dump (display) all the logs using the ",Object(r.b)("inlineCode",{parentName:"p"},"-l")," or ",Object(r.b)("inlineCode",{parentName:"p"},"--logs")," flag."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --logs\n")),Object(r.b)("p",null,"You can flush the log history with the ",Object(r.b)("inlineCode",{parentName:"p"},"--flush")," option. there is no ",Object(r.b)("inlineCode",{parentName:"p"},"-f")," short flag for this command."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --flush\n")),Object(r.b)("p",null,"You must respond with a capital ",Object(r.b)("inlineCode",{parentName:"p"},'"Y"')," to confirm if you want to flush the logs or use the ",Object(r.b)("inlineCode",{parentName:"p"},"--force")," flag to force a Yes without prompting."),Object(r.b)("h2",{id:"postman"},"Postman",Object(r.b)("a",{parentName:"h2",href:"#postman",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Have an existing request on postman you want to automate? Monika supports reading postman.json as configuration input. Use the ",Object(r.b)("inlineCode",{parentName:"p"},"-p")," or the ",Object(r.b)("inlineCode",{parentName:"p"},"--postman")," switches."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika -p postman.json\n")),Object(r.b)("p",null,"You can use the combination of ",Object(r.b)("inlineCode",{parentName:"p"},"--create-config")," and ",Object(r.b)("inlineCode",{parentName:"p"},"--postman")," flags to convert the postman files to a monika.json config file."),Object(r.b)("h2",{id:"prometheus"},"Prometheus",Object(r.b)("a",{parentName:"h2",href:"#prometheus",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"You can expose the ",Object(r.b)("a",{parentName:"p",href:"https://prometheus.io/"},"Prometheus")," metrics server with the ",Object(r.b)("inlineCode",{parentName:"p"},"--prometheus")," flag and server port as a value."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --prometheus 3001\n")),Object(r.b)("p",null,"Then you can scrape the metrics from ",Object(r.b)("inlineCode",{parentName:"p"},"http://localhost:3001/metrics"),"."),Object(r.b)("h3",{id:"available-metrics"},"Available Metrics",Object(r.b)("a",{parentName:"h3",href:"#available-metrics",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Monika exposes ",Object(r.b)("a",{parentName:"p",href:"https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors"},"Prometheus default metrics"),", ",Object(r.b)("a",{parentName:"p",href:"https://github.com/siimon/prom-client/tree/master/lib/metrics"},"Node.js specific metrics"),", and Monika probe metrics below."),Object(r.b)("table",null,Object(r.b)("thead",{parentName:"table"},Object(r.b)("tr",{parentName:"thead"},Object(r.b)("th",{parentName:"tr",align:null},"Metric Name"),Object(r.b)("th",{parentName:"tr",align:null},"Type"),Object(r.b)("th",{parentName:"tr",align:null},"Purpose"),Object(r.b)("th",{parentName:"tr",align:null},"Label"))),Object(r.b)("tbody",{parentName:"table"},Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",{parentName:"tr",align:null},Object(r.b)("inlineCode",{parentName:"td"},"monika_probes_total")),Object(r.b)("td",{parentName:"tr",align:null},"Gauge"),Object(r.b)("td",{parentName:"tr",align:null},"Collect total probe"),Object(r.b)("td",{parentName:"tr",align:null},"-")),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",{parentName:"tr",align:null},Object(r.b)("inlineCode",{parentName:"td"},"monika_request_status_code_info")),Object(r.b)("td",{parentName:"tr",align:null},"Gauge"),Object(r.b)("td",{parentName:"tr",align:null},"Collect HTTP status code"),Object(r.b)("td",{parentName:"tr",align:null},Object(r.b)("inlineCode",{parentName:"td"},"id"),", ",Object(r.b)("inlineCode",{parentName:"td"},"name"),", ",Object(r.b)("inlineCode",{parentName:"td"},"url"),", ",Object(r.b)("inlineCode",{parentName:"td"},"method"))),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",{parentName:"tr",align:null},Object(r.b)("inlineCode",{parentName:"td"},"monika_request_response_time_seconds")),Object(r.b)("td",{parentName:"tr",align:null},"Histogram"),Object(r.b)("td",{parentName:"tr",align:null},"Collect duration of probe request in seconds"),Object(r.b)("td",{parentName:"tr",align:null},Object(r.b)("inlineCode",{parentName:"td"},"id"),", ",Object(r.b)("inlineCode",{parentName:"td"},"name"),", ",Object(r.b)("inlineCode",{parentName:"td"},"url"),", ",Object(r.b)("inlineCode",{parentName:"td"},"method"),", ",Object(r.b)("inlineCode",{parentName:"td"},"statusCode"))),Object(r.b)("tr",{parentName:"tbody"},Object(r.b)("td",{parentName:"tr",align:null},Object(r.b)("inlineCode",{parentName:"td"},"monika_request_response_size_bytes")),Object(r.b)("td",{parentName:"tr",align:null},"Gauge"),Object(r.b)("td",{parentName:"tr",align:null},"Collect size of response size in bytes"),Object(r.b)("td",{parentName:"tr",align:null},Object(r.b)("inlineCode",{parentName:"td"},"id"),", ",Object(r.b)("inlineCode",{parentName:"td"},"name"),", ",Object(r.b)("inlineCode",{parentName:"td"},"url"),", ",Object(r.b)("inlineCode",{parentName:"td"},"method"),", ",Object(r.b)("inlineCode",{parentName:"td"},"statusCode"))))),Object(r.b)("h2",{id:"repeat"},"Repeat",Object(r.b)("a",{parentName:"h2",href:"#repeat",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"By default monika will continuously loop through all your probes in the configuration. You can specify the number of repeats using ",Object(r.b)("inlineCode",{parentName:"p"},"-r")," or ",Object(r.b)("inlineCode",{parentName:"p"},"--repeat")," flags followed by a number. For example to repeat only 3 times type the command below:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika -r 3\n")),Object(r.b)("p",null,"You can combine this flag with the ",Object(r.b)("inlineCode",{parentName:"p"},"--id")," flag to repeat custom sequences."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika -r 3 -i 1,3,1\n")),Object(r.b)("h2",{id:"verbose"},"Verbose",Object(r.b)("a",{parentName:"h2",href:"#verbose",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"Like your app to be more chatty and honest revealing all its internal details? Use the ",Object(r.b)("inlineCode",{parentName:"p"},"--verbose")," flag."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika --verbose\n")),Object(r.b)("h2",{id:"version"},"Version",Object(r.b)("a",{parentName:"h2",href:"#version",title:"Direct link to heading",className:"anchor"},Object(r.b)("span",{parentName:"a",className:"icon icon-link"}))),Object(r.b)("p",null,"The ",Object(r.b)("inlineCode",{parentName:"p"},"-v")," or ",Object(r.b)("inlineCode",{parentName:"p"},"--version")," flag prints current application version."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-bash"},"monika -v\n")))}m.isMDXComponent=!0},XaKD:function(e,a,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/guides/cli-options",function(){return t("E3FS")}])}},[["XaKD",0,1,2,3,4]]]);