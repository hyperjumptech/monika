import * as React from 'react'
import { ParentSize } from '@visx/responsive'
import Head from 'next/head'
import Link from 'next/link'

import { siteConfig } from '../siteConfig'

import { Banner } from '../components/Banner'
import { Sticky } from '../components/Sticky'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { Seo } from '../components/Seo'

const Home = ({ sponsors }) => {
  return (
    <>
      <Seo
        title="Monika"
        description="Free and Open Source Synthetic Monitoring Tool"
      />
      <Head>
        <title>Monika - Free and Open Source Synthetic Monitoring Tool</title>
      </Head>
      <div className="bg-gray-50 h-full min-h-full">
        <Banner />
        <Sticky>
          <Nav />
        </Sticky>
        <div className="relative bg-white overflow-hidden">
          <div className="py-24 mx-auto container px-4 sm:mt-12  relative">
            <img
              src={require('images/emblem-light.svg')}
              className="absolute transform right-0 top-1/2 h-0 lg:h-full scale-150 translate-x-1/2 xl:translate-x-1/5 -translate-y-1/2"
              alt="Monika Emblem"
            />
            <div className="grid grid-cols-12 lg:gap-8">
              <div className="col-span-12 lg:col-span-6 ">
                <div className="text-center lg:text-left md:max-w-2xl md:mx-auto ">
                  <h1 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 sm:leading-none sm:text-6xl lg:text-5xl xl:text-6xl">
                    Free and Open Source
                    <br className="hidden md:inline xl:hidden" />{' '}
                    <span>Synthetic Monitoring Tool</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Monitor every part of your web app using a simple JSON
                    configuration file. Get alert not only when your site is
                    down but also when it's slow.
                  </p>

                  <div className="mt-5  mx-auto sm:flex sm:justify-center lg:justify-start lg:mx-0 md:mt-8">
                    <div className="rounded-md shadow">
                      <Link href="/overview">
                        <a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-coral hover:bg-coral-light focus:outline-none focus:border-coral focus:shadow-outline-coral transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10">
                          Get Started
                        </a>
                      </Link>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                      <a
                        href={siteConfig.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-coral bg-white hover:text-coral-light focus:outline-none focus:border-coral-light focus:shadow-outline-coral transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
                      >
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-lg border-t border-gray-200 bg-gray-50 ">
          <div className="py-24  ">
            <div className="mx-auto container">
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div>
                  <div>
                    <h3 className="text-xl leading-6 xl:text-2xl font-bold text-gray-900">
                      Multiple Paths or URLs
                    </h3>
                    <p className="mt-2 lg:mt-4 text-base xl:text-lg lg:leading-normal leading-6 text-gray-600">
                      Don't just check if your domain is up. With monika, you
                      can monitor every paths of your web app.
                    </p>
                  </div>
                </div>
                <div className="mt-10 lg:mt-0">
                  <div>
                    <h3 className="text-xl leading-6 xl:text-2xl font-bold text-gray-900">
                      Status Code & Response Time
                    </h3>
                    <p className="mt-2  lg:mt-4 text-base xl:text-lg lg:leading-normal leading-6 text-gray-600">
                      Using monika, you can be alerted not only when your web
                      app is down, but also when it takes too long to respond.
                    </p>
                  </div>
                </div>
                <div className="mt-10 lg:mt-0">
                  <div>
                    <h3 className="text-xl leading-6 xl:text-2xl font-bold text-gray-900">
                      Various Notifications
                    </h3>
                    <p className="mt-2  lg:mt-4 text-base xl:text-lg lg:leading-normal leading-6 text-gray-600">
                      Get notified of the incidents through your favourite tools
                      including by e-mail via SMTP, mailgun, and sendgrid, or
                      through web hook. More notification channels are coming
                      including Slack and Microsoft Teams!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="bg-gray-900 text-white">
          <div className="py-32">
            <div className="mx-auto container text-center">
              <div className="text-xl">COMING SOON</div>
              <div className="text-3xl md:text-5xl font-bold">Symon</div>
              <div className="text-xl italic">
                The Cloud Synthetic Monitoring
              </div>
              <a
                href="https://learn.tanstack.com"
                className="inline-block mt-8 rounded shadow-lg bg-coral text-white font-bold text-xl px-4 py-3"
              >
                Sign up to be notified
              </a>
              <div className="grid pt-8 text-white max-w-screen-lg mx-auto text-lg">
                <span className="mb-2">
                  <span className="bg-coral text-gray-800 w-4 h-4 mr-2 rounded-full inline-flex items-center justify-center">
                    <Check />
                  </span>
                  User-friendly Dashboard
                </span>
                <span className="mb-2">
                  <span className="bg-coral text-gray-800 w-4 h-4 mr-2 rounded-full inline-flex items-center justify-center">
                    <Check />
                  </span>
                  Multi projects and Teams
                </span>
                <span className="mb-2">
                  <span className="bg-coral text-gray-800 w-4 h-4 mr-2 rounded-full inline-flex items-center justify-center">
                    <Check />
                  </span>
                  Monitor from many corners of Indonesia
                </span>
              </div>
            </div>
          </div>
        </div> */}

        <div className="bg-gray-100 relative py-24 border-t border-gray-200 ">
          <div className="px-4 sm:px-6 lg:px-8  mx-auto container max-w-3xl sm:text-center">
            <h3 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 lg:leading-none mt-2">
              Know when your web app is down <em>before</em> <br />
              your users do
            </h3>
            <p className="my-8 text-xl leading-7  text-gray-600">
              React faster when your web app is having problem before your users
              notice! Let's get started in seconds.
            </p>
            <div className="my-8">
              <code
                className="p-4 border-gray-400 border-2 rounded"
                title="Copy Command to Clipboard"
              >
                <span>npm i -g @hyperjumptech/monika</span>
              </code>
            </div>
            <p className="my-8 text-xl leading-7  text-gray-600">
              Now you can start monitoring your server! 🎉 Follow our{' '}
              <Link href="/quick-start">
                <a className=" text-coral underline">Quick Start</a>
              </Link>{' '}
              guide.
            </p>
          </div>
        </div>

        {/* <section className="bg-gray-900 body-font">
          <div className="py-24 px-4 sm:px-6 lg:px-8  mx-auto container">
            <div className=" sm:text-center pb-16">
              <h3 className="text-3xl mx-auto leading-tight font-extrabold tracking-tight text-white sm:text-4xl  lg:leading-none mt-2">
                One Dep, All the Features.
              </h3>
              <p className="mt-4 text-xl max-w-3xl mx-auto leading-7 text-gray-300">
                With React as the only dependency, HTTPProbe is extremely lean,
                but also strategically packed to the brim with features you're
                bound to need in almost any project. From weekend hobbies all
                the way up to enterprise e-commerce systems (lookin' at you
                Walmart!), HTTPProbe is jam packed with battle-hardened tools to
                help you succeed.
              </p>
            </div>
            <div>
              <div className="grid grid-flow-row grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4 text-white max-w-screen-lg mx-auto text-lg">
                {[
                  "Backend agnostic",
                  "Dedicated Devtools",
                  "Auto Caching",
                  "Auto Refetching",
                  "Window Focus Refetching",
                  "Polling/Realtime Queries",
                  "Parallel Queries",
                  "Dependent Queries",
                  "Mutations API",
                  "Automatic Garbage Collection",
                  "Paginated/Cursor Queries",
                  "Load-More/Infinite Scroll Queries",
                  "Scroll Recovery",
                  "Request Cancellation",
                  "Suspense Ready!",
                  "Render-as-you-fetch",
                  "Prefetching",
                  "Variable-length Parallel Queries",
                  "Offline Support",
                  "SSR Support",
                  "Data Selectors",
                ].map((feature) => (
                  <span className="mb-2" key={feature}>
                    <span className="bg-coral text-gray-800 w-4 h-4 mr-2 rounded-full inline-flex items-center justify-center">
                      <Check />
                    </span>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section> */}
        <div className="bg-gray-200 border-b border-gray-300">
          <div className="container mx-auto py-12 text-center">
            <h3 className="text-2xl md:text-5xl mx-auto leading-tight font-extrabold tracking-tight text-gray-800  lg:leading-none mt-2">
              Have feature ideas? Found bugs?
            </h3>
            <a
              href="https://github.com/hyperjumptech/monika/discussions"
              target="_blank"
              className="inline-block bg-gray-800 p-5 text-2xl mx-auto leading-tight font-extrabold tracking-tight text-white mt-12 rounded-full"
            >
              Join the Github Discussion!
            </a>
          </div>
        </div>
        <Footer />
        <style jsx global>{`
          .gradient {
            -webkit-mask-image: linear-gradient(
              180deg,
              transparent 0,
              #000 30px,
              #000 calc(100% - 200px),
              transparent calc(100% - 100px)
            );
          }
        `}</style>
      </div>
    </>
  )
}

export default Home
Home.displayName = 'Home'
const Check = React.memo(() => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="3"
    className="w-3 h-3"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5"></path>
  </svg>
))
