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

import axios from 'axios'
import React from 'react'
import { useQuery } from 'react-query'
import { LayoutDocs } from '../components/LayoutDocs'

export default function ArticlesPage() {
  const { data, isLoading, isError } = useQuery('articles', async () => {
    await axios({
      method: 'GET',
      url: 'https://medium.com/feed/hyperjump-tech',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/rss+xml',
      },
    })
  })

  if (isLoading) {
    return (
      <LayoutDocs meta={{}}>
        <h1>Articles</h1>
        <p>Fetching latest article, please wait...</p>
      </LayoutDocs>
    )
  }

  if (isError) {
    return (
      <LayoutDocs meta={{}}>
        <h1>Articles</h1>
        <p>Failed to fetch latest article. Please refresh this page.</p>
      </LayoutDocs>
    )
  }

  return (
    <LayoutDocs meta={{}}>
      <h1>Articles</h1>
      {data.map(({ title, pubDate, link }) => {
        return (
          <div key={title} className="flex flex-col mb-4">
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
      <div className="flex articles-center justify-end">
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
