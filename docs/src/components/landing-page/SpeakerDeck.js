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

import WorldDotPng from '../../../public/world-dot.png'

export default function SpeakerDeck() {
  return (
    <div className="relative flex flex-col justify-center pt-64 md:pt-2/5 lg:pt-1/4 xl:pt-1/5">
      <img
        src={WorldDotPng}
        style={{ marginTop: '-50rem' }}
        className="absolute top-0 right-0 xl:block hidden"
      />
      <div className="w-full flex flex-col z-10">
        <h3 className="m-auto text-white text-xl -mt-y-1/4">
          <span className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-semibold">
            Monika
          </span>{' '}
          Speaker Deck
        </h3>
        <div className=" w-full mt-8 px-4">
          <iframe
            src="https://speakerdeck.com/player/c88dc06544e141c787b98b2c1ec189b9"
            className="m-auto w-full h-48 md:w-3/6 md:h-96"
            allowFullScreen
            scrolling="no"
            allow="encrypted-media;"
          />
        </div>
      </div>
    </div>
  )
}
