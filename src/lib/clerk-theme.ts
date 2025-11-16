import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "iconButton",
  },
  variables: {
    // Colors using CSS variables for dark mode support
    colorPrimary: "hsl(var(--accent))", // Accent color
    colorBackground: "hsl(var(--background))", // Background
    colorText: "hsl(var(--foreground))", // Foreground text
    colorTextSecondary: "hsl(var(--muted-foreground))", // Muted text
    colorInputBackground: "hsl(var(--card))", // Card/Input background
    colorInputText: "hsl(var(--foreground))", // Input text
    colorDanger: "hsl(var(--destructive))", // Error/Destructive

    // Border radius
    borderRadius: "0.5rem", // 8px

    // Typography
    fontFamily: "Pretendard Variable, -apple-system, sans-serif",
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  elements: {
    // Root container
    rootBox: {
      width: "100%",
      maxWidth: "420px",
    },

    // Card
    card: {
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.75rem", // 12px
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
      padding: "32px 24px",
      transition: "box-shadow 0.3s ease",
    },

    // Header
    headerTitle: {
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
      color: "hsl(var(--foreground))",
      letterSpacing: "-0.025em",
    },
    headerSubtitle: {
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
      color: "hsl(var(--muted-foreground))",
      marginTop: "8px",
    },

    // Social buttons
    socialButtonsBlockButton: {
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.5rem", // 8px
      transition: "background-color 0.1s ease-in-out",
      "&:hover": {
        backgroundColor: "hsl(var(--secondary))",
      },
    },

    // Form elements
    formFieldLabel: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      color: "hsl(var(--foreground))",
      marginBottom: "8px",
    },
    formFieldInput: {
      height: "40px",
      padding: "12px 16px",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.375rem", // 6px
      fontSize: "1rem", // 16px
      backgroundColor: "hsl(var(--card))",
      color: "hsl(var(--foreground))",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "&:focus": {
        borderColor: "hsl(var(--accent))",
        boxShadow: "0 0 0 3px hsla(var(--accent) / 0.1)",
        outline: "none",
      },
      "&::placeholder": {
        color: "hsl(var(--muted-foreground))",
      },
    },
    formFieldInputShowPasswordButton: {
      color: "hsl(var(--muted-foreground))",
    },

    // Buttons
    formButtonPrimary: {
      height: "48px",
      backgroundColor: "hsl(var(--accent))",
      borderRadius: "0.5rem", // 8px
      fontSize: "1rem", // 16px
      fontWeight: 600,
      padding: "0 24px",
      transition: "all 0.1s ease-in-out",
      "&:hover": {
        backgroundColor: "hsla(var(--accent) / 0.9)",
      },
      "&:active": {
        transform: "scale(0.95)",
      },
      "&:focus-visible": {
        outline: "2px solid hsl(var(--ring))",
        outlineOffset: "2px",
      },
    },

    // Footer
    footer: {
      marginTop: "24px",
    },
    footerActionLink: {
      color: "hsl(var(--accent))",
      fontWeight: 500,
      transition: "color 0.2s ease",
      "&:hover": {
        color: "hsla(var(--accent) / 0.8)",
      },
    },

    // Divider
    dividerLine: {
      backgroundColor: "hsl(var(--border))",
    },
    dividerText: {
      color: "hsl(var(--muted-foreground))",
      fontSize: "0.875rem", // 14px
    },

    // Alert
    alertText: {
      fontSize: "0.875rem", // 14px
    },

    // Identifier
    identityPreviewText: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
    },

    // Links
    formFieldAction: {
      color: "hsl(var(--accent))",
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      transition: "color 0.2s ease",
      "&:hover": {
        color: "hsla(var(--accent) / 0.8)",
      },
    },
  },
};
