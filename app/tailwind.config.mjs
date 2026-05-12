/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: {
          100: "hsl(0 0% 100%)", // Pure white
          200: "hsl(0 0% 98%)",  // Very light white
          300: "hsl(0 0% 95%)",  // Light white
          400: "hsl(0 0% 90%)",  // Off-white
        },
        gray: {
          800: "hsl(222.2 84% 4.2%)", // Dark gray for text
          900: "hsl(222.2 84% 2%)",   // Very dark gray
        },
        blue: {
          100: "hsl(221.2 83.2% 53.3%)", // Light blue accent
        }
      }
    }
  },
  corePlugins: {
    preflight: true,
    typography: true,
    preflightOnly: true,
  },
  plugins: [],
  daisyui: {
    themes: ['shadcn-light'], // Only light theme
  }
};