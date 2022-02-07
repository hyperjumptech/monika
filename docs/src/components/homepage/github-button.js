import React from 'react'

import PropTypes from 'prop-types'

const GithubButton = (props) => {
  return (
    <>
      <div className={`container ${props.rootClassName} `}>
        <img alt={props.image_alt} src={props.image_src} className="image" />
        <span className="text">{props.text}</span>
      </div>
      <style jsx>
        {`
          .container {
            flex: 0 0 auto;
            width: 135px;
            height: 48px;
            display: flex;
            align-items: center;
            border-color: var(--dl-color-default-monikagradient80346);
            border-style: solid;
            border-width: 2px;
            border-radius: var(--dl-radius-radius-radius8);
            flex-direction: row;
            justify-content: center;
          }
          .image {
            width: 22px;
            align-self: center;
            object-fit: cover;
          }
          .text {
            color: var(--dl-color-gray-white);
            margin-left: var(--dl-space-space-halfunit);
          }
          .rootClassName {
            margin-top: var(--dl-space-space-doubleunit);
            background-color: var(--dl-color-gray-black);
          }
          @media (max-width: 767px) {
            .container {
              display: none;
            }
          }
          @media (max-width: 479px) {
            .container {
              display: none;
            }
          }
        `}
      </style>
    </>
  )
}

GithubButton.defaultProps = {
  image_alt: 'image',
  rootClassName: '',
  text: 'Github',
  image_src: '1fd68142-d71d-4891-8846-6f2cd318296f',
}

GithubButton.propTypes = {
  image_alt: PropTypes.string,
  rootClassName: PropTypes.string,
  text: PropTypes.string,
  image_src: PropTypes.string,
}

export default GithubButton
