import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netrix: {
          cyan: "#23f7ff",
          magenta: "#ff3df2",
          gold: "#f8d66d",
          ink: "#070910",
        },
      },
    },
  },
  plugins: [],
};

export default config;

