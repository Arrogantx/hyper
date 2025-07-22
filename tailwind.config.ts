import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Neon Palette
        neon: {
          pink: "#ff0080",
          cyan: "#00ffff",
          green: "#39ff14",
          purple: "#8a2be2",
          orange: "#ff6600",
          yellow: "#ffff00",
          blue: "#0080ff",
        },
        // Dark theme colors
        dark: {
          bg: "#0a0a0a",
          surface: "#1a1a1a",
          card: "#2a2a2a",
          border: "#3a3a3a",
        },
        // Glitch effect colors
        glitch: {
          red: "#ff0040",
          blue: "#0040ff",
          green: "#40ff00",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        cyber: ["Orbitron", "monospace"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite alternate",
        "glitch": "glitch 0.3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
      },
      keyframes: {
        "pulse-neon": {
          "0%": {
            textShadow: "0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor",
          },
          "100%": {
            textShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
          },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": {
            boxShadow: "0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor",
          },
          "100%": {
            boxShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
          },
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)",
        "neon-gradient": "linear-gradient(45deg, #ff0080, #00ffff, #39ff14, #8a2be2)",
      },
      backgroundSize: {
        "grid": "20px 20px",
      },
      boxShadow: {
        "neon": "0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor",
        "neon-lg": "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
        "cyber": "0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1)",
      },
      backdropBlur: {
        "cyber": "10px",
      },
    },
  },
  plugins: [],
};

export default config;