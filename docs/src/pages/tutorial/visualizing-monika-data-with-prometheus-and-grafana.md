[![Denny Pradipta](https://miro.medium.com/fit/c/48/48/1*xMyd0j43HlsG8Iots4I1ig.jpeg)

](https://medium.com/@dennypradipta?source=post_page-----bee8c6feb9d3--------------------------------)[Denny Pradipta](https://medium.com/@dennypradipta?source=post_page-----bee8c6feb9d3--------------------------------)Follow

Aug 24, 2021

·6 min read

# Visualizing Monika Data with Prometheus and Grafana

![](https://miro.medium.com/max/1400/0*4v1Gc-ph1njvPaWP)Photo by [Luke Chesser](https://unsplash.com/@lukechesser?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

This article is part two of the previous article: [Connecting Monika with Prometheus](https://medium.com/hyperjump-tech/collecting-monika-with-prometheus-9faa7d484a30)

I know some people prefer to see logs, but some people also beg to differ. When you run Monika for a couple of hours, you may be overwhelmed with so many lines of logs. Another case is that when you want to present your Monika data to non-technical people of the team, most of the time they would respond “I don’t know what the logs mean, could you explain it to me?”

Some people understand better with visuals: Colors, graphs, and tables. With visuals, some people may understand the context easier than having to look at the humongous lines of logs. After we connected Monika with Prometheus, we can visualize our Monika data with [Grafana](https://grafana.com/).

# What is Grafana?

Taken from their website, [Grafana](https://grafana.com/) is an open source visualization and analytics software. It allows you to query, visualize, be alerted, and explore your metrics no matter where they are stored. In plain English, it provides you with tools to turn your time-series database (TSDB) data into beautiful graphs and visualizations. It will be used to visualize your Monika data that has been processed by Prometheus.

# **How to use Grafana with Monika and Prometheus?**

If you have previously read our article about [connecting Monika with Prometheus](https://medium.com/hyperjump-tech/collecting-monika-with-prometheus-9faa7d484a30), you are halfway through the setup. If you haven’t read the article, well, you should.

## Install Grafana

Let’s assume that you already have Monika and Prometheus installed and connected. The next step is we need to install Grafana. Head to the [Downloads page](https://grafana.com/grafana/download?pg=oss-graf&plcmt=hero-btn-1) and select which OS you are using.

![](https://miro.medium.com/max/1400/1*CIKeZbmC8OepT1whxy_t5A.png)Grafana Download Page

After you installed Grafana, open your web browser and go to [http://localhost:3000/.](http://localhost:3000/.) The default HTTP port that Grafana listens to is 3000 unless you have configured a different port. It should show you the login page. On the login page, enter admin for username and password. After you are logged in, you will see the prompt to change your default password. Change your default password, and submit. You are now on the Grafana home page.

![](https://miro.medium.com/max/1400/1*QcOWmhKE1CvnMISEqJkAfQ.png)Grafana Dashboard

## Configure the Data Source

Before we configure the data source, we need to run Monika and Prometheus. In case you forgot, here are the commands to run Monika and Prometheus both locally or using Docker:

```
_\# Run Monika
\# If you're installing Monika locally_
**monika -c monika.json --prometheus 3001**_\# Or if you're using Docker_
**docker run --name monika \\
    -p 3001:3001 \\
    -v ${PWD}/monika.json:/config/monika.json \\
    --prometheus 3001 \\
    --detach hyperjump/monika:latest**_\# Run Prometheus
\# If you're installing Prometheus locally_
**./prometheus --config.file=prometheus.yml**_\# Or if you're using Docker_
**docker run -d --name prometheus \\
    -p 9090:9090 \\
    -v <PATH\_TO\_prometheus.yml>:/etc/prometheus/prometheus.yml \\
    prom/prometheus --config.file=/etc/prometheus/prometheus.yml**
```

Back to the Grafana home page. On the left sidebar, hover the gear icon and select the Data Source option. Add a new data source by clicking the blue “Add data source” button. Then, select Prometheus as your data source.

![](https://miro.medium.com/max/1400/1*yfk-3lk4jpQuab-izUO2jw.png)Prometheus data source

If you are following the instructions from the previous article, you are running Prometheus in port 9090. Fill out the URL with [http://localhost:9090](http://localhost:9090) and click the Save and Test button. It should display a toast notification telling that the data source has been updated.

![](https://miro.medium.com/max/1400/1*HmTBocHPyw8BDFqqoWLzlA.png)Successfully set the data source.

## Creating the Dashboard

After the data source has been successfully added, hover over the plus icon sub-menu and select the Dashboard option. And then, click the “Add an Empty Panel” area. We are now going to create a probe status code information panel.

![](https://miro.medium.com/max/1400/1*qwQWyb3ts9Uhuxi_T1eH1w.png)Add an Empty Panel

You are now on the edit panel page. In the right top section of the page, change the “Time Series” dropdown to “Stat”. Then, navigate to the metrics browser input field, type monika_request_status_code_infoand press Shift + Enter. After that, on the right sidebar, change the Panel Title to “Probe Status Code” and scroll down to the Threshold section. Set the color red threshold to 500. Now it should look like this:

![](https://miro.medium.com/max/1400/1*dpn6IPBCk5L8cc-HxfZLpg.png)Probe Status Code

Apply the changes, and we are halfway done. Next, we are going to create another panel for monitoring the average response time per 5 minutes.

Create another panel in the current dashboard. Navigate to the metrics browser input field, type this in one line, and press Shift + Enter:

```
rate(monika\_request\_response\_time\_seconds\_sum\[5m\]) / rate(monika\_request\_response\_time\_seconds\_count\[5m\])
```

After that, on the right sidebar, change the Panel Title to “Probe Average Response Time”. Then on the right sidebar, scroll down to the “Standard Options” section and change the unit to “Milliseconds”. Apply the changes, and you’re done!

![](https://miro.medium.com/max/1400/1*nwUc_Qe-ms1C0gAQ2h1qDA.png)Average Response Time per 5 minutes

If you had trouble while doing all of the above, you can check out the recorded version below (Don’t forget to turn on subtitles/closed captions).

Visualize Monika data with Prometheus and Grafana

# Conclusion

![](https://miro.medium.com/max/1400/1*xvztYWCgyj7Z-XHkJMzFhw.png)The final result

Grafana is an open-source analytics software that can be used altogether with Monika and Prometheus. You can run Monika to check if your website is down periodically, export the data to Prometheus, and visualize the data using Grafana.

There is so much to explore with Monika, Prometheus, and Grafana. What I demonstrated is only the tip of the iceberg. You may also be interested in experimenting with what data you could query in Grafana using PromQL, check out [the PromQL cheat sheet](https://promlabs.com/promql-cheat-sheet/) as this helps me a lot when writing this article.

If you haven’t heard of Monika, Monika is an open-source and free synthetic monitoring command-line application. The name Monika stands for “**Moni**toring Ber**ka**la”, which means “periodic monitoring” in the Indonesian language.

With Monika, you can add as many websites as you want to monitor. You can monitor several conditions such as service outages or slow services. Also, you can configure Monika to send notifications of the incidents on your services through your favorite communication tools like SMTP mail, Telegram, [**WhatsApp**](https://whatsapp.hyperjump.tech/) (It’s free!), etc.

Check out our repository in Github where you can request features and report an issue/bug below:

[

## GitHub - hyperjumptech/monika: Monika is a command line application to monitor every part of your…

### Monika is a command line application to monitor every part of your web app using a simple JSON configuration file. Get…

github.com

](https://github.com/hyperjumptech/monika)

Thank you for reading this article. Time to show off to my boss with my beautiful graphs.

See you next article!

[Hyperjump](https://hyperjump.tech/) is an open-source-first company providing engineering excellence service. We aim to build and commercialize [open-source tools](https://github.com/hyperjumptech) to help companies streamline, simplify, and secure the most important aspects of its modern DevOps practices.

[

## Hyperjump

### Open source first. Cloud native. DevOps excellence.

hyperjump.tech

](https://hyperjump.tech/)
