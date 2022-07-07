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
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock'
import cn from 'classnames'
import { Container } from './Container'
import { FiChevronRight as ArrowRightSidebar } from 'react-icons/fi'
import { useRouter } from 'next/router'
import { SearchBox } from './SearchBox'

export function SidebarMobile({ children }) {
  const [opened, setOpen] = React.useState(false)
  const menuRef = React.useRef(null)
  const searchRef = React.useRef(null)
  const router = useRouter()

  const openMenu = () => {
    if (menuRef.current != null) {
      disableBodyScroll(menuRef.current)
      setOpen(true)
    }
  }

  const closeMenu = () => {
    if (menuRef.current != null) {
      enableBodyScroll(menuRef.current)
      setOpen(false)
    }
  }

  const toggleOpen = () => {
    if (opened) {
      closeMenu()
    } else {
      openMenu()
    }
  }

  const onRouteChange = () => {
    closeMenu()
  }

  React.useEffect(() => {
    onRouteChange()
    return () => {
      clearAllBodyScrollLocks()
    }
  }, [router.asPath])
  return (
    <div className="lg:hidden">
      <Container>
        <div className="sidebar-search py-2 z-10">
          <SearchBox />
        </div>
        <label
          htmlFor="dropdown-input"
          className={cn('w-full', {
            opened,
          })}
        >
          <input
            id="dropdown-input"
            className="hidden"
            type="checkbox"
            checked={opened}
            onChange={toggleOpen}
          />
          <div className="docs-select flex w-full items-center">
            <ArrowRightSidebar className="text-gray-600 -ml-1" />
            Menu
          </div>
        </label>
        <div className="docs-dropdown shadow-xl" ref={menuRef}>
          <Container>
            <nav>{children}</nav>
          </Container>
        </div>
        <style jsx>{`
          .docs-select {
            display: flex;
            height: 2.5rem;
            width: 100%;
            line-height: 3rem;
            align-items: center;
            text-align: left;
            cursor: pointer;
          }
          .docs-dropdown {
            position: absolute;
            left: 0;
            right: 0;
            top: 100%;
            bottom: 100%;
            background: white;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .docs-dropdown nav {
            padding: 10px 0;
          }
          .opened ~ .docs-dropdown {
            min-height: 80px;
            bottom: calc(153px - 90vh);
            border-top: 1px solid #eaeaea;
          }
          .docs-select :global(svg) {
            margin-left: 1px;
            margin-right: 14px;
            transition: transform 0.15s ease;
          }
          .opened > .docs-select :global(svg) {
            transform: rotate(90deg);
          }

          @media screen and (max-width: 640px) {
            .opened ~ .docs-dropdown {
              bottom: calc(203px - 90vh);
            }
          }
        `}</style>
      </Container>
    </div>
  )
}
