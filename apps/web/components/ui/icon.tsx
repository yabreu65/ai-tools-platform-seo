import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { getIcon, getIconSize, type IconSize } from "@/lib/icons"

const iconVariants = cva("flex-shrink-0", {
  variants: {
    size: {
      xs: "h-3 w-3", // 12px
      sm: "h-4 w-4", // 16px
      md: "h-5 w-5", // 20px
      lg: "h-6 w-6", // 24px
      xl: "h-8 w-8", // 32px
      "2xl": "h-10 w-10", // 40px
    },
    variant: {
      default: "text-current",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
      
      // Status variants
      success: "text-success-600 dark:text-success-400",
      warning: "text-warning-600 dark:text-warning-400",
      error: "text-error-600 dark:text-error-400",
      info: "text-tech-blue-600 dark:text-tech-blue-400",
      
      // AI Tools Platform variants
      "tech-blue": "text-tech-blue-600 dark:text-tech-blue-400",
      "ai-purple": "text-ai-purple-600 dark:text-ai-purple-400",
      "seo-teal": "text-seo-teal-600 dark:text-seo-teal-400",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
})

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "size">,
    VariantProps<typeof iconVariants> {
  name?: string
  icon?: LucideIcon
  size?: IconSize
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, name, icon, size = "md", variant, ...props }, ref) => {
    // Determine which icon to use
    const IconComponent = icon || (name ? getIcon(name) : null)
    
    if (!IconComponent) {
      console.warn(`Icon not found: ${name}`)
      return null
    }

    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ size, variant }), className)}
        {...props}
      />
    )
  }
)
Icon.displayName = "Icon"

// Specialized icon components for common use cases
const StatusIcon = React.forwardRef<
  SVGSVGElement,
  Omit<IconProps, "variant"> & {
    status: "success" | "warning" | "error" | "info" | "loading"
  }
>(({ status, ...props }, ref) => {
  const statusIconMap = {
    success: "success",
    warning: "warning", 
    error: "error",
    info: "info",
    loading: "loading",
  }

  return (
    <Icon
      ref={ref}
      name={statusIconMap[status]}
      variant={status === "loading" ? "muted" : status}
      {...props}
    />
  )
})
StatusIcon.displayName = "StatusIcon"

const SEOToolIcon = React.forwardRef<
  SVGSVGElement,
  Omit<IconProps, "name"> & {
    tool: string
  }
>(({ tool, variant = "seo-teal", ...props }, ref) => {
  return (
    <Icon
      ref={ref}
      name={tool}
      variant={variant}
      {...props}
    />
  )
})
SEOToolIcon.displayName = "SEOToolIcon"

const ActionIcon = React.forwardRef<
  SVGSVGElement,
  Omit<IconProps, "variant"> & {
    action: "edit" | "delete" | "save" | "copy" | "share" | "download" | "upload"
    variant?: "default" | "muted" | "primary" | "destructive"
  }
>(({ action, variant = "default", ...props }, ref) => {
  const actionVariant = action === "delete" ? "destructive" : variant

  return (
    <Icon
      ref={ref}
      name={action}
      variant={actionVariant}
      {...props}
    />
  )
})
ActionIcon.displayName = "ActionIcon"

export { Icon, StatusIcon, SEOToolIcon, ActionIcon, iconVariants }