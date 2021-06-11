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

import ButtonLink from 'components/ButtonLink'
import { useEffect, useState } from 'react'
import StarBlurSvg from '../../../public/star-blur.svg'
import WorldDotSvg from '../../../public/world-dot.svg'
import { siteConfig } from 'siteConfig'

export default function Banner(props) {
  return (
    <div
      className={`h-screen flex flex-col bg-black-monika ${
        props.className ? props.className : ''
      }`}
    >
      <div className="z-10 mt-20 px-4 text-5xl font-bold text-center text-white">
        <h1>
          Know when your{' '}
          <span className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent">
            web app is down
          </span>
          <br />
          before your users do.
        </h1>
      </div>
      <div className="z-10 mt-4 px-4 font-normal text-center text-white">
        <p>
          React faster when your app is having problem before your users notice!
        </p>
        <p>Let's get started in seconds.</p>
      </div>
      <div className="z-10 m-auto mt-4">
        <p className="mt-4 px-16 py-4 bg-gray-monika bg-opacity-10 rounded-md">
          <span className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text font-normal text-center text-transparent">
            npm i -g @hyperjumptech/monika
          </span>
        </p>
        <div className="flex flex-row justify-between mt-4">
          <div className="flex">
            <ButtonLink
              className="w-40 leading-snug font-semibold text-center"
              href="/quick-start"
              rel="noopener noreferrer"
            >
              Get Started!
            </ButtonLink>
          </div>
          <div className="flex">
            <StarButton />
          </div>
        </div>
      </div>
      <img src={StarBlurSvg} className="absolute -top-16 right-0" />
      <img
        src={WorldDotSvg}
        className="sm:invisible xl:visible absolute top-0 -left-16 mt-y-3/4"
      />
    </div>
  )
}

function StarButton() {
  const [starCount, setStarCount] = useState(0)
  useEffect(() => {
    fetch('https://api.github.com/repos/hyperjumptech/monika')
      .then((res) => res.json())
      .then(
        (result) => {
          setStarCount(result.stargazers_count)
        },
        () => {
          // do nothing
        }
      )
  })
  return (
    <ButtonLink
      outline="true"
      className="w-40 flex justify-center leading-snug font-semibold text-center"
      href={siteConfig.repoUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>{' '}
      Star ({starCount})
    </ButtonLink>
  )
}
