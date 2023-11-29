/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/**/*.{vue,js,ts}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
};
