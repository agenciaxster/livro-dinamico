import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      colors: {
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive))",
          foreground: "rgb(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "rgb(var(--success))",
          foreground: "rgb(var(--success-foreground))",
          light: "rgb(var(--success-light))",
        },
        warning: {
          DEFAULT: "rgb(var(--warning))",
          foreground: "rgb(var(--warning-foreground))",
          light: "rgb(var(--warning-light))",
        },
        profit: {
          DEFAULT: "rgb(var(--profit))",
          light: "rgb(var(--profit-light))",
        },
        loss: {
          DEFAULT: "rgb(var(--loss))",
          light: "rgb(var(--loss-light))",
        },
        popover: {
          DEFAULT: "rgb(var(--popover))",
          foreground: "rgb(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "rgb(var(--sidebar-background))",
          foreground: "rgb(var(--sidebar-foreground))",
          primary: "rgb(var(--sidebar-primary))",
          "primary-foreground": "rgb(var(--sidebar-primary-foreground))",
          accent: "rgb(var(--sidebar-accent))",
          "accent-foreground": "rgb(var(--sidebar-accent-foreground))",
          border: "rgb(var(--sidebar-border))",
          ring: "rgb(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      boxShadow: {
        "soft": "var(--shadow-soft)",
        "medium": "var(--shadow-medium)",
        "strong": "var(--shadow-strong)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-card": "var(--gradient-card)",
        "gradient-sidebar": "var(--gradient-sidebar)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
