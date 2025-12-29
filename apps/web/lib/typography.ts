import { cva } from "class-variance-authority"

// Typography scale configuration
export const typographyScale = {
  // Display sizes - for hero sections and major headings
  "display-2xl": "text-7xl font-bold tracking-tight", // 72px
  "display-xl": "text-6xl font-bold tracking-tight", // 60px
  "display-lg": "text-5xl font-bold tracking-tight", // 48px
  "display-md": "text-4xl font-bold tracking-tight", // 36px
  "display-sm": "text-3xl font-bold tracking-tight", // 30px
  
  // Heading sizes - for section headings
  "heading-xl": "text-3xl font-semibold tracking-tight", // 30px
  "heading-lg": "text-2xl font-semibold tracking-tight", // 24px
  "heading-md": "text-xl font-semibold tracking-tight", // 20px
  "heading-sm": "text-lg font-semibold tracking-tight", // 18px
  "heading-xs": "text-base font-semibold tracking-tight", // 16px
  
  // Body text sizes
  "body-xl": "text-xl font-normal leading-relaxed", // 20px
  "body-lg": "text-lg font-normal leading-relaxed", // 18px
  "body-md": "text-base font-normal leading-normal", // 16px
  "body-sm": "text-sm font-normal leading-normal", // 14px
  "body-xs": "text-xs font-normal leading-normal", // 12px
  
  // Label and UI text
  "label-lg": "text-sm font-medium leading-none", // 14px
  "label-md": "text-sm font-medium leading-none", // 14px
  "label-sm": "text-xs font-medium leading-none", // 12px
  
  // Caption and helper text
  "caption-lg": "text-sm font-normal leading-tight text-muted-foreground", // 14px
  "caption-md": "text-xs font-normal leading-tight text-muted-foreground", // 12px
  "caption-sm": "text-xs font-normal leading-tight text-muted-foreground", // 12px
} as const

export type TypographyVariant = keyof typeof typographyScale

