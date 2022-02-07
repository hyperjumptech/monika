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

const ArticleCard = (props) => {
  return (
    <>
      <div style={{ backgroundColor: '#272727' }} className="rounded-lg m-4">
        <img alt={props.image_alt} src={props.image_src} className="image" />
        <div className="container overflow-x-hidden">
          <span className="text">{props.text}</span>
          <span className="text1">{props.text1}</span>
          <a
            href={props.link_text}
            target="_blank"
            rel="noreferrer noopener"
            className="link"
          >
            {props.text3}
          </a>
        </div>
      </div>
      <style jsx>
        {`
          .container {
            flex: 0 0 auto;
            display: flex;
            max-width: 300px;
            align-items: flex-start;
            flex-direction: column;
          }
          .image {
            margin: var(--dl-space-space-halfunit);
            max-width: 280px;
            object-fit: cover;
          }
          .text {
            color: var(--dl-color-gray-white);
            margin: var(--dl-space-space-halfunit);
            font-size: 20px;
            align-self: flex-start;
            font-style: normal;
            text-align: left;
            font-weight: 600;
          }
          .text1 {
            color: var(--dl-color-gray-white);
            margin: var(--dl-space-space-halfunit);
            align-self: flex-start;
          }
          .link {
            color: #25ccdb;
            margin: var(--dl-space-space-halfunit);
            text-decoration: underline;
          }
        `}
      </style>
    </>
  )
}

ArticleCard.defaultProps = {
  link_text: 'https://example.com',
  image_alt: 'image',
  image_src: '/playground_assets/case-image-200h.png',
  text3: 'Link',
  text: 'Article Title',
  text1: 'Text',
}

ArticleCard.propTypes = {
  link_text: PropTypes.string,
  image_alt: PropTypes.string,
  image_src: PropTypes.string,
  text3: PropTypes.string,
  text: PropTypes.string,
  text1: PropTypes.string,
}

export default ArticleCard
