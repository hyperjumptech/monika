import React from 'react'
import Head from 'next/head'
import { withRouter } from 'next/router'

const ogImage = require('images/monika-og.png?url')

export const Seo = withRouter(
  ({ title, description, image = ogImage, router, children }) => {
    const socMedURL = `https://hyperjumptech.github.io${image}`
    return (
      <Head>
        {/* DEFAULT */}

        {title != undefined && (
          <title key="title">{title} | Monika | Hyperjump Technology</title>
        )}
        {description != undefined && (
          <meta name="description" key="description" content={description} />
        )}

        {/* OPEN GRAPH */}
        <meta property="og:type" key="og:type" content="website" />
        <meta
          property="og:url"
          key="og:url"
          content={`https://hyperjumptech.github.io${router.basePath}${router.pathname}`}
        />
        {title != undefined && (
          <meta property="og:title" content={title} key="og:title" />
        )}
        {description != undefined && (
          <meta
            property="og:description"
            key="og:description"
            content={description}
          />
        )}
        {image != undefined && (
          <meta property="og:image" key="og:image" content={socMedURL} />
        )}

        {/* TWITTER */}
        <meta
          name="twitter:card"
          key="twitter:card"
          content="summary_large_image"
        />
        <meta
          name="twitter:site"
          key="twitter:site"
          content="@hyperjump_tech"
        />
        <meta
          name="twitter:creator"
          key="twitter:creator"
          content="@hyperjump_tech"
        />
        {title != undefined && (
          <meta name="twitter:title" key="twitter:title" content={title} />
        )}
        {description != undefined && (
          <meta
            name="twitter:description"
            key="twitter:description"
            content={description}
          />
        )}
        {image != undefined && (
          <meta name="twitter:image" key="twitter:image" content={socMedURL} />
        )}

        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href={`${router.basePath}/apple-icon-57x57.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href={`${router.basePath}/apple-icon-60x60.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href={`${router.basePath}/apple-icon-72x72.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href={`${router.basePath}/apple-icon-76x76.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href={`${router.basePath}/apple-icon-114x114.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href={`${router.basePath}/apple-icon-120x120.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href={`${router.basePath}/apple-icon-144x144.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href={`${router.basePath}/apple-icon-152x152.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${router.basePath}/apple-icon-180x180.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href={`${router.basePath}/android-chrome-192x192.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${router.basePath}/favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href={`${router.basePath}/favicon-96x96.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${router.basePath}/favicon-16x16.png`}
        />
        <link rel="manifest" href={`${router.basePath}/manifest.json`} />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-TileImage"
          content={`${router.basePath}/ms-icon-144x144.png`}
        />
        <meta name="theme-color" content="#ffffff" />

        {children}
      </Head>
    )
  }
)
