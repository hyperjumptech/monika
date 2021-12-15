import React from 'react'
import axios from 'axios'
import { useQuery } from 'react-query'
import { LayoutDocs } from '../components/LayoutDocs'

export default function ArticlesPage() {
  const { isLoading, isError, data } = useQuery('articles', fetcher)

  if (isLoading) {
    return (
      <LayoutDocs meta={{}}>
        <h1>Articles</h1>
        {Array(5)
          .fill()
          .map((_, i) => i)
          .map((_, i) => {
            return (
              <div key={i} className="flex flex-col mb-4">
                <div className="flex h-6 mb-1 w-full lg:w-96 bg-gray-300 animate-pulse" />
                <div className="flex h-6 w-48 bg-gray-300 animate-pulse" />
              </div>
            )
          })}
      </LayoutDocs>
    )
  }

  if (isError) {
    return (
      <LayoutDocs meta={{}}>
        <h1>Articles</h1>
        <p>An error occured while getting articles from Medium. </p>
      </LayoutDocs>
    )
  }

  return (
    <LayoutDocs meta={{}}>
      <h1>Articles</h1>
      {data.map(({ title, pubDate, link }) => {
        return (
          <div className="flex flex-col mb-4">
            <div className="flex">
              <a href={link} rel="noopener noreferrer" target="_blank">
                <h2>
                  <b>{title}</b>
                </h2>
              </a>
            </div>
            <div className="flex">
              <span>Published at {pubDate}</span>
            </div>
          </div>
        )
      })}
      <div className="flex items-center justify-end">
        <a
          href="https://medium.com/hyperjump-tech"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-purple-monika hover:underline"
        >
          RSS Feed from Medium.com
        </a>
      </div>
    </LayoutDocs>
  )
}

const fetcher = async () => {
  const { data } = await axios.get('/api/medium')
  return data
}
