/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
theme: {
    extend: {
      shadows: {
        'rose-500/10': '0 10px 15px -3px rgb(244 63 94 / 0.1)',
        'emerald-500/10': '0 10px 15px -3px rgb(16 185 129 / 0.1)',
      },
      borderColor: {
        'rose-200/50': 'rgb(254 205 211 / 0.5)',
        'emerald-200/50': 'rgb(187 247 208 / 0.5)',
      },
    },
  },
  plugins: [],
}
