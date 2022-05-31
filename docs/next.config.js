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

const path = require('path')
const dotenvLoad = require('dotenv-load')
const optimizedImages = require('next-optimized-images')

dotenvLoad()

const remarkPlugins = [
  require('remark-slug'),
  require('./src/lib/docs/remark-paragraph-alerts'),
  [
    require('remark-autolink-headings'),
    {
      behavior: 'append',
      linkProperties: {
        class: ['anchor'],
        title: 'Direct link to heading',
      },
    },
  ],

  require('remark-emoji'),
  require('remark-footnotes'),
  require('remark-images'),
  [
    require('remark-github'),
    { repository: 'https://github.com/hyperjumptech/monika' },
  ],
  require('remark-unwrap-images'),
  [
    require('remark-toc'),
    {
      skip: 'Reference',
      maxDepth: 6,
    },
  ],
]

module.exports = optimizedImages({
  pageExtensions: ['jsx', 'js', 'mdx', 'md'],
  basePath: '',
  assetPrefix: '',
  env: {
    NEXT_PUBLIC_GA_TRACKING_ID: process.env.GA_TRACKING_ID || '',
    SENTRY_RELEASE: process.env.VERCEL_GITHUB_COMMIT_SHA || '',
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/docs/:any*',
        destination: '/:any*', // Matched parameters can be used in the destination
        permanent: true,
      },
    ]
  },
  experimental: {
    plugins: true,
    modern: true,
  },
  webpack: (config, { dev, isServer, ...options }) => {
    config.module.rules.push({
      test: /.mdx?$/, // load both .md and .mdx files
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            remarkPlugins,
          },
        },
        path.join(__dirname, './src/lib/docs/md-loader'),
      ],
    })

    if (isServer) {
      require('./scripts/sitemap-generator')
    }

    // only compile build-rss in production server build
    if (dev || !isServer) {
      return config
    }

    // we're in build mode so enable shared caching for Notion data
    process.env.USE_CACHE = 'true'

    const originalEntry = config.entry
    config.entry = async () => {
      const entries = {
        ...(await originalEntry()),
      }
      // entries['./scripts/build-rss.js'] = './src/lib/build-rss.js'
      return entries
    }

    return config
  },
  optimizeImages: {
    /* config for next-optimized-images */
    mozjpeg: {
      quality: 70,
    },
    optipng: {
      optimizationLevel: 3,
    },
    optimizeImagesInDev: true,
  },
})
