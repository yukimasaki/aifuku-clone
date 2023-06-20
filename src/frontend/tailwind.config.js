/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [
    // Docs: https://tailwindcss.com/docs/typography-plugin
    require("@tailwindcss/typography"),
    // Docs: https://github.com/tailwindlabs/tailwindcss-forms
    require("@tailwindcss/forms"),
    // Docs: https://github.com/tailwindlabs/tailwindcss-aspect-ratio
    require("@tailwindcss/line-clamp"),
    // Docs: https://github.com/tailwindlabs/tailwindcss-line-clamp
    require("@tailwindcss/aspect-ratio"),
    // Docs: https://daisyui.com/docs
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        aifuku: {
          "primary": "#15bef2",
          "secondary": "#ffc9d7",
          "accent": "#f296cb",
          "neutral": "#36273a",
          "base-100": "#f9fafa",
          "info": "#4e8dda",
          "success": "#1a7465",
          "warning": "#9f730f",
          "error": "#f33f42",
        }
      }
    ]
  },
}

