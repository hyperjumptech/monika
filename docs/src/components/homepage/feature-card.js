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

import React from 'react'

import PropTypes from 'prop-types'

const FeatureCard = (props) => {
  return (
    <>
      <div className={`container ${props.rootClassName} `}>
        <img alt={props.image_alt} src={props.image_src} className="image" />
        <h4 className="text-2xl text-white font-semibold text-center mt-5">
          {props.title}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika">
            {' '}
            {props.title2}
          </span>
        </h4>
        <p className="text-center p-2 text-xs text-transparent bg-clip-text bg-gradient-to-r from-aqua-monika to-purple-monika">
          {props.title3}
        </p>
        <p className="text-md text-gray-200 text-center">{props.text}</p>
      </div>
      <style jsx>
        {`
          .container {
            width: 197px;
            display: flex;
            position: relative;
            align-items: center;
            flex-direction: column;
          }
          .image {
            object-fit: cover;
          }
          @media only screen and (max-width: 1200px) {
            .container {
              width: 310px;
            }
          }
          @media only screen and (max-width: 768px) {
            .container {
              width: 350px;
            }
          }
        `}
      </style>
    </>
  )
}

FeatureCard.defaultProps = {
  title: 'Title',
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
  image_src: '/playground_assets/01.svg',
  rootClassName: '',
  image_alt: 'image',
}

FeatureCard.propTypes = {
  title: PropTypes.string,
  title2: PropTypes.string,
  title3: PropTypes.string,
  text: PropTypes.string,
  image_src: PropTypes.string,
  rootClassName: PropTypes.string,
  image_alt: PropTypes.string,
}

export default FeatureCard
