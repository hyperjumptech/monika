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

import * as React from 'react'
import NextLink from 'next/link'
import { removeFromLast } from '../lib/docs/utils'
import { siteConfig } from 'siteConfig'
import { FiThumbsDown, FiThumbsUp } from 'react-icons/fi'
import Button from './Button'

function areEqual(prevProps, props) {
  return prevProps.route?.path === props.route?.path
}

export const DocsPageFooter = React.memo(({ route, prevRoute, nextRoute }) => {
  const editUrl =
    route?.editUrl || route?.path
      ? `${siteConfig.editUrl}${route?.editUrl || route?.path}`
      : null

  return (
    <>
      <div className="py-8">
        <div className="flex flex-col space-between items-center">
          <span className="h-px w-full bg-gradient-to-r from-purple-monika to-aqua-monika" />
          <div className="flex flex-col md:flex-row w-full py-8">
            {prevRoute && prevRoute.path ? (
              <NextLink href={removeFromLast(prevRoute.path, '.')}>
                <a className="flex flex-col block md:mr-auto md:ml-0 mx-auto">
                  <span className="md:mr-auto md:ml-0 mx-auto text-base block text-gray-500 mb-1 font-semibold">
                    ← Prev
                  </span>
                  <span className="text-xl block bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold">
                    {prevRoute.title}
                  </span>
                </a>
              </NextLink>
            ) : (
              <div />
            )}
            <div className="flex flex-col justify-center">
              <div className="font-semibold mx-auto text-center mb-4">
                Was this page helpful?
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-auto max-w-xs mx-auto">
                <Button
                  rounded={false}
                  className="w-21 h-11 inline-flex self-center font-semibold"
                >
                  <FiThumbsUp className="mt-1 mr-2" /> Yes
                </Button>
                <Button
                  outline={true}
                  rounded={false}
                  className="w-21 h-11 inline-flex self-center font-semibold"
                >
                  <FiThumbsDown className="mt-1 mr-2" /> No
                </Button>
              </div>
            </div>
            {nextRoute && nextRoute.path && (
              <NextLink href={removeFromLast(nextRoute.path, '.')}>
                <a className="flex flex-col text-right block mt-4 md:mt-0 md:ml-auto md:mr-0 mx-auto">
                  <span className="md:ml-auto md:mr-0 mx-auto text-base block text-gray-500 mb-1 font-semibold">
                    Next →
                  </span>
                  <span className="text-xl block bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold">
                    {nextRoute.title}
                  </span>
                </a>
              </NextLink>
            )}
          </div>
        </div>
      </div>

      {editUrl ? (
        <div className="mb-8">
          <a
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 underline"
          >
            Edit this page on GitHub
          </a>
        </div>
      ) : null}
    </>
  )
}, areEqual)
DocsPageFooter.displayName = 'DocsPageFooter'
