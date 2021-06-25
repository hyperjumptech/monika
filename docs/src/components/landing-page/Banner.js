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
import StarBlurSvg from '../../../public/star-blur.svg'
import WorldDotPng from '../../../public/world-dot.png'
import StarButton from 'components/StarButton'

export default function Banner(props) {
  return (
    <div
      className={`relative flex flex-col py-32 ${
        props.className ? props.className : ''
      }`}
    >
      <div className="z-10 m-auto mb-0 px-4 max-w-4xl text-3xl lg:text-5xl font-bold text-center text-white">
        <h1>
          Know when your{' '}
          <span className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent">
            web app is down
          </span>{' '}
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
        <div className="flex flex-col sm:flex-row justify-between mt-4">
          <div className="flex">
            <ButtonLink
              className="w-40 mx-auto leading-snug font-semibold text-center"
              href="/quick-start"
              rel="noopener noreferrer"
            >
              Get Started!
            </ButtonLink>
          </div>
          <div className="flex sm:m-0 mx-auto sm:mt-0 mt-4">
            <StarButton />
          </div>
        </div>
      </div>
      <img src={StarBlurSvg} className="absolute -top-16 right-0" />
      <img
        src={WorldDotPng}
        className="xl:block hidden absolute -bottom-128 -left-16 max-w-2xl"
      />
    </div>
  )
}
