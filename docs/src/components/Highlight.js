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

import * as React from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live' // Original: https://raw.githubusercontent.com/PrismJS/prism-themes/master/themes/prism-ghcolors.css

/*:: import type { PrismTheme } from '../src/types' */

const theme =
  /*: PrismTheme */
  {
    plain: {
      color: '#293742',
      borderRadius: 12,
      fontFamily: `SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace`,
      fontSize: 14,
      lineHeight: '1.5',
    },
    styles: [
      {
        types: ['comment', 'prolog', 'doctype', 'cdata'],
        style: {
          color: '#A7B6C2',
          fontStyle: 'italic',
        },
      },
      {
        types: ['namespace'],
        style: {
          opacity: 0.7,
        },
      },
      {
        types: ['string', 'attr-value'],
        style: {
          color: '#DB2C6F',
        },
      },
      {
        types: ['punctuation', 'operator'],
        style: {
          color: '#394B59',
        },
      },
      {
        types: [
          'entity',
          'url',
          'symbol',
          'number',
          'boolean',
          'variable',
          'constant',
          'property',
          'regex',
          'inserted',
        ],
        style: {
          color: '#36acaa',
        },
      },
      {
        types: ['atrule', 'keyword', 'attr-name', 'selector'],
        style: {
          color: '#00B3A4',
        },
      },
      {
        types: ['function', 'deleted', 'tag'],
        style: {
          color: '#DB2C6F',
        },
      },
      {
        types: ['function-variable'],
        style: {
          color: '#634DBF',
        },
      },
      {
        types: ['tag', 'selector', 'keyword'],
        style: {
          color: '#1a56db',
        },
      },
    ],
  }

const Code = ({
  children,
  codeString,
  className = 'language-js',
  ...props
}) => {
  const language = className.replace(/language-/, '')
  const [key, setKey] = React.useState(`${Math.random() * 7}`)

  if (props['live']) {
    return (
      <div>
        <LiveProvider key={key} code={children.trim()} theme={theme} noInline>
          <div className="flex items-center justify-between">
            <div>Live JSX Editor</div>
            <div>
              <button onClick={() => setKey((k) => `${k * Math.random()}`)}>
                Reset
              </button>
            </div>
          </div>
          <div
            style={{
              paddingRight: 10,
              paddingLeft: 10,
            }}
          >
            <LiveEditor />
          </div>
          <div>
            <div>
              <div>Live Preview</div>
            </div>
            <div>
              <LiveError
                style={{
                  fontSize: 13,
                  background: '#FED7D7',
                  color: '#9B2C2C',
                  lineHeight: '1.5',
                  margin: -4,
                  padding: 4,
                }}
              />
              <LivePreview />
            </div>
          </div>
        </LiveProvider>
      </div>
    )
  } else {
    return (
      <Highlight
        {...defaultProps}
        code={children.trim()}
        language={language}
        theme={theme}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className + ' bg-gray-50 pb-4 pt-4 pr-4 overflow-auto'}
            style={{
              ...style,
              border: '1px solid #eee',
              fontSize: 13,
              lineHeight: '1.5',
            }}
          >
            {tokens.map((line, i) => (
              <div
                key={i}
                {...getLineProps({
                  line,
                  key: i,
                })}
              >
                {tokens.length > 1 ? (
                  <span
                    aria-hidden="true"
                    className="select-none text-gray-300 text-right w-5 inline-block mx-2"
                  >
                    {i + 1}
                  </span>
                ) : (
                  <span className="mx-2 w-5" />
                )}{' '}
                {line.map((token, key) => (
                  <span
                    key={key}
                    {...getTokenProps({
                      token,
                      key,
                    })}
                  />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    )
  }
}

export default Code
