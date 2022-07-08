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

// tailwind.config.js

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  corePlugins: {
    preflight: true,
    float: false,
  },
  purge: {
    enabled: process.env.NODE_ENV !== 'development',
    content: ['./src/**/*.js'],
    options: {
      defaultExtractor: (content) => content.match(/[\w-/.:]+(?<!:)/g) || [],
    },
  },
  theme: {
    container: {
      padding: '1rem',
    },
    customForms: (theme) => ({
      sm: {
        'input, textarea, multiselect, select': {
          fontSize: theme('fontSize.sm'),
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
        },
        select: {
          paddingRight: `${theme('spacing.4')}`,
        },
        'checkbox, radio': {
          width: theme('spacing.3'),
          height: theme('spacing.3'),
        },
      },
    }),
    extend: {
      colors: {
        'aqua-monika': '#2FDCDC',
        'purple-monika': '#987CE8',
        'black-monika': '#1B1B1B',
        'gray-monika': '#C4C4C4',
        coral: {
          light: '#FF6070',
          default: '#FF4154',
          dark: '#EB2135',
        },
      },
      height: {
        '3/4': '75vh',
        72: '18rem',
      },
      inset: {
        '-16': '-4rem',
        '-128': '-32rem',
      },
      margin: {
        '-y-3/4': '-75vh',
        '-y-1/4': '-25vh',
      },
      opacity: {
        10: '0.1',
      },
      width: {
        96: '24rem',
      },
      fontSize: {
        52: '52px',
      },
      lineHeight: {
        62: '62.4px',
      },
      spacing: {
        128: '34rem',
        '08': '0.8px',
        '28r': '27.5rem',
        '32r': '30rem',
      },
    },
    fontFamily: {
      sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
      serif: ['Inter', ...defaultTheme.fontFamily.serif],
    },
    minWidth: {
      md: '15%',
      30: '30%',
    },
    rotate: {
      ...defaultTheme.rotate,
      '-30': '-30deg',
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1400px',
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/ui')],
}
