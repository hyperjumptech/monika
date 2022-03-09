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

import { siteConfig } from '../siteConfig'
import { Seo } from '../components/Seo'
import ButtonLink from '../components/ButtonLink'
import GithubButton from '../components/homepage/github-button'
import PrimaryButton from '../components/homepage/primary-button'
import TestimonialsCard from '../components/homepage/testimonials-card'
import FeatureCard from '../components/homepage/feature-card'
import ArticleCard from '../components/homepage/article-card'
import { event } from 'lib/gtag'

export default function IndexPage() {
  const [isOpenMobileMenu, setOpenMobileMenu] = useState(false)

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
                <a className="link01">Documentation</a>
              </Link>
              <a
                href="https://monika-config.hyperjump.tech/"
                target="_blank"
                rel="noreferrer noopener"
                className="link02"
              >
                Config Generator
              </a>
              <a
                href="https://whatsapp.hyperjump.tech/"
                target="_blank"
                rel="noreferrer noopener"
                className="link03"
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
            <ButtonLink
              className="hidden ml-4 items-center leading-snug hover:opacity-75 md:flex"
              href={siteConfig.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="h-6 w-6 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>{' '}
              Github
            </ButtonLink>
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
            <div className="container01">
              <div className="container02">
                <h1 className="text01">
                  <span>Get WhatsApp</span>
                  <br></br>
                  <span>notification when your</span>
                </h1>
                <h1 className="text05">web app is down</h1>
                <span className="text06">
                  <span className="text07">
                    Or from any other communication channel. It&apos;s quick,
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </span>
                  <br></br>
                  <span className="text08">​easy, and completely free!</span>
                </span>
                <img
                  alt="image"
                  src="/playground_assets/socials-group-200h.png"
                  className="image04"
                />
                <Link href="/quick-start">
                  <a
                    className="link11"
                    style={{ display: 'block' }}
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
                      className="component02"
                    ></PrimaryButton>
                  </a>
                </Link>
                <div className="container03 space-x-4">
                  <a
                    href="https://github.com/hyperjumptech/monika"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <img
                      alt="GitHub stars"
                      src="https://img.shields.io/github/stars/hyperjumptech/monika?style=for-the-badge"
                    />
                  </a>
                  <img
                    alt="npm"
                    src="https://img.shields.io/npm/dt/@hyperjumptech/monika?style=for-the-badge"
                  />
                </div>
              </div>
            </div>
            <div className="container04">
              <iframe
                className="my-auto md:w-96 md:h-72 w-56 h-32 video"
                src="https://www.youtube.com/embed/po1XHcIbJVw"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={true}
              />
            </div>
          </div>
        </div>
        <div className="testimonials">
          <div className="container05">
            <div className="container">
              <h1 className="text09 headline2">What They Say</h1>
              <h1 className="text10 headline2">About Monika</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10">
                <TestimonialsCard
                  text="Thank you Monika by Hyperjump.  With Monika, we can improve our services SLA, get notified early when we have a server issue. Easy to install, have multi notification channels, can be setup from different server regions, and is easy to integrate on the dashboard make it all complete and help us to analyze the issue asap."
                  text1="Eric Sudadyo"
                  text2="DevOps Manager, Yummycorp"
                  image_src="/playground_assets/yummy-200h.png"
                />
                <TestimonialsCard
                  text="Before using Monika, we were unaware when our website is down until our users reported it. We don’t want it to happen again. Now with Monika, we are notified much faster so our team can react quicker to solve the issue. Thank you, Monika!"
                  text1="Marsya Nurmaranti"
                  text2="Executive Director, Indorelawan"
                  image_src="/playground_assets/indorelawan_logomerah%20panjang_png-200h.png"
                />
              </div>
            </div>
          </div>
        </div>
        <img
          alt="image"
          src="/playground_assets/ellipse-1500w.png"
          className="image06"
        />
        <div className="features">
          <h2 className="text11 headline2">4 Simple Steps to Start</h2>
          <h2 className="text12">Monika</h2>
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
                text="If you're using NPM or Yarn, you can simply run this command in your terminal:"
                title="2. Install "
                image_src="/playground_assets/downloading-400w.png"
                rootClassName="rootClassName2"
              ></FeatureCard>
              <div className="container12">
                <span className="text17">npm i -g @hyperjumptech/monika</span>
              </div>
            </div>
            <div className="container13">
              <FeatureCard
                text="You need monika.yml. Define how requests are set up (Probe), how it is triggered (Alerts), and how would you like to receive the notifications. Use our Config generator to get the monika.yml super easily!"
                text1="Monika config generator"
                title="3. Create configuration file"
                image_src="/playground_assets/configuration%20file-400w.png"
                link_text="https://monika-config.hyperjump.tech/"
                rootClassName="rootClassName1"
              ></FeatureCard>
              <a
                href="https://monika-config.hyperjump.tech/"
                target="_blank"
                rel="noreferrer noopener"
                className="link14"
              >
                Monika Config Generator
              </a>
            </div>
            <div className="container14">
              <FeatureCard
                text="Monika by default reads a yaml configuration file called monika.yml in the current working directory if it exists. Run this command in the Terminal from the directory that contains the monika.yml file:"
                title="4. Run Monika"
                image_src="/playground_assets/step%204-400w.png"
                rootClassName="rootClassName3"
              ></FeatureCard>
              <div className="container15">
                <span className="text18">monika</span>
              </div>
            </div>
            <img
              alt="image"
              src="/playground_assets/success%20%5B1%5D-500w.png"
              className="image07"
            />
          </div>
          <span className="text19">
            Congratulations! Your web app is being monitored and Monika will
            send you notification if something happens.
          </span>
        </div>
        <div className="use-case">
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
          <div className="container20">
            <div className="container21">
              <h2 className="text23 headline2">
                <span className="text24">Get Started with Monika Now!</span>
              </h2>
              <span className="text25 lead1">
                <span className="text26">
                  Monika is an open source synthetic monitoring command line
                  application. It is actively developed and completely free!
                </span>
              </span>
            </div>
            <div className="container22">
              <Link href="/quick-start">
                <a
                  className="link15 button"
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
                <Link href="/guides/examples">
                  <a className="link18">Example</a>
                </Link>
                <a
                  href="https://monika-config.hyperjump.tech/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link19"
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
            margin-right: var(--dl-space-space-doubleunit);
            text-decoration: none;
          }
          .link01:hover {
            color: var(--dl-color-turquoise-default);
          }
          .link02 {
            color: var(--dl-color-gray-white);
            transition: 0.3s;
            margin-right: var(--dl-space-space-doubleunit);
            text-decoration: none;
          }
          .link02:hover {
            color: var(--dl-color-turquoise-default);
          }
          .link03 {
            color: var(--dl-color-gray-white);
            transition: 0.3s;
            margin-right: var(--dl-space-space-doubleunit);
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
            width: 582px;
            font-size: 52px;
            text-align: left;
            font-family: Inter;
            font-weight: 800;
            text-transform: none;
            text-decoration: none;
          }
          .text05 {
            font-size: 52px;
            font-style: normal;
            font-weight: 800;
            margin-bottom: var(--dl-space-space-unit);
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .text06 {
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
          }
          .container05 {
            display: flex;
            flex-wrap: wrap;
            max-width: 1100px;
            align-items: center;
            flex-direction: row;
            justify-content: center;
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
            padding: var(--dl-space-space-doubleunit);
            flex-wrap: wrap;
            margin-top: var(--dl-space-space-doubleunit);
            align-items: flex-start;
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
            align-items: flex-start;
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
            width: 100%;
            display: flex;
            overflow: hidden;
            align-items: center;
            flex-direction: column;
            justify-content: center;
          }
          .container20 {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            z-index: 100;
            max-width: 1110px;
            background: linear-gradient(310deg, #2fdcdc, #987ce8);
            align-items: center;
            padding-top: var(--dl-space-space-doubleunit);
            padding-left: var(--dl-space-space-doubleunit);
            padding-right: var(--dl-space-space-tripleunit);
            flex-direction: column;
            padding-bottom: var(--dl-space-space-doubleunit);
            justify-content: space-between;
          }
          .container21 {
            flex: 1;
            display: flex;
            padding: var(--dl-space-space-unit);
            align-items: center;
            flex-direction: column;
            justify-content: flex-start;
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
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            border-radius: var(--dl-radius-radius-radius6);
            flex-direction: column;
            justify-content: center;
            background-color: var(--dl-color-gray-white);
          }
          .link15 {
            font-size: 20px;
            font-style: normal;
            font-weight: 600;
            border-width: 0px;
            border-radius: var(--dl-radius-radius-radius6);
            text-decoration: none;
            background-image: linear-gradient(310deg, #2fdcdc, #987ce8);
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
            }
          }
        `}
      </style>
    </>
  )
}
