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
      margin: {
        '3/4': '75vh',
      },
      opacity: {
        10: '0.1',
      },
      inset: {
        '-16': '-4rem',
        '-20': '-6rem',
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
