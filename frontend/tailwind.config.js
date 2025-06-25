module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-cyan": "#6FEAFF",
        "neon-blue": "#3B82F6",
        "neon-purple": "#A18AFF",
        "neon-pink": "#F472B6",
        "deep-bg": "#0B0C2A",
        "deep-bg-2": "#1B1740",
        "card-bg": "#181B3A",
      },
      boxShadow: {
        "neon-cyan": "0 0 8px 2px #6FEAFF, 0 0 32px 4px #6FEAFF44",
        "neon-purple": "0 0 8px 2px #A18AFF, 0 0 32px 4px #A18AFF44",
        "neon-pink": "0 0 8px 2px #F472B6, 0 0 32px 4px #F472B644",
      },
      fontSize: {
        hero: "4.5rem", // ~72px
        subtitle: "1.625rem", // ~26px
        "feature-title": "1.375rem", // ~22px
        "feature-desc": "1rem", // 16px
      },
      borderRadius: {
        neon: "16px",
      },
      backgroundImage: {
        "neon-gradient": "linear-gradient(90deg, #A18AFF 0%, #6FEAFF 100%)",
        "neon-gradient-dark":
          "linear-gradient(120deg, #0B0C2A 0%, #1B1740 100%)",
      },
    },
  },
  plugins: [],
};
