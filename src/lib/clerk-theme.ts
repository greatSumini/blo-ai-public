import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "iconButton",
  },
  variables: {
    // Colors from design guide
    colorPrimary: "#3BA2F8", // Accent Blue
    colorBackground: "#FCFCFD", // Off-White
    colorText: "#111827", // Gray 900
    colorTextSecondary: "#374151", // Gray 700
    colorInputBackground: "#FFFFFF",
    colorInputText: "#111827",
    colorDanger: "#EF4444", // Error Red

    // Border radius
    borderRadius: "8px",

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
      backgroundColor: "#FFFFFF",
      border: "1px solid #E1E5EA",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
      padding: "32px 24px",
    },

    // Header
    headerTitle: {
      fontSize: "24px",
      fontWeight: 600,
      color: "#111827",
      letterSpacing: "-0.025em",
    },
    headerSubtitle: {
      fontSize: "14px",
      fontWeight: 400,
      color: "#6B7280",
      marginTop: "8px",
    },

    // Social buttons
    socialButtonsBlockButton: {
      border: "1px solid #E1E5EA",
      borderRadius: "8px",
      "&:hover": {
        backgroundColor: "#F3F4F6",
      },
    },

    // Form elements
    formFieldLabel: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#374151",
      marginBottom: "8px",
    },
    formFieldInput: {
      height: "40px",
      padding: "12px 16px",
      border: "1px solid #D1D5DB",
      borderRadius: "6px",
      fontSize: "16px",
      "&:focus": {
        borderColor: "#3BA2F8",
        boxShadow: "0 0 0 3px rgba(59, 162, 248, 0.1)",
      },
      "&::placeholder": {
        color: "#D1D5DB",
      },
    },
    formFieldInputShowPasswordButton: {
      color: "#6B7280",
    },

    // Buttons
    formButtonPrimary: {
      height: "48px",
      backgroundColor: "#3BA2F8",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: 600,
      padding: "0 24px",
      "&:hover": {
        backgroundColor: "#2E91E5",
      },
      "&:active": {
        backgroundColor: "#2680D0",
      },
    },

    // Footer
    footer: {
      marginTop: "24px",
    },
    footerActionLink: {
      color: "#3BA2F8",
      fontWeight: 500,
      "&:hover": {
        color: "#2E91E5",
      },
    },

    // Divider
    dividerLine: {
      backgroundColor: "#E1E5EA",
    },
    dividerText: {
      color: "#6B7280",
      fontSize: "14px",
    },

    // Alert
    alertText: {
      fontSize: "14px",
    },

    // Identifier
    identityPreviewText: {
      fontSize: "14px",
      fontWeight: 500,
    },

    // Links
    formFieldAction: {
      color: "#3BA2F8",
      fontSize: "14px",
      fontWeight: 500,
      "&:hover": {
        color: "#2E91E5",
      },
    },
  },
};
