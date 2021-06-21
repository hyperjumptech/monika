import ButtonLink from 'components/ButtonLink'
import { useEffect, useState } from 'react'
import { siteConfig } from 'siteConfig'

export default function StarButton(props) {
  const [starCount, setStarCount] = useState(0)
  useEffect(() => {
    fetch('https://api.github.com/repos/hyperjumptech/monika')
      .then((res) => res.json())
      .then(
        (result) => {
          setStarCount(result.stargazers_count)
        },
        () => {
          // do nothing
        }
      )
  })
  return (
    <ButtonLink
      outline="true"
      className={`w-40 flex justify-center leading-snug font-semibold text-center max-h-10 ${
        props.className ? props.className : ''
      }`}
      href={siteConfig.repoUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>{' '}
      Star ({starCount})
    </ButtonLink>
  )
}
