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
}

