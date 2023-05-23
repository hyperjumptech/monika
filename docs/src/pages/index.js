/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'

import { Seo } from '../components/Seo'
import GithubButton from '../components/homepage/github-button'
import PrimaryButton from '../components/homepage/primary-button'
import TestimonialCard from '../components/homepage/testimonial-card'
import FeatureCard from '../components/homepage/feature-card'
import ArticleCard from '../components/homepage/article-card'
import { event } from 'lib/gtag'

export default function IndexPage() {
  const [isOpenMobileMenu, setOpenMobileMenu] = useState(false)
  const integrations = [
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#desktop-notifications',
      img: 'desktop.png',
      title: 'Desktop Notification',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#discord',
      img: 'discord.png',
      title: 'Discord',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#facebook-workplace',
      img: 'facebook.png',
      title: 'Facebook workplace',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#google-chat',
      img: 'google.png',
      title: 'Google Chat',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#larksuite-notifications',
      img: 'lark.png',
      title: 'Lark Suite',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#mailgun',
      img: 'mailgun.png',
      title: 'Mailgun',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#microsoft-teams',
      img: 'teams.png',
      title: 'Microsoft Teams',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#monika-whatsapp-notifier',
      img: 'whatsapp.png',
      title: 'Monika WA Notifier',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#pagerduty',
      img: 'pagerduty.png',
      title: 'PagerDuty',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#sendgrid',
      img: 'sendgrid.png',
      title: 'SendGrid',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#slack-incoming-webhook',
      img: 'slack.png',
      title: 'Slack',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#smtp',
      img: 'smtp.png',
      title: 'SMTP',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#telegram',
      img: 'telegram.png',
      title: 'Telegram',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#webhook',
      img: 'webhook.png',
      title: 'Webhook',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#whatsapp-business',
      img: 'whatsapp.png',
      title: 'WhatsApp Business',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#dingtalk',
      img: 'dingtalk.png',
      title: 'Dingtalk',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#pushover',
      img: 'pushover.png',
      title: 'Pushover',
      tag: '',
    },
    {
      url: 'https://hyperjumptech.github.io/monika/guides/notifications#opsgenie',
      img: 'opsgenie.png',
      title: 'Opsgenie',
      tag: '',
    },
  ]

  return (
    <>
      <div className="teleporthq-container">
        <Head>
          <title>Monika - Free and Open Source Synthetic Monitoring Tool</title>
          <meta property="og:title" content="Monika Landing Page New" />
        </Head>
        <Seo
          title="Monika"
          description="Free and Open Source Synthetic Monitoring Tool"
        />
        <div data-role="Header" className="header-container">
          <header className="header">
            <div className="logo">
              <Link href="/">
                <a className="link">
                  <img
                    alt="image"
                    src="/playground_assets/logo-monika-color%20%5B1%5D-1500h.png"
                    className="image"
                  />
                </a>
              </Link>
            </div>
            <div className="menu">
              <Link href="/overview">
                <a className="link01 mx-3">Documentation</a>
              </Link>
              <a
                href="https://monika-config.hyperjump.tech/"
                target="_blank"
                rel="noreferrer noopener"
                className="link02 mr-3 text-center"
              >
                Config Generator
              </a>
              <a
                href="https://whatsapp.hyperjump.tech/"
                target="_blank"
                rel="noreferrer noopener"
                className="link03 mr-3 text-center"
              >
                WhatsApp Notifier
              </a>
              <a
                href="https://github.com/hyperjumptech/monika/discussions"
                target="_blank"
                rel="noreferrer noopener"
                className="text"
              >
                Discussion
              </a>
              <div className="md:flex hidden w-36 justify-center items-center bg-gradient-to-r from-aqua-monika to-purple-monika rounded-full p-08 h-9">
                <a
                  className="flex flex-row justify-items-center justify-center bg-black w-full rounded-full md:p-1 pl-1 h-8"
                  href="https://github.com/hyperjumptech/monika"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img alt="stars" src="/playground_assets/github_icons.svg" />
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika pl-2 text-xs md:text-base font-bold md:m-08 m-2">
                    Github
                  </p>
                </a>
              </div>
            </div>
            {!isOpenMobileMenu && (
              <div
                data-type="BurgerMenu"
                className="burger-menu"
                onClick={() => setOpenMobileMenu(true)}
              >
                <svg viewBox="0 0 1024 1024" className="menu1">
                  <path d="M810.667 725.333h-597.333c-47.061 0-85.333 38.272-85.333 85.333s38.272 85.333 85.333 85.333h597.333c47.061 0 85.333-38.272 85.333-85.333s-38.272-85.333-85.333-85.333z"></path>
                  <path d="M810.667 426.667h-597.333c-47.061 0-85.333 38.272-85.333 85.333s38.272 85.333 85.333 85.333h597.333c47.061 0 85.333-38.272 85.333-85.333s-38.272-85.333-85.333-85.333z"></path>
                  <path d="M810.667 128h-597.333c-47.061 0-85.333 38.272-85.333 85.333s38.272 85.333 85.333 85.333h597.333c47.061 0 85.333-38.272 85.333-85.333s-38.272-85.333-85.333-85.333z"></path>
                </svg>
              </div>
            )}
          </header>
          <div
            data-type="MobileMenu"
            className="mobile-menu"
            style={{ display: isOpenMobileMenu ? 'block' : 'none' }}
          >
            <div className="top">
              <Link href="/">
                <a className="link05">
                  <div className="logo1">
                    <img
                      alt="image"
                      src="/playground_assets/logo-monika-color%20%5B1%5D-1500h.png"
                      className="image01"
                    />
                  </div>
                </a>
              </Link>
              <div
                data-type="CloseMobileMenu"
                className="close-menu"
                onClick={() => setOpenMobileMenu(false)}
              >
                <svg viewBox="0 0 1024 1024" className="icon3">
                  <path d="M810 274l-238 238 238 238-60 60-238-238-238 238-60-60 238-238-238-238 60-60 238 238 238-238z"></path>
                </svg>
              </div>
            </div>
            <div className="mid">
              <Link href="/overview">
                <a className="link06">Documentation</a>
              </Link>
              <a
                href="https://monika-config.hyperjump.tech/"
                target="_blank"
                rel="noreferrer noopener"
                className="link07"
              >
                Config Generator
              </a>
              <a
                href="https://whatsapp.hyperjump.tech/"
                target="_blank"
                rel="noreferrer noopener"
                className="link08"
              >
                WhatsApp Notifier
              </a>
              <a
                href="https://github.com/hyperjumptech/monika/discussions"
                target="_blank"
                rel="noreferrer noopener"
                className="link09"
              >
                Discussion
              </a>
              <a
                href="https://github.com/hyperjumptech/monika"
                target="_blank"
                rel="noreferrer noopener"
                className="link09"
              >
                GitHub
              </a>
            </div>
            <a
              href="https://github.com/hyperjumptech/monika"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden"
            >
              <GithubButton
                rootClassName="rootClassName"
                className="component01"
              ></GithubButton>
            </a>
          </div>
        </div>
        <div className="main">
          <img
            alt="image"
            src="/playground_assets/ellipse-1500w.png"
            className="image02"
          />
          <div className="hero">
            <img
              src="/playground_assets/world%20dot-logo%20%5B2%5D-700w.png"
              className="image03"
            />
            <div className="relative">
              <div className="md:w-128 w-full">
                <h1 className="lg:text-left text-center md:text-52 text-3xl font-bold md:leading-62 leading-tight text-white">
                  Get WhatsApp notification when your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika md:text-52 text-4x font-bold md:leading-62 leading-tight">
                    {' '}
                    web app is down
                  </span>
                </h1>
                <p className="my-5 text-white md:text-xl text-sm font-normal lg:text-left text-center">
                  Or from any other communication channel. It&apos;s quick,
                  easy, and completely free!
                </p>
              </div>
              <div className="flex flex-col justify-center lg:items-start items-center">
                <img
                  alt="image"
                  src="/playground_assets/socials-group-200h.png"
                  className="grid grid-cols-4 gap-4 max-w-full h-auto"
                />
                <div className="lg:w-full w-full md:w-4/5">
                  <Link href="/quick-start">
                    <a
                      onClick={() =>
                        event({
                          action: 'cta_button_hero',
                          category: 'cta_button',
                        })
                      }
                    >
                      <PrimaryButton
                        button="Get Started in 30 seconds"
                        rootClassName="rootClassName"
                        className="w-full"
                      ></PrimaryButton>
                    </a>
                  </Link>
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-1 items-center bg-gradient-to-r from-aqua-monika to-purple-monika rounded-full p-08 mr-2 h-9">
                      <a
                        className="flex flex-row justify-items-center justify-center bg-black w-full rounded-full md:p-1 pl-1 h-8"
                        href="https://github.com/hyperjumptech/monika"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <img
                          className="py-1 md:py-0"
                          alt="stars"
                          src="/playground_assets/github_icons.svg"
                        />
                        <p className="pl-2 text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika text-base font-bold md:m-08 my-1">
                          Stars (
                        </p>
                        <img
                          className="md:w-auto md:py-0 py-1"
                          alt="Github stars"
                          src="https://img.shields.io/github/stars/hyperjumptech/monika?color=%2366000000%20&label=%20&logo=%20%20&style=flat-square"
                        />
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika text-base font-bold md:m-08 my-1">
                          )
                        </p>
                      </a>
                    </div>
                    <div className="flex flex-1 items-center bg-gradient-to-r from-aqua-monika to-purple-monika rounded-full p-08 h-9">
                      <a
                        className="flex justify-items-start"
                        href="https://github.com/hyperjumptech/monika"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <div className="w-2/3 justify-center bg-black rounded-l-3xl mr-2 md:mr-5 p-1 md:px-5 h-8">
                          <p className="text-white text-base font-bold mx-2">
                            Downloads
                          </p>
                        </div>
                        <img
                          className="w-10 md:p-0 py-08"
                          alt="Github downloads"
                          src="https://img.shields.io/github/downloads/hyperjumptech/monika/total?color=%2366000000%20&label=%20&logo=%20&style=flat-square"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <iframe
                className="relative md:w-28r w-full justify-center mt-5 lg:my-2 h-96 ml-3"
                src="https://www.youtube.com/embed/po1XHcIbJVw"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={true}
              />
            </div>
          </div>
        </div>
        <div className="line">
          <div className="absolute right-0 top-0 bg-gradient-to-r from-aqua-monika to-purple-monika w-1/2 md:w-96 h-6"></div>
        </div>
        <div className="testimonials">
          <div className="container05 my-10">
            <div className="container">
              <p className="md:text-3xl text-xl md:text-left text-center">
                Let’s Hear What{' '}
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika">
                  They Say
                </span>
              </p>
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika md:text-52 text-4xl font-bold md:text-left text-center">
                About Monika
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <TestimonialCard
                  description="Thank you Monika by Hyperjump.  With Monika, we can improve our services SLA, get notified early when we have a server issue. Easy to install, have multi notification channels, can be setup from different server regions, and is easy to integrate on the dashboard make it all complete and help us to analyze the issue asap."
                  name="Eric Sudadyo"
                  text="DevOps Manager, Yummycorp"
                  image_src="/playground_assets/yummy-200h.png"
                />
                <TestimonialCard
                  description="Before using Monika, we were unaware when our website is down until our users reported it. We don’t want it to happen again. Now with Monika, we are notified much faster so our team can react quicker to solve the issue. Thank you, Monika!"
                  name="Marsya Nurmaranti"
                  text="Executive Director, Indorelawan"
                  image_src="/playground_assets/indorelawan_logomerah%20panjang_png-200h.png"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="line">
          <div className="absolute left-0 top-0 bg-gradient-to-r from-aqua-monika to-purple-monika w-1/2 md:w-96 h-6"></div>
        </div>
        <img
          alt="image"
          src="/playground_assets/ellipse-1500w.png"
          className="image06"
        />
        <div className="features">
          <h1 className="md:text-52 text-3xl md:text-left text-center text-white mb-3">
            4 Simple Steps to Start{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika">
              Monika
            </span>
          </h1>
          <span className="text13">
            <span className="text14">
              Here are the steps to guide you to use Monika.
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
            <br></br>
            <span className="text16">
              Hold your worry, this won&apos;t take hours for you to understand.
            </span>
          </span>
          <div className="features1">
            <div className="container10">
              <FeatureCard
                text="Already know what you want to monitor? Great! First step done!"
                title="1. Decide what to monitor"
                image_src="/playground_assets/step1-400w.png"
                rootClassName="rootClassName"
              ></FeatureCard>
            </div>
            <div className="container11">
              <FeatureCard
                text="Get Monika using the popular package manager: Homebrew (macOS), Snap (Linux), or Chocolatey (Windows)"
                title="2. Install"
                title3="npm i -g @hyperjumptech/monika"
                image_src="/playground_assets/downloading-400w.png"
                rootClassName="rootClassName2"
              ></FeatureCard>
            </div>
            <div className="container13">
              <FeatureCard
                text="You need monika.yml. Define how requests are set up (Probe), how it is triggered (Alerts), and how would you like to receive the notifications. Use our Config generator to get the monika.yml super easily!"
                text1="Monika config generator"
                title="3. Create configuration file"
                image_src="/playground_assets/configuration%20file-400w.png"
                link_text="https://monika-config.hyperjump.tech/"
                rootClassName="rootClassName1"
              />
              <p className="mt-5 text-center">
                <a
                  href="https://monika-config.hyperjump.tech/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-aqua-monika text-sm"
                >
                  Monika Config Generator
                </a>
              </p>
            </div>
            <div className="container14">
              <FeatureCard
                text="Monika by default reads a yaml configuration file called monika.yml in the current working directory if it exists. Run this command in the Terminal from the directory that contains the monika.yml file:"
                title="4. Run"
                title2="Monika"
                image_src="/playground_assets/step%204-400w.png"
                rootClassName="rootClassName3"
              ></FeatureCard>
              <div className="container15">
                <span className="text18">monika</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center flex-col mb-10">
            <img
              alt="image"
              src="/playground_assets/success%20%5B1%5D-500w.png"
              className="w-32r mb-5 object-cover"
            />
            <p className="text-2xl w-3/4 text-white text-center font-semibold">
              Congratulations! Your web app is being monitored and Monika will
              send you notification if something happens.
            </p>
          </div>
        </div>

        <div className="bg-white w-full py-10">
          <div className="flex flex-col text-center pb-12">
            <h3 className="text20 headline3">Integrations</h3>
            <p class="text-black">Set up multiple ways to get notified:</p>
          </div>
          <div className="container text-center grid grid-cols-3 pb-12 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {integrations.map((integration) => {
              return (
                <div className="border-1 flex flex-wrap justify-center bg-white shadow py-2 px-4">
                  <a href={integration.url}>
                    <img
                      alt={integration.title}
                      src={`/playground_assets/partner/${integration.img}`}
                      className="w-14 mx-auto"
                    />
                    <p class="text-xs text-bold">{integration.title}</p>
                  </a>
                </div>
              )
            })}
          </div>
        </div>

        <div className="use-case pt-8 md:pt-10">
          <img
            alt="image"
            src="/playground_assets/assets%20%5B1%5D-600w.png"
            className="image08"
          />
          <div className="use-case1">
            <div className="container16">
              <div className="container17">
                <h3 className="text20 headline3">
                  What more can I do with Monika?
                </h3>
                <span className="text21 lead1">
                  <span className="text22">
                    Here are Monika&apos;s capabilities and features to inspire
                    and get you to start monitoring your IT systems.
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </span>
                </span>
              </div>
            </div>
            <div className="container18">
              <ArticleCard
                text="Connecting Monika with Prometheus"
                text1="By marrying Monika with Prometheus, you can display and query Monika’s data beautifully in Prometheus GUI or other data visualization tools like Grafana."
                text3="Read more"
                image_src="/playground_assets/monika%20prometheus%20image-300w.png"
                link_text="https://medium.com/hyperjump-tech/collecting-monika-with-prometheus-9faa7d484a30"
              ></ArticleCard>
              <ArticleCard
                text="Use Existing Postman Collections with Monika"
                text1="Postman is one of the great tools to monitor your API, but maybe you’re looking for a free and open-source solution for your needs. With Monika, you can easily monitor websites without any monthly limitations. You can install Monika anywhere you want and monitor your websites right away."
                text3="Read more"
                image_src="/playground_assets/0_1ullm9_btddg5chl-300w.jpg"
                link_text="https://medium.com/hyperjump-tech/use-existing-postman-collections-with-monika-an-alternative-solution-to-postman-monitoring-770572eedb2c"
              ></ArticleCard>
            </div>
            <div className="container19">
              <ArticleCard
                text="TLS certificate reminder"
                text1="With Monika, you don’t have to worry about expiring TLS certificates anymore. Not that only you have prevented your TLS certificate from being expired, you also monitored your website performance. Hitting two birds with one stone."
                text3="Read more"
                image_src="/playground_assets/0_rkxf1wgagwy5ofi--200h.jpg"
                link_text="https://medium.com/hyperjump-tech/forgot-to-renew-the-tls-certificates-monika-will-remind-you-from-now-on-188407c484ba"
              ></ArticleCard>
              <ArticleCard
                text="Chaining request"
                text1="With Monika, you can add as many requests as you want to monitor. You can monitor several undesirable events such as service outages or slow services."
                text3="Read more"
                image_src="/playground_assets/0_3uyi1whqf7rak1su-200h.jpg"
                link_text="https://medium.com/@asheeshmisra29/chaining-requests-in-postman-part-1-6539ba0ac2ea"
              ></ArticleCard>
            </div>
          </div>
        </div>
        <div className="c-t-a">
          <img
            src="/playground_assets/hero-bg-line.svg"
            className="absolute mt-20 w-100%"
          />
          <div className="container20">
            <div className="container21">
              <h2 className="text-white md:text-left lg:text-32 text-2xl mt-auto text-center font-bold">
                Get Started with Monika Now!
              </h2>
              <p className="text-white font-medium lg:text-lg lg:w-11/12 w-full my-5 md:text-left text-center">
                Monika is an open source synthetic monitoring command line
                application. it is actively developed and completely free!
              </p>
              <div className="buttonFooter">
                <Link href="/quick-start">
                  <a
                    className="link25 button"
                    onClick={() =>
                      event({
                        action: 'cta_button_footer',
                        category: 'cta_button',
                      })
                    }
                  >
                    Start Now
                  </a>
                </Link>
              </div>
            </div>
            <div className="container22">
              <h2 className="text-white md:text-left lg:text-32 text-2xl mt-auto text-center font-bold">
                Looking for a Low-Code Version Monitoring Solution? Try Neo
                Sense!
              </h2>
              <p className="text-white font-medium lg:w-11/12 w-full lg:text-lg my-5 md:text-left text-center">
                Elevate your Monika experience with Neo Sense, featuring an
                intuitive interface and dashboard.
              </p>
              <div className="buttonFooter2">
                <Link href="https://neosense.bgnlab.id/login">
                  <a
                    className="link15 button"
                    onClick={() =>
                      event({
                        action: 'cta_button_footer',
                        category: 'cta_button',
                      })
                    }
                  >
                    Try Neo Sense Now!
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="footer">
          <footer className="container23">
            <div className="container24">
              <div className="container25">
                <Link href="/">
                  <a className="link16">
                    <img
                      alt="image"
                      src="/playground_assets/logo-monika-color%20%5B1%5D-1500h.png"
                      className="image09"
                    />
                  </a>
                </Link>
              </div>
              <div className="container26">
                <span className="text27">Resources</span>
                <Link href="/overview">
                  <a className="link17">Documentation</a>
                </Link>
                <Link href="https://medium.com/hyperjump-tech">
                  <a className="link17">Blog</a>
                </Link>
                <Link href="/articles">
                  <a className="link18">How-to</a>
                </Link>
                <Link href="/guides/examples">
                  <a className="link19">Example</a>
                </Link>
                <a
                  href="https://monika-config.hyperjump.tech/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link20"
                >
                  Config Generator
                </a>
                <a
                  href="https://whatsapp.hyperjump.tech/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text28"
                >
                  WhatsApp Notifier
                </a>
              </div>
              <div className="container27">
                <span className="text29">Community</span>
                <a
                  href="https://github.com/hyperjumptech/monika/discussions"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link20"
                >
                  Discussion
                </a>
                <a
                  href="https://github.com/hyperjumptech/monika/releases"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link21"
                >
                  Releases
                </a>
                <a
                  href="https://www.npmjs.com/package/@hyperjumptech/monika"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link22"
                >
                  NPM Homepage
                </a>
              </div>
              <div className="container28">
                <a
                  href="https://hyperjump.tech/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link23"
                >
                  <img
                    alt="image"
                    src="/playground_assets/hyperjump%20%5B1%5D-200h.png"
                    className="image10"
                  />
                </a>
                <span className="text30">
                  {' '}
                  PT Artha Rajamas Mandiri (Hyperjump) is an open-source-first
                  company providing engineering excellence service. We aim to
                  build and commercialize open-source tools to help companies
                  streamline, simplify, and secure the most important aspects of
                  its modern DevOps practices.
                </span>
              </div>
            </div>
            <div className="divider"></div>
            <div className="container29">
              <span className="text31 body2">
                Copyright © 2022 Hyperjump Tech. All Rights Reserved.
              </span>
            </div>
          </footer>
        </div>
      </div>
      <style jsx>
        {`
          .teleporthq-container {
            width: 100%;
            height: auto;
            display: flex;
            overflow: hidden;
            min-height: 100vh;
            align-items: center;
            flex-direction: column;
            background-color: var(--dl-color-gray-black);
          }
          .header-container {
            width: 100%;
            display: flex;
            align-items: center;
            flex-direction: column;
            background-color: var(--dl-color-gray-black);
          }
          .header {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            z-index: 100;
            position: relative;
            max-width: 1110px;
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
          }
          .logo {
            display: flex;
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
          }
          .link {
            display: contents;
          }
          .image {
            width: 100px;
            object-fit: cover;
            text-decoration: none;
          }
          .menu {
            display: flex;
            align-items: flex-start;
            flex-direction: row;
          }
          .link01 {
            color: var(--dl-color-gray-white);
            transition: 0.3s;
            text-decoration: none;
          }
          .link01:hover {
            color: var(--dl-color-turquoise-default);
          }
          .link02 {
            color: var(--dl-color-gray-white);
            transition: 0.3s;
            text-decoration: none;
          }
          .link02:hover {
            color: var(--dl-color-turquoise-default);
          }
          .link03 {
            color: var(--dl-color-gray-white);
            transition: 0.3s;
            text-decoration: none;
          }
          .link03:hover {
            color: var(--dl-color-turquoise-default);
          }
          .text {
            color: var(--dl-color-gray-white);
            transition: 0.3s;
            margin-right: var(--dl-space-space-doubleunit);
            text-decoration: none;
          }
          .text:hover {
            color: var(--dl-color-turquoise-default);
          }
          .burger-menu {
            display: none;
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
          }
          .menu1 {
            fill: var(--dl-color-gray-white);
            width: 24px;
            height: 24px;
            margin-left: var(--dl-space-space-unit);
          }
          .link04 {
            display: contents;
          }
          .component {
            text-decoration: none;
          }
          .mobile-menu {
            top: 0px;
            flex: 0 0 auto;
            left: 0px;
            width: 100%;
            height: 100vh;
            display: none;
            padding: var(--dl-space-space-doubleunit);
            z-index: 101;
            position: absolute;
            align-items: flex-start;
            flex-direction: column;
            background-color: var(--dl-color-gray-white);
          }
          .top {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            align-items: center;
            margin-bottom: var(--dl-space-space-unit);
            flex-direction: row;
            justify-content: space-between;
          }
          .link05 {
            display: contents;
          }
          .logo1 {
            display: flex;
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
            text-decoration: none;
          }
          .image01 {
            width: 100px;
            object-fit: cover;
          }
          .close-menu {
            flex: 0 0 auto;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
          }
          .icon3 {
            width: 24px;
            height: 24px;
          }
          .mid {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
          }
          .link06 {
            transition: 0.3s;
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .link06:hover {
            color: var(--dl-color-turquoise-default);
          }
          .link07 {
            transition: 0.3s;
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .link07:hover {
            color: var(--dl-color-turquoise-default);
          }
          .link08 {
            transition: 0.3s;
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .link08:hover {
            color: var(--dl-color-turquoise-default);
          }
          .link09 {
            transition: 0.3s;
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .link09:hover {
            color: var(--dl-color-turquoise-default);
          }
          .component01 {
            text-decoration: none;
          }
          .main {
            width: 100%;
            display: flex;
            position: relative;
            align-items: center;
            flex-direction: column;
            background-color: var(--dl-color-gray-black);
          }
          .image02 {
            top: -107px;
            right: -179px;
            width: 1100px;
            filter: blur(40px);
            opacity: 0.4;
            z-index: 0;
            position: absolute;
            object-fit: cover;
          }
          .hero {
            flex: 0 0 auto;
            width: 100%;
            height: 80vh;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            position: relative;
            max-width: 1110px;
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .image03 {
            left: 0px;
            width: 700px;
            bottom: -400px;
            opacity: 0.6;
            z-index: 0;
            position: absolute;
            object-fit: cover;
          }
          .container01 {
            flex: 0 0 auto;
            width: auto;
            height: auto;
            display: flex;
            position: relative;
            align-items: space-between;
            flex-direction: column;
          }
          .container02 {
            flex: 0 0 auto;
            width: auto;
            height: auto;
            display: flex;
            padding: var(--dl-space-space-halfunit);
            position: relative;
            align-items: flex-start;
            flex-direction: column;
          }
          .text01 {
            color: var(--dl-color-gray-white);
            width: 560px;
            font-size: 52px;
            text-align: left;
            font-family: Inter;
            font-weight: 700;
            text-transform: none;
            text-decoration: none;
            line-height: 120%;
          }
          .text05 {
            font-size: 52px;
            font-style: normal;
            font-weight: 700;
            margin-bottom: var(--dl-space-space-unit);
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 120%;
          }
          .text06 {
            margin-top: var(--dl-space-space-unit);
            margin-bottom: var(--dl-space-space-unit);
          }
          .text07 {
            color: var(--dl-color-gray-white);
          }
          .text08 {
            color: var(--dl-color-gray-white);
          }
          .image04 {
            width: 80%;
            z-index: 100;
            position: relative;
            object-fit: cover;
            margin-bottom: var(--dl-space-space-unit);
          }
          .link11 {
            display: contents;
          }
          .component02 {
            text-decoration: none;
          }
          .container03 {
            flex: 0 0 auto;
            width: auto;
            height: auto;
            display: flex;
            align-items: flex-start;
            justify-content: center;
          }
          .link12 {
            display: contents;
          }
          .component03 {
            text-decoration: none;
          }
          .link13 {
            display: contents;
          }
          .component04 {
            text-decoration: none;
          }
          .container04 {
            flex: 0 0 auto;
            width: 400px;
            height: auto;
            display: flex;
            align-items: space-between;
            flex-direction: column;
          }
          .video {
            width: 400px;
            height: 338px;
            margin-bottom: var(--dl-space-space-unit);
          }
          .testimonials {
            width: 100%;
            display: flex;
            z-index: 11;
            align-items: center;
            padding-top: var(--dl-space-space-tripleunit);
            padding-left: var(--dl-space-space-doubleunit);
            padding-right: var(--dl-space-space-doubleunit);
            flex-direction: row;
            padding-bottom: var(--dl-space-space-tripleunit);
            justify-content: center;
            background-color: var(--dl-color-gray-white);
            transform: skew(0deg, -5deg);
          }
          .line {
            width: 100%;
            padding: 10px;
            transform: skew(0deg, -5deg);
          }
          .container05 {
            display: flex;
            flex-wrap: wrap;
            max-width: 1100px;
            align-items: center;
            flex-direction: row;
            justify-content: center;
            transform: skew(0deg, 5deg);
          }
          .container06 {
            flex: 0 0 auto;
            display: flex;
            position: relative;
            align-items: flex-start;
            flex-direction: column;
          }
          .image05 {
            top: -22px;
            left: -65px;
            right: auto;
            width: 100px;
            bottom: auto;
            z-index: 10;
            position: absolute;
            object-fit: cover;
          }
          .text09 {
            z-index: 100;
            max-width: 500px;
          }
          .text10 {
            z-index: 100;
            max-width: 500px;
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .container07 {
            flex: 0 0 auto;
            width: 350px;
            display: flex;
            align-self: flex-end;
            margin-top: var(--dl-space-space-doubleunit);
            align-items: center;
            flex-direction: column;
            justify-content: center;
          }
          .container08 {
            flex: 0 0 auto;
            display: flex;
            align-items: flex-start;
            margin-left: var(--dl-space-space-doubleunit);
            flex-direction: column;
          }
          .container09 {
            width: 350px;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
          }
          .image06 {
            top: 1710px;
            filter: blur(40px);
            opacity: 0.4;
            z-index: 1;
            position: absolute;
            max-width: 100%;
            object-fit: cover;
          }
          .features {
            flex: 0 0 auto;
            margin-top: 2rem;
            width: 100%;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            z-index: 100;
            max-width: 1110px;
            align-items: center;
            flex-direction: column;
            justify-content: flex-start;
          }
          .text11 {
            color: var(--dl-color-gray-white);
          }
          .text12 {
            font-size: 48px;
            font-family: Inter;
            font-weight: 800;
            text-transform: none;
            text-decoration: none;
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .text13 {
            color: var(--dl-color-gray-white);
            text-align: center;
          }
          .text14 {
            text-align: center;
          }
          .text16 {
            text-align: center;
          }
          .features1 {
            display: flex;
            flex-wrap: wrap;
            margin-top: var(--dl-space-space-doubleunit);
            align-items: flex-center;
            flex-direction: row;
            justify-content: center;
          }
          .container10 {
            flex: 0 0 auto;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            align-items: flex-start;
            flex-direction: column;
          }
          .container11 {
            flex: 0 0 auto;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            align-items: flex-start;
            flex-direction: column;
          }
          .container12 {
            flex: 0 0 auto;
            display: flex;
            padding: var(--dl-space-space-unit);
            align-self: center;
            margin-top: var(--dl-space-space-halfunit);
            align-items: flex-start;
            border-radius: var(--dl-radius-radius-radius8);
            flex-direction: column;
            justify-content: center;
            background-color: var(--dl-color-gray-900);
          }
          .text17 {
            color: var(--dl-color-gray-white);
            width: 100%;
            font-size: 14px;
            align-self: center;
            font-style: normal;
            font-weight: 700;
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .container13 {
            flex: 0 0 auto;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            // align-items: flex-start;
            flex-direction: column;
          }
          .link14 {
            color: #25ccdb;
            margin-top: var(--dl-space-space-halfunit);
            text-decoration: underline;
          }
          .container14 {
            flex: 0 0 auto;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            align-items: flex-start;
            flex-direction: column;
          }
          .container15 {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            padding: var(--dl-space-space-unit);
            align-self: center;
            margin-top: var(--dl-space-space-halfunit);
            align-items: flex-start;
            border-radius: var(--dl-radius-radius-radius8);
            flex-direction: column;
            justify-content: center;
            background-color: var(--dl-color-gray-900);
          }
          .text18 {
            color: var(--dl-color-gray-white);
            width: 100%;
            font-size: 14px;
            align-self: center;
            font-style: normal;
            font-weight: 700;
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .image07 {
            max-width: 500px;
            margin-top: var(--dl-space-space-doubleunit);
            object-fit: cover;
            margin-left: var(--dl-space-space-unit);
            margin-right: var(--dl-space-space-unit);
          }
          .text19 {
            color: var(--dl-color-gray-white);
            font-size: 26px;
            max-width: 500px;
            font-style: normal;
            margin-top: var(--dl-space-space-unit);
            text-align: center;
            font-weight: 600;
            margin-bottom: var(--dl-space-space-doubleunit);
          }
          .use-case {
            flex: 0 0 auto;
            width: auto;
            height: auto;
            display: flex;
            position: relative;
            align-items: flex-start;
            justify-content: center;
          }
          .image08 {
            top: 0px;
            width: 600px;
            margin: var(--dl-space-space-tripleunit);
            opacity: 0.8;
            position: absolute;
            object-fit: cover;
          }
          .use-case1 {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            padding: var(--dl-space-space-unit);
            z-index: 100;
            max-width: 1110px;
            align-items: flex-start;
            flex-direction: row;
            justify-content: flex-start;
          }
          .container16 {
            flex: 0 0 auto;
            width: auto;
            height: auto;
            display: flex;
            position: relative;
            max-width: 300px;
            align-items: flex-start;
            flex-direction: column;
          }
          .container17 {
            display: flex;
            max-width: 400px;
            align-items: flex-start;
            flex-direction: column;
            justify-content: flex-start;
          }
          .text20 {
            color: var(--dl-color-gray-white);
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .text21 {
            color: var(--dl-color-gray-white);
            max-width: 400px;
            margin-top: var(--dl-space-space-doubleunit);
            margin-bottom: var(--dl-space-space-doubleunit);
          }
          .text22 {
            white-space: pre-wrap;
          }
          .container18 {
            flex: 0 0 auto;
            display: flex;
            align-self: flex-start;
            align-items: center;
            flex-direction: column;
            justify-content: flex-start;
          }
          .container19 {
            flex: 0 0 auto;
            display: flex;
            align-self: flex-start;
            align-items: center;
            padding-top: 7rem;
            flex-direction: column;
            justify-content: flex-start;
          }
          .c-t-a {
            width: 96%;
            display: flex;
            overflow: hidden;
            align-items: center;
            flex-direction: column;
            justify-content: center;
          }
          .container20 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            z-index: 100;
            max-width: 1110px;
            margin-bottom: var(--dl-space-space-doubleunit);
          }
          .container21 {
            flex: 1;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            flex-direction: column;
            justify-content: flex-start;
            background-color: #1b1b1b;
            border-radius: 12px;
            margin: var(--dl-space-space-unit);
          }
          .text23 {
            color: var(--dl-color-gray-white);
            text-align: center;
          }
          .text24 {
            white-space: pre-wrap;
          }
          .text25 {
            color: var(--dl-color-gray-white);
            max-width: 600px;
            text-align: center;
            margin-bottom: var(--dl-space-space-unit);
          }
          .text26 {
            white-space: pre-wrap;
          }
          .container22 {
            flex: 1;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            flex-direction: column;
            justify-content: flex-start;
            background: linear-gradient(350deg, #2fdcdc, rgba(255, 0, 0, 0) 20%),
              linear-gradient(45deg, #2fdcdc, rgba(0, 255, 0, 0) 30.71%),
              linear-gradient(336deg, #987ce8, #987ce8 80.71%);
            border-radius: 12px;
            margin: var(--dl-space-space-unit);
          }
          .buttonFooter {
            flex: 0 0 auto;
            display: flex;
            width: 250px;
            align-items: center;
            border-radius: 20px;
            flex-direction: column;
            justify-content: center;
            background: linear-gradient(310deg, #2fdcdc, #987ce8);
            margin-top: auto;
          }
          .buttonFooter2 {
            flex: 0 0 auto;
            display: flex;
            width: 250px;
            align-items: center;
            border-radius: 20px;
            flex-direction: column;
            justify-content: center;
            background-color: var(--dl-color-gray-white);
            margin-top: auto;
          }
          .link15 {
            font-size: 16px;
            font-style: normal;
            font-weight: 600;
            border-width: 0px;
            border-radius: var(--dl-radius-radius-radius6);
            text-decoration: none;
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .link25 {
            font-size: 16px;
            font-style: normal;
            font-weight: 600;
            border-width: 0px;
            border-radius: var(--dl-radius-radius-radius6);
            text-decoration: none;
            background-color: var(--dl-color-gray-white);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .footer {
            flex: 0 0 auto;
            color: var(--dl-color-gray-white);
            width: 100%;
            display: flex;
            align-items: flex-start;
            flex-direction: row;
            justify-content: center;
            background-color: var(--dl-color-gray-black);
          }
          .container23 {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            margin-top: 2rem;
            padding: var(--dl-space-space-doubleunit);
            z-index: 100;
            flex-wrap: wrap;
            max-width: 1110px;
            align-items: flex-start;
            flex-direction: column;
            justify-content: space-between;
          }
          .container24 {
            flex: 1;
            display: flex;
            padding: var(--dl-space-space-unit);
            justify-content: space-between;
          }
          .container25 {
            flex: 1;
            width: 200px;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
          }
          .link16 {
            display: contents;
          }
          .image09 {
            object-fit: cover;
            text-decoration: none;
          }
          .container26 {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
          }
          .text27 {
            font-style: normal;
            font-weight: 700;
            margin-bottom: var(--dl-space-space-unit);
          }
          .link17 {
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .link18 {
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .link19 {
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .text28 {
            text-decoration: none;
          }
          .container27 {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
          }
          .text29 {
            font-style: normal;
            font-weight: 700;
            margin-bottom: var(--dl-space-space-unit);
          }
          .link20 {
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .link21 {
            margin-bottom: var(--dl-space-space-halfunit);
            text-decoration: none;
          }
          .link22 {
            text-decoration: none;
          }
          .container28 {
            flex: 1;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
          }
          .link23 {
            display: contents;
          }
          .image10 {
            width: 120px;
            object-fit: cover;
            margin-bottom: var(--dl-space-space-unit);
            text-decoration: none;
          }
          .text30 {
            font-size: 14px;
          }
          .divider {
            width: 100%;
            height: 1px;
            opacity: 0.2;
            background-color: var(--dl-color-gray-white);
          }
          .container29 {
            width: 100%;
            display: flex;
            margin-top: var(--dl-space-space-unit);
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
          }
          .text31 {
            color: var(--dl-color-gray-300);
            margin-top: var(--dl-space-space-unit);
          }
          .imageFooter {
            display: relative;
          }
          .imageFooter2 {
            // display: flex;
            background-repeat: no-repeat;
            background-attachment: fixed;
            // background-position: right bottom;
            width: 300px;
            // position: absolute;
            // right: 500px;
            // bottom: 100px;
            position: absolute;
            bottom: 300px;
            right: 600px;
            z-index: 100;
            // object-fit: cover;
            display: block;
          }
          @media (max-width: 991px) {
            .hero {
              height: auto;
              flex-direction: column;
            }
            .container02 {
              align-items: center;
              margin-bottom: var(--dl-space-space-doubleunit);
            }
            .text01 {
              text-align: center;
            }
            .text05 {
              text-align: center;
            }
            .text06 {
              text-align: center;
            }
            .container05 {
              flex-direction: column;
            }
            .container07 {
              align-self: center;
              margin-bottom: var(--dl-space-space-doubleunit);
            }
            .container08 {
              align-items: center;
              margin-left: 0px;
            }
            .use-case1 {
              flex-direction: column;
            }
            .container17 {
              margin-left: 0px;
              margin-right: 0px;
            }
          }
          @media (max-width: 767px) {
            .container20 {
              display: flex;
              flex-direction: column;
              align-items: center;
              border-radius: 0;
            }
            .container21 {
              align-items: center;
            }

            .container22 {
              align-items: center;
            }
            .c-t-a {
              width: 100%;
            }
            .menu {
              display: none;
            }
            .burger-menu {
              display: block;
            }
            .text01 {
              font-size: 40px;
              text-align: center;
            }
            .text05 {
              font-size: 40px;
              text-align: center;
            }
            .text06 {
              font-size: 14px;
              text-align: center;
            }
            .image04 {
              width: 60%;
            }
            .container06 {
              align-items: center;
            }
            .image05 {
              top: -2px;
              left: 21px;
              right: auto;
              width: 50px;
              bottom: auto;
            }
            .text09 {
              font-size: 40px;
              text-align: center;
            }
            .text10 {
              font-size: 40px;
              text-align: center;
            }
            .text11 {
              font-size: 40px;
            }
            .text12 {
              font-size: 40px;
            }
            .image07 {
              max-width: 300px;
            }
            .use-case1 {
              align-items: center;
            }
            .container17 {
              text-align: center;
              align-items: center;
            }
            .container19 {
              padding-top: 0;
            }
            .text23 {
              font-size: 40px;
            }
            .container24 {
              flex-direction: column;
            }
            .container25 {
              margin-bottom: var(--dl-space-space-doubleunit);
            }
            .container26 {
              margin-bottom: var(--dl-space-space-doubleunit);
            }
            .container27 {
              margin-bottom: var(--dl-space-space-doubleunit);
            }
            .container28 {
              margin-bottom: var(--dl-space-space-doubleunit);
            }
            .container29 {
              flex-direction: column;
            }
            .text31 {
              margin-top: var(--dl-space-space-unit);
              margin-bottom: var(--dl-space-space-unit);
            }
          }
          @media (max-width: 479px) {
            .text01 {
              font-size: 30px;
            }
            .text05 {
              font-size: 30px;
            }
            .text11 {
              text-align: center;
            }
            .text12 {
              text-align: center;
            }
            .image08 {
              display: none;
            }
            .use-case1 {
              align-items: center;
            }
            .container17 {
              text-align: center;
              align-items: center;
            }
            .container23 {
              flex-direction: column;
              margin-top: 0;
            }
          }
        `}
      </style>
    </>
  )
}
