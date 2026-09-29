/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14161B",
        surface: "#1D2027",
        surface2: "#23262E",
        ink: "#F1EFE9",
        dim: "#9A9CA6",
        faint: "#5E616B",
        line: "#2B2E36",
        gold: "#E8B23D",
        gold2: "#C98F22",
        green: "#5FB77E",
        red: "#E15A4B",
        blue: "#6C9BD1",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "4px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
