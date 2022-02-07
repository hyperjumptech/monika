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

import React, { useEffect } from 'react'
import '@docsearch/react/dist/style.css'
import '../styles/index.css'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { SearchProvider } from 'components/useSearch'
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent'
import { useRouter } from 'next/router'
import * as gtag from '../lib/gtag'
import '../styles/teleporthq.css'

function loadScript(src, attrs = {}) {
  if (typeof document !== 'undefined') {
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    Object.keys(attrs).forEach((attr) => script.setAttribute(attr, attrs[attr]))
    script.src = src
    document.body.appendChild(script)
  }
}

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient()
  React.useEffect(() => {
    loadScript('https://buttons.github.io/buttons.js')
  }, [])

  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (getCookieConsentValue() === 'true') {
        //isConsentAllowed
        gtag.pageview(url)
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
        @media (max-width: 390px) {
            .formkit-slide-in {
              display: none;
            }
          }
          @media (max-height: 740px) {
            .formkit-slide-in {
              display: none;
            }
          }
          `,
          }}
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SearchProvider>
          <CookieConsent enableDeclineButton>
            This website uses cookies to enhance the user experience.
          </CookieConsent>
          <Component {...pageProps} />
        </SearchProvider>
      </QueryClientProvider>
    </>
  )
}

export default MyApp
