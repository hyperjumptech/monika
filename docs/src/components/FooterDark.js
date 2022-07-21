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

import MonikaSvg from '../../public/monika.svg'
import HyperjumpSvg from '../../public/hyperjump.svg'
import { siteConfig } from 'siteConfig'

export default function FooterDark(props) {
  return (
    <div
      className={`flex lg:flex-row flex-col justify-around text-white pt-8 pb-16 px-16 ${
        props.className ? props.className : ''
      }`}
    >
      <a href="/">
        <img className="w-16 h-4 mt-1" src={MonikaSvg} />
      </a>
      <div className="flex flex-col mt-4 lg:mt-0">
        <p className="font-bold">Resources</p>
        <a className="text-xs pt-2" href="/overview" rel="noopener noreferrer">
          Documentation
        </a>
        <a
          className="text-xs pt-1"
          href="https://medium.com/hyperjump-tech"
          rel="noopener noreferrer"
        >
          Hyperjump's Medium
        </a>
        <a className="text-xs pt-1" href="/articles" rel="noopener noreferrer">
          How-to
        </a>
        <a
          className="text-xs pt-1"
          href="/guides/examples"
          rel="noopener noreferrer"
        >
          Examples
        </a>
        <a
          className="text-xs pt-1"
          target="_blank"
          href="https://monika-config.hyperjump.tech/"
          rel="noopener noreferrer"
        >
          Config Generator
        </a>
        <a
          className="text-xs pt-1"
          href="https://whatsapp.hyperjump.tech/"
          rel="noopener noreferrer"
        >
          WhatsApp Notifier
        </a>
      </div>
      <div className="flex flex-col mt-4 lg:mt-0">
        <p className="font-bold">Community</p>
        <a
          className="text-xs pt-2"
          href={siteConfig.repoUrl + '/discussions'}
          target="_blank"
          rel="noopener noreferrer"
        >
          Discussion
        </a>
        <a
          className="text-xs pt-1"
          href={siteConfig.repoUrl + '/releases'}
          target="_blank"
          rel="noopener noreferrer"
        >
          Releases
        </a>
        <a
          className="text-xs pt-1"
          href={siteConfig.npmUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          NPM Homepage
        </a>
      </div>
      <div className="flex flex-col max-w-sm mt-8 lg:mt-0">
        <a
          className="font-bold"
          href="https://hyperjump.tech/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={HyperjumpSvg} />
        </a>
        <p className="text-xs pt-2">
          PT Artha Rajamas Mandiri (Hyperjump) is an open-source-first company
          providing engineering excellence service. We aim to build and
          commercialize open-source tools to help companies streamline,
          simplify, and secure the most important aspects of its modern DevOps
          practices.
        </p>
        <p className="text-xs mr-auto pt-2">{siteConfig.copyright}</p>
      </div>
    </div>
  )
}
