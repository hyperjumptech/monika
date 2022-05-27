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
          getItems({}) {
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
                <a href={item.url}>
                  <divc className="py-px">
                    <div className="font-bold text-sm m-1">
                      {item.data.title}
                    </div>
                    <div className="text-sm m-1 justify-center items-cente">
                      <components.Highlight hit={item} attribute="data.title" />
                      <components.Snippet hit={item} attribute="content" />
                    </div>
                  </divc>
                </a>
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
                    attributesToSnippet: ['data.title:10', 'content:20'],
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
