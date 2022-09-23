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

import Link from 'next/link'
import { siteConfig } from 'siteConfig'
import MonikaSvg from '../../public/monika.svg'
import { useState } from 'react'
import { Search } from './Search'

export default function NavBar() {
  const [navbarOpen, setNavbarOpen] = useState(false)
  return (
    <nav className="relative flex flex-wrap items-center bg-black-monika justify-between px-2 py-1">
      <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          <div className="w-60 flex items-center h-16 pt-4 md:pt-0">
            <Link href="/" as="/">
              <a>
                <span className="sr-only">Home</span>
                <img className="w-24 h-6" src={MonikaSvg} />
              </a>
            </Link>
          </div>
          <button
            className="cursor-pointer text-white fill-current text-xl leading-none px-3 py-1 block lg:hidden outline-none focus:outline-none"
            type="button"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
        <div className="flex-grow hidden lg:block ml-8">
          <Search />
        </div>
        <div
          className={
            'lg:flex flex-grow items-center' +
            (navbarOpen ? ' flex' : ' hidden')
          }
        >
          <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
            <li className="nav-item">
              <a
                className="px-3 py-2 flex items-center text-white font-sans font-bold leading-snug hover:opacity-75"
                href="/overview"
              >
                <span className="ml-2">Docs</span>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="px-3 py-2 flex items-center text-white font-sans font-bold leading-snug hover:opacity-75"
                href="https://monika-config.hyperjump.tech/"
              >
                <span className="ml-2">Config Generator</span>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="px-3 py-2 flex items-center text-white font-sans font-bold leading-snug hover:opacity-75"
                href="https://whatsapp.hyperjump.tech/"
              >
                <span className="ml-2">WhatsApp Notifier</span>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="px-3 py-2 flex items-center text-white font-sans font-bold leading-snug hover:opacity-75"
                href="https://github.com/hyperjumptech/monika/discussions"
                target="_blank"
              >
                <span className="ml-2">Discuss</span>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="px-3 py-2 flex items-center text-white font-sans font-bold leading-snug hover:opacity-75"
                href="https://hyperjump.tech/"
                target="_blank"
              >
                <span className="ml-2">Hyperjump</span>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="ml-4 flex items-center leading-snug hover:opacity-75 px-4 py-1.5 bg-gradient-to-r from-purple-monika to-aqua-monika rounded-full font-sans text-white"
                href={siteConfig.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="h-6 w-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>{' '}
                Github
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
