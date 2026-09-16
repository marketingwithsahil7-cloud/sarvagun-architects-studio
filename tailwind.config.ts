import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0908", // near-black base
        panel: "#141209", // raised warm panel
        ivory: "#EDE7DA", // warm ivory (not pure white)
        dim: "#B3AC9B", // dimmed ivory
        burnt: "#E2672B", // burnt-orange accent — used sparingly
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "88rem",
      },
    },
  },
  plugins: [],
};

export default config;
