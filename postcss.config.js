// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {}, // This line is crucial for processing @tailwind directives
    autoprefixer: {}, // This line is for adding vendor prefixes
  },
};