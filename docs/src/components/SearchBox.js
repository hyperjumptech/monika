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

import React, { createElement, Fragment, useEffect, useRef } from 'react'
import { render } from 'react-dom'
import { siteConfig } from 'siteConfig'
import algoliasearch from 'algoliasearch/lite'
import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js'
import '@algolia/autocomplete-theme-classic/dist/theme.css'

const options = {
  appId: siteConfig.algolia.appId,
  apiKey: siteConfig.algolia.apiKey,
  indexName: siteConfig.algolia.indexName,
}

const searchClient = algoliasearch(options.appId, options.apiKey)

function getQueryPattern(query, flags = 'i') {
  const pattern = new RegExp(
    `(${query
      .trim()
      .toLowerCase()
      .split(' ')
      .map((token) => `^${token}`)
      .join('|')})`,
    flags
  )
  return pattern
}

export const SearchBox = (props) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const search = autocomplete({
      container: containerRef.current,
      renderer: { createElement, Fragment },
      render({ children }, root) {
        render(children, root)
      },
      getSources: ({ query }) => [
        {
          sourceId: 'actions',
          templates: {
            item({ item }) {
              return (
                <p>
                  {item.label} {item.placeholder}
                </p>
              )
            },
          },
          getItems() {
            const pattern = getQueryPattern(query)
            return [pattern].filter(({ label }) => pattern.test(label))
          },
          onSelect(params) {
            const { item, setQuery } = params

            item.onSelect(params)
            setQuery('')
          },
        },
        {
          sourceId: options.indexName,
          templates: {
            item({ item, components }) {
              return (
                // <a href={item.url}>
                <divc className="py-px">
                  <div className="font-bold text-sm m-1">{item.title}</div>
                  <div className="text-sm m-1 justify-center items-cente">
                    <components.Highlight hit={item} attribute="title" />
                    <components.Snippet hit={item} attribute="content" />
                  </div>
                </divc>
                // </a>
              )
            },
            noResults() {
              return 'No results.'
            },
          },
          getItemUrl({ item }) {
            return item.url
          },
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: options.indexName,
                  query,
                  params: {
                    attributesToSnippet: ['title:25', 'content:25'],
                    snippetEllipsisText: '…',
                  },
                },
              ],
            })
          },
        },
      ],
      ...props,
    })

    return () => {
      search.destroy()
    }
  }, [props])

  return <div ref={containerRef} />
}
