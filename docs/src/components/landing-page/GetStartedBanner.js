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

import { siteConfig } from 'siteConfig'
import WaveMonika from '../../../public/wave-monika.svg'

export default function GetStartedBanner() {
  return (
    <div className="relative bg-black-monika h-screen flex">
      <div className="flex flex-col z-10 m-auto bg-gradient-to-br from-purple-monika to-aqua-monika px-16 py-8 rounded">
        <p className="text-center text-2xl text-white font-bold">
          Get Started with Monika Now!
        </p>
        <p className="text-center text-white">
          Detect problem as soon as possible, before your user do, and fix them
          <br />
          before they realize. No hidden fees or anything, free forever!
        </p>
        <a
          className="m-auto mt-4 px-4 py-2 bg-white rounded-full font-sans text-white"
          href={siteConfig.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="bg-gradient-to-r from-purple-monika to-aqua-monika text-transparent bg-clip-text font-bold">
            Check on Github!
          </span>
        </a>
      </div>
      <img src={WaveMonika} className="absolute inset-x-0 bottom-0 w-screen" />
    </div>
  )
}
