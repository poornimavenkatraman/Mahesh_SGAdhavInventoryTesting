// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // <--- THIS LINE IS ESSENTIAL FOR VUE FILES
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      // colors: {
      //   brand: {
      //     primary: "#2563eb", // blue-600
      //     secondary: "#f59e42", // orange custom
      //     accent: "#10b981", // emerald-500
      //     muted: "#64748b", // slate-500
      //     background: "#f8fafc", // gray-50
      //     surface: "#ffffff",
      //     error: "#ef4444", // red-500
      //     warning: "#facc15", // yellow-400
      //     info: "#38bdf8", // sky-400
      //     success: "#22c55e", // green-500
      //   },
      // },
      // spacing: {
      //   xs: "0.5rem",
      //   sm: "1rem",
      //   md: "2rem",
      //   lg: "4rem",
      //   xl: "8rem",
      //   borderRadius: {
      //     sm: "0.125rem",
      //     DEFAULT: "0.25rem",
      //     md: "0.375rem",
      //     lg: "0.5rem",
      //     xl: "0.75rem",
      //     full: "9999px",
      //   },
      //   boxShadow: {
      //     sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
      //     DEFAULT: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
      //     md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      //     lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      //     xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.04)",
      //   },
      //   transitionDuration: {
      //     DEFAULT: "150ms",
      //     fast: "75ms",
      //     slow: "300ms",
      //   },
      //   opacity: {
      //     0: "0",
      //     20: "0.2",
      //     40: "0.4",
      //     60: "0.6",
      //     80: "0.8",
      //     100: "1",
      //   },
      //   zIndex: {
      //     auto: "auto",
      //     0: "0",
      //     10: "10",
      //     20: "20",
      //     30: "30",
      //     40: "40",
      //     50: "50",
      //     modal: "1000",
      //     toast: "1100",
      //   },
      //   screens: {
      //     xs: "480px",
      //     sm: "640px",
      //     md: "768px",
      //     lg: "1024px",
      //     xl: "1280px",
      //     "2xl": "1536px",
      //   },
      // },
      // fontFamily: {
      //   heading: ["Montserrat", "sans-serif"],
      //   body: ["Inter", "sans-serif"],
      // },
    },
  },
  plugins: [],
};
