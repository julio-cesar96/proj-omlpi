const preset = require('../packages/tailwind-config/tailwind.preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}', './index.html'],
};
