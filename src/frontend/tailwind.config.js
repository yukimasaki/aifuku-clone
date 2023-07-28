/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

const customColor = {
  primary: '#5f939a',
  secondary: "#1b2021",
  accent: "#d8ac9c",
  neutral: "#eac8af",
  base: "#eff4f4",
  info: "#4e8dda",
  success: "#1a7465",
  warning: "#9f730f",
  error: "#f33f42",
}

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        "daisy-primary": customColor.primary,
      },
      screens: {
        sm: { 'max': '560px' },
        md: { 'max': '768px' },
        tb: { 'max': '960px' },
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        aifuku: {
          "primary": customColor.primary,
          "secondary": customColor.secondary,
          "accent": customColor.accent,
          "neutral": customColor.neutral,
          "base-100": customColor.base,
          "info": customColor.info,
          "success": customColor.success,
          "warning": customColor.warning,
          "error": customColor.error,
        }
      }
    ]
  },
}
