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
import WorldDotPng from '../../../public/world-dot.png'

export default function DemoVideo() {
  return (
    <div className="relative flex flex-col justify-center pt-64 md:pt-2/5 lg:pt-1/4 xl:pt-1/5">
      <img
        src={WorldDotPng}
        style={{ marginTop: '-50rem' }}
        className="absolute top-0 right-0 xl:block hidden"
      />
      <div className="m-auto flex flex-col z-10">
        <h3 className="m-auto text-white text-xl -mt-y-1/4">
          <span className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold">
            Monika
          </span>{' '}
          Quick Start
        </h3>
        <div className="flex flex-wrap justify-around gap-8 mt-8">
          <iframe
            className="my-auto md:w-96 md:h-72 w-56 h-32"
            src="https://www.youtube-nocookie.com/embed/o4jrNeNeFmM"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={true}
          />
          <div className="mx-8 md:m-auto flex flex-col max-w-sm">
            <p className="text-white text-3xl lg:text-4xl leading-none lg:text-left text-center">
              Sleep well knowing that your{' '}
              <span className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold">
                server is working as it should be
              </span>
            </p>
            <p className="text-white mt-4 leading-tight lg:text-left text-center">
              Monitor every part of your web app using a simple JSON
              configuration file. Get alerts not only when your site is down,
              but also when it's slow.
            </p>
            <ButtonLink
              className="mt-6 w-40 lg:ml-0 mx-auto leading-snug font-semibold text-sm text-center"
              href="/quick-start"
              rel="noopener noreferrer"
            >
              Find Out More
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}
