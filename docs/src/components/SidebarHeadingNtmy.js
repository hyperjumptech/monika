import * as React from 'react'
export const SidebarHeading = ({ title, children }) => {
  return (
    <div className="heading">
      <h4 className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent mr-auto">
        {title}
      </h4>
      <div>{children}</div>
      <style jsx>{`
        h4 {
          margin: 1.25rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
SidebarHeading.displayName = 'SidebarHeading'