// Typography component variants using CVA
export const typographyVariants = cva("", {
  variants: {
    variant: {
      // Display variants
      "display-2xl": "text-7xl font-bold tracking-tight",
      "display-xl": "text-6xl font-bold tracking-tight",
      "display-lg": "text-5xl font-bold tracking-tight",
      "display-md": "text-4xl font-bold tracking-tight",
      "display-sm": "text-3xl font-bold tracking-tight",
      
      // Heading variants
      "heading-xl": "text-3xl font-semibold tracking-tight",
      "heading-lg": "text-2xl font-semibold tracking-tight",
      "heading-md": "text-xl font-semibold tracking-tight",
      "heading-sm": "text-lg font-semibold tracking-tight",
      "heading-xs": "text-base font-semibold tracking-tight",
      
      // Body variants
      "body-xl": "text-xl font-normal leading-relaxed",
      "body-lg": "text-lg font-normal leading-relaxed",
      "body-md": "text-base font-normal leading-normal",
      "body-sm": "text-sm font-normal leading-normal",
      "body-xs": "text-xs font-normal leading-normal",
      
      // Label variants
      "label-lg": "text-sm font-medium leading-none",
      "label-md": "text-sm font-medium leading-none",
      "label-sm": "text-xs font-medium leading-none",
      
      // Caption variants
      "caption-lg": "text-sm font-normal leading-tight text-muted-foreground",
      "caption-md": "text-xs font-normal leading-tight text-muted-foreground",
      "caption-sm": "text-xs font-normal leading-tight text-muted-foreground",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
      
      // Status colors
      success: "text-success-600 dark:text-success-400",
      warning: "text-warning-600 dark:text-warning-400",
      error: "text-error-600 dark:text-error-400",
      info: "text-tech-blue-600 dark:text-tech-blue-400",
      
      // AI Tools Platform colors
      "tech-blue": "text-tech-blue-600 dark:text-tech-blue-400",
      "ai-purple": "text-ai-purple-600 dark:text-ai-purple-400",
      "seo-teal": "text-seo-teal-600 dark:text-seo-teal-400",
      
      // Gradient text effects
      "gradient-primary": "bg-gradient-to-r from-tech-blue-600 to-ai-purple-600 bg-clip-text text-transparent",
      "gradient-seo": "bg-gradient-to-r from-seo-teal-600 to-tech-blue-600 bg-clip-text text-transparent",
      "gradient-success": "bg-gradient-to-r from-success-600 to-seo-teal-600 bg-clip-text text-transparent",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
  },
  defaultVariants: {
    variant: "body-md",
    color: "default",
    align: "left",
  },
})

// Spacing system configuration
export const spacingScale = {
  // Component spacing
  "component-xs": "space-y-1", // 4px
  "component-sm": "space-y-2", // 8px
  "component-md": "space-y-4", // 16px
  "component-lg": "space-y-6", // 24px
  "component-xl": "space-y-8", // 32px
  "component-2xl": "space-y-12", // 48px
  
  // Section spacing
  "section-xs": "space-y-4", // 16px
  "section-sm": "space-y-6", // 24px
  "section-md": "space-y-8", // 32px
  "section-lg": "space-y-12", // 48px
  "section-xl": "space-y-16", // 64px
  "section-2xl": "space-y-24", // 96px
  
  // Page spacing
  "page-xs": "space-y-8", // 32px
  "page-sm": "space-y-12", // 48px
  "page-md": "space-y-16", // 64px
  "page-lg": "space-y-24", // 96px
  "page-xl": "space-y-32", // 128px
} as const

export type SpacingVariant = keyof typeof spacingScale

// Container spacing variants
export const containerVariants = cva("", {
  variants: {
    spacing: {
      // Component level spacing
      "component-xs": "space-y-1",
      "component-sm": "space-y-2",
      "component-md": "space-y-4",
      "component-lg": "space-y-6",
      "component-xl": "space-y-8",
      "component-2xl": "space-y-12",
      
      // Section level spacing
      "section-xs": "space-y-4",
      "section-sm": "space-y-6",
      "section-md": "space-y-8",
      "section-lg": "space-y-12",
      "section-xl": "space-y-16",
      "section-2xl": "space-y-24",
      
      // Page level spacing
      "page-xs": "space-y-8",
      "page-sm": "space-y-12",
      "page-md": "space-y-16",
      "page-lg": "space-y-24",
      "page-xl": "space-y-32",
    },
    padding: {
      none: "p-0",
      xs: "p-2",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-12",
      "2xl": "p-16",
    },
    margin: {
      none: "m-0",
      xs: "m-2",
      sm: "m-4",
      md: "m-6",
      lg: "m-8",
      xl: "m-12",
      "2xl": "m-16",
    },
  },
  defaultVariants: {
    spacing: "component-md",
    padding: "none",
    margin: "none",
  },
})

// Responsive typography helpers
export const responsiveTypography = {
  // Hero text that scales down on mobile
  hero: "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight",
  
  // Page titles
  "page-title": "text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight",
  
  // Section titles
  "section-title": "text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight",
  
  // Card titles
  "card-title": "text-lg md:text-xl font-semibold tracking-tight",
  
  // Body text that's readable on all devices
  "body-responsive": "text-sm md:text-base lg:text-lg leading-relaxed",
  
  // Captions and small text
  "caption-responsive": "text-xs md:text-sm leading-tight text-muted-foreground",
} as const

// Line height configurations for better readability
export const lineHeights = {
  tight: "leading-tight", // 1.25
  normal: "leading-normal", // 1.5
  relaxed: "leading-relaxed", // 1.625
  loose: "leading-loose", // 2
} as const

// Letter spacing configurations
export const letterSpacing = {
  tighter: "tracking-tighter", // -0.05em
  tight: "tracking-tight", // -0.025em
  normal: "tracking-normal", // 0em
  wide: "tracking-wide", // 0.025em
  wider: "tracking-wider", // 0.05em
  widest: "tracking-widest", // 0.1em
} as const

// Font weight configurations
export const fontWeights = {
  thin: "font-thin", // 100
  extralight: "font-extralight", // 200
  light: "font-light", // 300
  normal: "font-normal", // 400
  medium: "font-medium", // 500
  semibold: "font-semibold", // 600
  bold: "font-bold", // 700
  extrabold: "font-extrabold", // 800
  black: "font-black", // 900
} as const

// Helper function to get typography class
export function getTypographyClass(variant: TypographyVariant): string {
  return typographyScale[variant]
}

// Helper function to get spacing class
export function getSpacingClass(variant: SpacingVariant): string {
  return spacingScale[variant]
}