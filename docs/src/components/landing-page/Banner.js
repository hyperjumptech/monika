import ButtonLink from 'components/ButtonLink'

export default function Banner() {
  return (
    <div className="flex flex-col bg-black-monika">
      <div className="mt-20 px-4 text-5xl font-bold text-center text-white">
        <p>Know when your web is down</p>
        <p>before your users do.</p>
      </div>
      <div className="mt-4 px-4 font-normal text-center text-white">
        <p>
          React faster when your app is having problem before your users notice!
        </p>
        <p>Let's get started in seconds.</p>
      </div>
      <div className="m-auto mt-4 px-16 py-4 bg-gray-monika bg-opacity-10 rounded-md">
        <p className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text font-normal text-center text-transparent">
          npm i -g @hyperjumptech/monika
        </p>
      </div>
      <div className="flex flex-row justify-between m-auto mt-4">
        <ButtonLink
          className="w-40 flex items-center leading-snug hover:opacity-75 font-semibold text-center"
          href="/quick-start"
          rel="noopener noreferrer"
        >
          Get Started!
        </ButtonLink>
        <ButtonLink
          outline="true"
          className="w-40 flex items-center leading-snug hover:opacity-75 font-semibold"
          href="/quick-start"
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
          Star
        </ButtonLink>
      </div>
    </div>
  )
}
