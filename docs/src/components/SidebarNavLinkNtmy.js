import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
export function SidebarNavLink({
  route: { href, pathname, title, selected },
  onClick,
}) {
  const router = useRouter()
  const onlyHashChange = pathname === router.pathname

  return (
    <div
      className={cn(
        'nav-link pl-4',
        {
          selected,
        },
        selected
          ? 'border-2 py-2 border-purple-monika rounded-md'
          : 'text-black-monika text-opacity-50 font-semibold'
      )}
    >
      {
        // NOTE: use just anchor element for triggering `hashchange` event
        onlyHashChange ? (
          <a
            className={
              selected
                ? 'selected text-purple-monika hover:text-purple-700'
                : 'text-black-monika text-opacity-50 font-semibold'
            }
            href={`${router.basePath}${pathname}`}
          >
            {title}
          </a>
        ) : (
          <Link href={href} as={pathname}>
            <a className="text-black-monika text-opacity-50 font-semibold">
              {title}
            </a>
          </Link>
        )
      }
      <style jsx>{`
        div.selected {
          box-sizing: border-box;
        }
        .nav-link {
          display: flex;
          width: 100%;
        }
        .nav-link :global(a) {
          text-decoration: none;
          font-size: 1rem;
          line-height: 1.5rem;
          width: 100%;
          box-sizing: border-box;
        }
        .selected :global(a) {
          font-weight: 600;
        }
        span {
          color: #a0aec0;
        }
        @media screen and (max-width: 950px) {
          div {
            padding-left: 0.5rem;
          }
          .nav-link :global(a) {
            display: flex;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}
SidebarNavLink.displayName = 'SidebarNavLink'
