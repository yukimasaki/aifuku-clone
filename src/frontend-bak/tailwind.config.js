const { access } = require('fs')

/** @type {import('tailwindcss').Config} */
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
  content: [],
  theme: {
    extend: {
      colors: {
        "daisy-primary": customColor.primary,
      }
    },
  },
  plugins: [
    // Docs: https://tailwindcss.com/docs/typography-plugin
    require("@tailwindcss/typography"),
    // Docs: https://github.com/tailwindlabs/tailwindcss-forms
    require("@tailwindcss/forms"),
    // Docs: https://github.com/tailwindlabs/tailwindcss-line-clamp
    require("@tailwindcss/aspect-ratio"),
    // Docs: https://daisyui.com/docs
    require("daisyui"),
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

