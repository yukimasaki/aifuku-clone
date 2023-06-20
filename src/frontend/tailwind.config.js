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
          "primary": "#f2f25c",
          "secondary": "#73e2b8",
          "accent": "#f756b1",
          "neutral": "#2b2834",
          "base-100": "#e5ecf1",
          "info": "#7592eb",
          "success": "#17a177",
          "warning": "#facd6b",
          "error": "#eb7076",         
        }
      }
    ]
  },
}

