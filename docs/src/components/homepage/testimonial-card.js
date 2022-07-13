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

const TestimonialCard = (props) => {
  return (
    <div className="flex flex-col justify-between items-center p-6 w-full bg-white rounded-lg shadow-md">
      <div className="w-28 h-28 rounded-full shadow-lg flex justify-center items-center p-2">
        <img alt={props.image_alt} src={props.image_src} />
      </div>
      <p className="text-lg text-center py-5">{props.description}</p>
      <div>
        <h2 className="text-center text-aqua-monika text-22 font-semibold">
          {props.name}
        </h2>
        <p className="text-center text-xs">{props.text}</p>
      </div>
    </div>
  )
}

TestimonialCard.propTypes = {
  image_alt: PropTypes.string,
  image_src: PropTypes.string,
  description: PropTypes.string,
  name: PropTypes.string,
  text: PropTypes.string,
}

export default TestimonialCard
