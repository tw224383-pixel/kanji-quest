import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slight": "bounceSlight 0.5s ease-in-out infinite alternate",
        "shine": "shine 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        },
        bounceSlight: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-4px)" }
        },
        shine: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" }
        }
      },
      dropShadow: {
        'game': [
          '0 4px 4px rgba(0, 0, 0, 0.5)',
          '0 2px 2px rgba(255, 255, 255, 0.5)'
        ],
        'game-text': [
          '2px 2px 0 #000',
          '-2px -2px 0 #000',
          '2px -2px 0 #000',
          '-2px 2px 0 #000',
          '0 4px 0 #000',
        ]
      }
    },
  },
  plugins: [],
};
export default config;
