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
import Button from 'components/Button'

export default function NavBar() {
  const [navbarOpen, setNavbarOpen] = React.useState(false)
  return (
    <nav className="relative flex flex-wrap items-center bg-black-monika justify-between px-2 py-3 mb-3">
      <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          <div className="w-60 flex items-center h-16 pt-4 md:pt-0">
            <Link href="/" as="/">
              <a>
                <span className="sr-only">Home</span>
                <svg
                  width="105"
                  height="22"
                  viewBox="0 0 105 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M66.2938 5.37725C67.7787 5.37725 68.9824 4.17351 68.9824 2.68863C68.9824 1.20374 67.7787 0 66.2938 0C64.8089 0 63.6052 1.20374 63.6052 2.68863C63.6052 4.17351 64.8089 5.37725 66.2938 5.37725ZM22.1543 0.0301014H17.9754L11.1232 10.4466H11.031L4.17889 0.0301014H0V21.5084H4.42471V7.37389H4.51689L9.64833 15.0864H12.5059L17.6374 7.37389H17.7296V21.5084H22.1543V0.0301014ZM41.1115 16.8993C41.5212 15.9365 41.726 14.943 41.726 13.9188C41.726 12.7921 41.5007 11.7371 41.05 10.7539C40.6199 9.77061 40.0156 8.91025 39.2371 8.1728C38.4792 7.43535 37.5881 6.86177 36.5639 6.45208C35.5396 6.0219 34.4437 5.80681 33.2761 5.80681C32.1084 5.80681 31.0023 6.0219 29.9575 6.45208C28.9333 6.86177 28.032 7.43535 27.2535 8.1728C26.4956 8.91025 25.8913 9.77061 25.4406 10.7539C25.0105 11.7371 24.7954 12.7921 24.7954 13.9188C24.7954 15.025 25.0105 16.0697 25.4406 17.0529C25.8913 18.0362 26.4956 18.8966 27.2535 19.634C28.032 20.3715 28.9333 20.9553 29.9575 21.3855C31.0023 21.7952 32.1084 22 33.2761 22C34.5256 22 35.6728 21.7747 36.7175 21.324C37.7622 20.8529 38.6533 20.2383 39.3908 19.4804C40.1282 18.7225 40.7018 17.8621 41.1115 16.8993ZM31.5246 10.0472C32.0367 9.82182 32.6205 9.70915 33.2761 9.70915C33.9521 9.70915 34.5461 9.82182 35.0582 10.0472C35.5704 10.2725 35.9903 10.5798 36.3181 10.969C36.6458 11.3582 36.8916 11.7986 37.0555 12.2902C37.2194 12.7819 37.3013 13.294 37.3013 13.8266C37.3013 15.0966 36.9326 16.1209 36.1951 16.8993C35.4577 17.6777 34.4847 18.0669 33.2761 18.0669C31.965 18.0669 30.9613 17.6777 30.2648 16.8993C29.5683 16.1209 29.2201 15.0966 29.2201 13.8266C29.2201 13.294 29.3123 12.7819 29.4966 12.2902C29.681 11.7986 29.937 11.3582 30.2648 10.969C30.613 10.5798 31.033 10.2725 31.5246 10.0472ZM53.8438 5.80681C56.1996 5.80681 57.992 6.46232 59.2211 7.77334C60.4501 9.06388 61.0647 11.0816 61.0647 13.8266V21.5084H56.7014V14.1953C56.7014 12.7819 56.3942 11.6859 55.7796 10.9075C55.1651 10.1291 54.1818 9.73988 52.8298 9.73988C51.5802 9.73988 50.5662 10.1188 49.7878 10.8768C49.0094 11.6347 48.6202 12.7409 48.6202 14.1953V21.5084H44.1955V6.29844H47.9135L48.5895 8.26498H48.6509C49.0811 7.48656 49.7059 6.88226 50.5253 6.45208C51.3651 6.0219 52.4713 5.80681 53.8438 5.80681ZM64.1513 7.06662V21.5084H68.576V7.06662H64.1513ZM80.9653 12.1981L87.6331 21.5084H82.8089L78.077 14.9635L76.049 16.8993V21.5084H71.6243V0.0301014H76.049V12.1673L81.8871 6.29844H87.1722L80.9653 12.1981ZM87.7663 10.7231C87.4386 11.7064 87.2747 13.888 87.2747 13.888C87.2747 13.888 87.4283 16.0389 87.7356 17.0222C88.0429 18.0055 88.5038 18.8658 89.1183 19.6033C89.7329 20.3203 90.5011 20.8938 91.4229 21.324C92.3652 21.7337 93.4611 21.9386 94.7107 21.9386C95.8578 21.9386 96.8206 21.7542 97.599 21.3855C98.3979 21.0167 99.0637 20.392 99.5963 19.5111H99.6577L100.487 21.5084H104.175V6.26771H100.487L99.6577 8.23425H99.5963C99.1251 7.45583 98.4799 6.86177 97.6605 6.45208C96.8616 6.0219 95.8783 5.80681 94.7107 5.80681C93.5431 5.80681 92.4983 6.0219 91.5765 6.45208C90.6547 6.86177 89.8763 7.43535 89.2412 8.1728C88.6062 8.88976 88.1146 9.73988 87.7663 10.7231ZM91.9452 15.4859C91.7814 14.9737 91.6994 14.4411 91.6994 13.888C91.6994 13.3145 91.7814 12.7716 91.9452 12.2595C92.1296 11.7474 92.3857 11.307 92.7134 10.9382C93.0617 10.549 93.4816 10.252 93.9732 10.0472C94.4853 9.82182 95.0692 9.70915 95.7247 9.70915C96.3597 9.70915 96.923 9.82182 97.4147 10.0472C97.9268 10.2725 98.357 10.5798 98.7052 10.969C99.0535 11.3582 99.3197 11.8088 99.5041 12.321C99.6885 12.8126 99.7807 13.335 99.7807 13.888C99.7807 14.4411 99.6782 14.9737 99.4734 15.4859C99.289 15.9775 99.0227 16.4179 98.6745 16.8071C98.3262 17.1758 97.8961 17.4729 97.3839 17.6982C96.8923 17.9235 96.3392 18.0362 95.7247 18.0362C95.0487 18.0362 94.4546 17.9235 93.9425 17.6982C93.4304 17.4729 93.0104 17.1758 92.6827 16.8071C92.3549 16.4179 92.1091 15.9775 91.9452 15.4859Z"
                    fill="url(#paint0_linear)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="5.50016"
                      y1="22.0006"
                      x2="108.628"
                      y2="-9.62526"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#987CE8" />
                      <stop offset="1" stopColor="#2FDCDC" />
                    </linearGradient>
                  </defs>
                </svg>
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
                href="https://hyperjumptech.github.io/monika-config-generator"
              >
                <span className="ml-2">Config Generator</span>
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
              <Button className="ml-4 leading-snug hover:opacity-75">
                <a
                  className="flex items-center"
                  href={siteConfig.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="h-6 w-6"
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
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
