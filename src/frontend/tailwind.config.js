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
          "primary": "#5f939a",
          "secondary": "#1b2021",
          "accent": "#d8ac9c",
          "neutral": "#eac8af",
          "base-100": "#eff4f4",
          "info": "#4e8dda",
          "success": "#1a7465",
          "warning": "#9f730f",
          "error": "#f33f42",
        }
      }
    ]
  },
}

