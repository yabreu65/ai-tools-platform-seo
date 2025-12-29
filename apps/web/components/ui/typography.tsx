import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { typographyVariants, containerVariants } from "@/lib/typography"

// Main Typography component
export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean
  as?: keyof JSX.IntrinsicElements
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, align, asChild = false, as = "p", children, ...props }, ref) => {
    const Comp = asChild ? Slot : as

    return (
      <Comp
        className={cn(typographyVariants({ variant, color, align }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Typography.displayName = "Typography"

// Specialized typography components
const Heading = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "as"> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }
>(({ level = 1, variant, className, ...props }, ref) => {
  const headingTag = `h${level}` as keyof JSX.IntrinsicElements
  
  // Auto-select variant based on heading level if not provided
  const autoVariant = variant || {
    1: "heading-xl",
    2: "heading-lg", 
    3: "heading-md",
    4: "heading-sm",
    5: "heading-xs",
    6: "heading-xs",
  }[level] as VariantProps<typeof typographyVariants>["variant"]

  return (
    <Typography
      ref={ref}
      as={headingTag}
      variant={autoVariant}
      className={className}
      {...props}
    />
  )
})
Heading.displayName = "Heading"

const Display = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "as" | "variant"> & {
    size?: "sm" | "md" | "lg" | "xl" | "2xl"
  }
>(({ size = "lg", className, ...props }, ref) => {
  const variant = `display-${size}` as VariantProps<typeof typographyVariants>["variant"]

  return (
    <Typography
      ref={ref}
      as="h1"
      variant={variant}
      className={className}
      {...props}
    />
  )
})
Display.displayName = "Display"

const Body = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "as" | "variant"> & {
    size?: "xs" | "sm" | "md" | "lg" | "xl"
  }
>(({ size = "md", className, ...props }, ref) => {
  const variant = `body-${size}` as VariantProps<typeof typographyVariants>["variant"]

  return (
    <Typography
      ref={ref}
      as="p"
      variant={variant}
      className={className}
      {...props}
    />
  )
})
Body.displayName = "Body"

const Label = React.forwardRef<
  HTMLLabelElement,
  Omit<TypographyProps, "as" | "variant"> & {
    size?: "sm" | "md" | "lg"
    htmlFor?: string
  }
>(({ size = "md", className, ...props }, ref) => {
  const variant = `label-${size}` as VariantProps<typeof typographyVariants>["variant"]

  return (
    <Typography
      ref={ref}
      as="label"
      variant={variant}
      className={className}
      {...props}
    />
  )
})
Label.displayName = "Label"

const Caption = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "as" | "variant"> & {
    size?: "sm" | "md" | "lg"
  }
>(({ size = "md", className, ...props }, ref) => {
  const variant = `caption-${size}` as VariantProps<typeof typographyVariants>["variant"]

  return (
    <Typography
      ref={ref}
      as="span"
      variant={variant}
      className={className}
      {...props}
    />
  )
})
Caption.displayName = "Caption"

// Container component for consistent spacing
export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  asChild?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, spacing, padding, margin, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"

    return (
      <Comp
        className={cn(containerVariants({ spacing, padding, margin }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

// Section component for page sections with consistent spacing
const Section = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    spacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
    as?: keyof JSX.IntrinsicElements
  }
>(({ className, spacing = "lg", as = "section", ...props }, ref) => {
  const spacingClass = `space-y-${spacing === "xs" ? "4" : spacing === "sm" ? "6" : spacing === "md" ? "8" : spacing === "lg" ? "12" : spacing === "xl" ? "16" : "24"}`

  return (
    <Container
      ref={ref}
      as={as}
      className={cn(spacingClass, className)}
      {...props}
    />
  )
})
Section.displayName = "Section"

// Responsive text components
const ResponsiveHeading = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "as" | "variant"> & {
    type?: "hero" | "page-title" | "section-title" | "card-title"
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }
>(({ type = "section-title", level = 1, className, ...props }, ref) => {
  const headingTag = `h${level}` as keyof JSX.IntrinsicElements
  
  const responsiveClasses = {
    hero: "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight",
    "page-title": "text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight",
    "section-title": "text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight",
    "card-title": "text-lg md:text-xl font-semibold tracking-tight",
  }

  return (
    <Typography
      ref={ref}
      as={headingTag}
      className={cn(responsiveClasses[type], className)}
      {...props}
    />
  )
})
ResponsiveHeading.displayName = "ResponsiveHeading"

const ResponsiveBody = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "as" | "variant"> & {
    type?: "body" | "caption"
  }
>(({ type = "body", className, ...props }, ref) => {
  const responsiveClasses = {
    body: "text-sm md:text-base lg:text-lg leading-relaxed",
    caption: "text-xs md:text-sm leading-tight text-muted-foreground",
  }

  return (
    <Typography
      ref={ref}
      as="p"
      className={cn(responsiveClasses[type], className)}
      {...props}
    />
  )
})
ResponsiveBody.displayName = "ResponsiveBody"

// Gradient text component
const GradientText = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "as" | "color"> & {
    gradient?: "primary" | "seo" | "success" | "custom"
    customGradient?: string
  }
>(({ gradient = "primary", customGradient, className, ...props }, ref) => {
  const gradientClasses = {
    primary: "bg-gradient-to-r from-tech-blue-600 to-ai-purple-600 bg-clip-text text-transparent",
    seo: "bg-gradient-to-r from-seo-teal-600 to-tech-blue-600 bg-clip-text text-transparent",
    success: "bg-gradient-to-r from-success-600 to-seo-teal-600 bg-clip-text text-transparent",
    custom: customGradient || "",
  }

  return (
    <Typography
      ref={ref}
      as="span"
      className={cn(gradientClasses[gradient], className)}
      {...props}
    />
  )
})
GradientText.displayName = "GradientText"

export {
  Typography,
  Heading,
  Display,
  Body,
  Label,
  Caption,
  Container,
  Section,
  ResponsiveHeading,
  ResponsiveBody,
  GradientText,
  typographyVariants,
  containerVariants,
}