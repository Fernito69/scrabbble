/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        "gradient": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 0, 255, 0.6)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 0, 255, 0.8), 0 0 100px rgba(0, 255, 255, 0.6)",
          },
        },
        "border-spin": {
          "0%": { borderColor: "rgb(239 68 68)" },
          "25%": { borderColor: "rgb(249 115 22)" },
          "50%": { borderColor: "rgb(234 179 8)" },
          "75%": { borderColor: "rgb(249 115 22)" },
          "100%": { borderColor: "rgb(239 68 68)" },
        },
        "bg-cycle": {
          "0%, 100%": { backgroundColor: "rgb(253 224 71)" },
          "50%": { backgroundColor: "rgb(147 197 253)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-scale": "pulse-scale 1s ease-in-out infinite",
        "gradient": "gradient 3s ease infinite",
        "glow": "glow 2s ease-in-out infinite",
        "border-spin": "border-spin 1.5s linear infinite",
        "bg-cycle": "bg-cycle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
