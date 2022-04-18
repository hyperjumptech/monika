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
import { MDXProvider } from '@mdx-js/react'
import NavBar from 'components/NavBar'
import { Sidebar } from 'components/Sidebar'
import { SidebarCategory } from 'components/SidebarCategory'
import { SidebarHeading } from './SidebarHeading'
import { SidebarMobile } from 'components/SidebarMobile'
import { SidebarPost } from 'components/SidebarPost'
import { Sticky } from 'components/Sticky'
import { useIsMobile } from 'components/useIsMobile'
import { findRouteByPath } from 'lib/docs/findRouteByPath'
import { removeFromLast } from 'lib/docs/utils'
import { getRouteContext } from 'lib/get-route-context'
import { useRouter } from 'next/router'
import s from './markdown.module.css'
import FooterDark from './FooterDark'
import { DocsPageFooter } from './DocsPageFooter'
import { Seo } from './Seo'
import MDXComponents from './MDXComponents'
import Head from 'next/head'
import { getManifest } from 'manifests/getManifest'
import StarButton from './StarButton'
import NavIndex from './NavIndex'

const getSlugAndTag = (path) => {
  const parts = path.split('/')

  if (parts[2] === '1.5.8' || parts[2] === '2.1.4') {
    return {
      tag: parts[2],
      slug: `/docs/${parts.slice(2).join('/')}`,
    }
  }

  return {
    slug: path,
  }
}

const addTagToSlug = (slug, tag) => {
  return tag ? `/docs/${tag}/${slug.replace('/docs/', '')}` : slug
}

export const LayoutDocs = (props) => {
  const router = useRouter()
  const { slug, tag } = getSlugAndTag(router.asPath)
  const { routes } = getManifest(tag)
  const _route = findRouteByPath(removeFromLast(slug, '#'), routes) // @ts-ignore
  const { route, prevRoute, nextRoute } = getRouteContext(_route, routes)
  const title = route && `${route.title}`
  const isMobile = useIsMobile()

  return (
    <>
      {tag && (
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
      )}
      <div>
        {isMobile ? (
          <>
            <NavBar />
            <Sticky shadow>
              <SidebarMobile>
                <SidebarRoutes isMobile={true} routes={routes} />
              </SidebarMobile>
            </Sticky>
          </>
        ) : (
          <Sticky>
            <NavBar />
          </Sticky>
        )}
        <Seo
          title={props.meta.title || title}
          description={props.meta.description}
        />
        <div className="block">
          <>
            <div className="container mx-auto pb-12 pt-6 content">
              <div className="flex relative">
                {!isMobile && (
                  <Sidebar fixed>
                    <SidebarRoutes routes={routes} />
                  </Sidebar>
                )}

                <div className={s['markdown'] + ' w-full docs pr-5'}>
                  <NavIndex props={props} forMedium="true" />
                  <div className="flex">
                    <h1 id="_top" className="mr-auto">
                      {props.meta.title}
                    </h1>{' '}
                    <StarButton />
                  </div>

                  <MDXProvider components={MDXComponents}>
                    {props.children}
                  </MDXProvider>

                  <DocsPageFooter
                    href={route?.path || ''}
                    route={route}
                    prevRoute={prevRoute}
                    nextRoute={nextRoute}
                  />
                </div>

                <NavIndex props={props} />
              </div>
            </div>
          </>
        </div>
      </div>
      <FooterDark className="bg-black-monika" />
      <style jsx>{`
        .docs {
          min-width: calc(100% - 300px - 1rem - 200px);
        }
      `}</style>
    </>
  )
}

function getCategoryPath(routes) {
  const route = routes.find((r) => r.path)
  return route && removeFromLast(route.path, '/')
}

function SidebarRoutes({ isMobile, routes: currentRoutes, level = 1 }) {
  const { asPath } = useRouter()
  let { slug, tag } = getSlugAndTag(asPath)
  return currentRoutes.map(({ path, title, routes, heading, open }, index) => {
    if (routes) {
      const pathname = getCategoryPath(routes)
      const selected = slug.startsWith(pathname)
      const opened = selected || isMobile ? false : open

      if (heading) {
        return (
          <SidebarHeading key={'parent' + index} title={title}>
            <SidebarRoutes
              isMobile={isMobile}
              routes={routes}
              level={level + 1}
            />
          </SidebarHeading>
        )
      }

      return (
        <SidebarCategory
          key={pathname}
          isMobile={isMobile}
          level={level}
          title={title}
          selected={selected}
          opened={opened}
        >
          <SidebarRoutes
            isMobile={isMobile}
            routes={routes}
            level={level + 1}
          />
        </SidebarCategory>
      )
    }

    const pagePath = removeFromLast(path, '.')
    const pathname = addTagToSlug(pagePath, tag)
    const selected = slug === pagePath
    const route = {
      href: pagePath,
      path,
      title,
      pathname,
      selected,
    }
    return (
      <SidebarPost
        key={title}
        isMobile={isMobile}
        level={level}
        route={route}
      />
    )
  })
}

LayoutDocs.displayName = 'LayoutDocs'
