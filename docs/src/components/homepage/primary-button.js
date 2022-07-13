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

import PropTypes from 'prop-types'

const PrimaryButton = (props) => {
  return (
    <>
      <div className={`${props.rootClassName} `}>
        <button className="button mediumLabel">{props.button}</button>
      </div>
      <style jsx>
        {`
          .button {
            color: var(--dl-color-gray-white);
            width: 100%;
            align-self: center;
            background: linear-gradient(310deg, #2fdcdc, #987ce8);
            transition: 0.3s;
            padding-top: 12px;
            border-width: 0px;
            padding-left: 32px;
            border-radius: 20px;
            padding-right: 32px;
            padding-bottom: 12px;
            background-color: transparent;
          }
          .button:hover {
            background-color: var(--dl-color-purple-900);
          }
          .button:active {
            background-color: var(--dl-color-purple-1000);
          }
          .rootClassName {
            margin-bottom: var(--dl-space-space-unit);
          }
        `}
      </style>
    </>
  )
}

PrimaryButton.defaultProps = {
  rootClassName: '',
  button: 'Button',
}

PrimaryButton.propTypes = {
  rootClassName: PropTypes.string,
  button: PropTypes.string,
}

export default PrimaryButton
