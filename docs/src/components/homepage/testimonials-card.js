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

const TestimonialsCard = (props) => {
  return (
    <>
      <div className="col-span-1 flex flex-col bg-white shadow p-4">
        <img
          alt={props.image_alt}
          src={props.image_src}
          className="image"
          style={{ minHeight: 200 }}
        />
        <div className="container1">
          <img
            alt={props.image_alt1}
            src={props.image_src1}
            className="image1"
          />
          <div className="container2">
            <span className="text lead1">{props.text}</span>
            <span className="subtitle1">{props.text1}</span>
            <span className="text2 lead2">{props.text2}</span>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .container {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            padding: var(--dl-space-space-doubleunit);
            box-shadow: 0px 10px 20px 0px rgba(41, 41, 42, 0.07);
            align-items: flex-start;
            border-radius: var(--dl-radius-radius-radius8);
            flex-direction: column;
            background-color: var(--dl-color-gray-white);
          }
          .image {
            width: 200px;
            object-fit: cover;
            margin-bottom: var(--dl-space-space-unit);
          }
          .container1 {
            flex: 0 0 auto;
            width: 100%;
            height: auto;
            display: flex;
            align-items: flex-start;
            flex-direction: row;
            justify-content: flex-start;
          }
          .image1 {
            top: 81px;
            left: 46px;
            right: auto;
            width: 15px;
            bottom: auto;
            object-fit: cover;
          }
          .container2 {
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            justify-content: flex-start;
          }
          .text {
            margin-bottom: var(--dl-space-space-doubleunit);
          }
          .text2 {
            color: var(--dl-color-gray-700);
          }
        `}
      </style>
    </>
  )
}

TestimonialsCard.defaultProps = {
  image_alt1: 'image',
  image_alt: 'image',
  text2: 'Vice President, GoPro',
  text1: 'Floyd Miles',
  text: 'To quickly start my startup landing page design, I was looking for a landing page UI Kit. Landify is one of the best landing page UI kit I have come across. It’s so flexible, well organised and easily editable.',
  image_src:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/2560px-Airbnb_Logo_B%C3%A9lo.svg.png',
  image_src1: '/playground_assets/quote-mark.svg',
}

TestimonialsCard.propTypes = {
  image_alt1: PropTypes.string,
  image_alt: PropTypes.string,
  text2: PropTypes.string,
  text1: PropTypes.string,
  text: PropTypes.string,
  image_src: PropTypes.string,
  image_src1: PropTypes.string,
}

export default TestimonialsCard
