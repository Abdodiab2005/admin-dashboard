/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**.ejs", "./views/*/**.ejs"],
  theme: {
    extend: {
      animation: {
        rotate4: "rotate4 2s linear infinite",
        dash4: "dash4 1.5s ease-in-out infinite",
        pulse: "pulse 1.5s infinite", // Adjust animation timing
      },
      keyframes: {
        rotate4: {
          "100%": { transform: "rotate(360deg)" },
        },
        dash4: {
          "0%": {
            "stroke-dasharray": "1, 200",
            "stroke-dashoffset": "0",
          },
          "50%": {
            "stroke-dasharray": "90, 200",
            "stroke-dashoffset": "-35px",
          },
          "100%": {
            "stroke-dashoffset": "-125px",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
      spacing: {
        13: "3.25rem", // Keep the original size if needed
      },
    },
  },
  plugins: [],
};
