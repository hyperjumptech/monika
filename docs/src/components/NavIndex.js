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

export default function NavIndex(props) {
  const childrens = props.props.children
  const forMedium = props.forMedium

  let containerClass = 'csticky'
  if (forMedium == 'true') {
    containerClass = 'cmedium'
  }

  const indexing = childrens.map((item) => {
    switch (item?.props?.originalType) {
      case 'h2':
        return (
          <ul key={'ul' + item?.props?.id.toString()} className="text-sm">
            <li key={item?.props?.id.toString()}>
              <span className="pr-2">•</span>
              <a href={'#' + item.props.id}>{item.props.children[0]}</a>
            </li>
          </ul>
        )
      case 'h3':
        return (
          <ul key={'ul' + item?.props?.id.toString()} className="pl-3 text-sm">
            <li key={item?.props?.id.toString()}>
              <span className="pr-2">-</span>
              <a href={'#' + item.props.id}>{item.props.children[0]}</a>
            </li>
          </ul>
        )
      default:
        return ''
    }
  })

  return (
    <>
      <div className={containerClass}>
        <div className="relative w-full">
          <div className="sticky">{indexing}</div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1023px) {
          .csticky {
            display: none;
          }

          .cmedium {
            border: solid #e3e3e3 2px;
            padding: 10px 15px;
            margin-bottom: 15px;
          }
        }
        @media (min-width: 1024px) {
          .cmedium {
            display: none;
          }
          .csticky {
            min-width: 225px;
            display: flex;
            flex-direction: row-reverse;
          }
          ul > li:hover {
            font-weight: bold;
          }
          .sticky {
            top: 3.75rem;
          }
          .sticky ul {
            padding-top: 5rem;
          }
        }
      `}</style>
    </>
  )
}
