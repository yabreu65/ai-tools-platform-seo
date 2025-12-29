import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        
        // Status variants with icons
        success:
          "border-success-200 bg-success-50 text-success-800 dark:border-success-800 dark:bg-success-950/30 dark:text-success-300 [&>svg]:text-success-600 dark:[&>svg]:text-success-400",
        warning:
          "border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-800 dark:bg-warning-950/30 dark:text-warning-300 [&>svg]:text-warning-600 dark:[&>svg]:text-warning-400",
        error:
          "border-error-200 bg-error-50 text-error-800 dark:border-error-800 dark:bg-error-950/30 dark:text-error-300 [&>svg]:text-error-600 dark:[&>svg]:text-error-400",
        info:
          "border-tech-blue-200 bg-tech-blue-50 text-tech-blue-800 dark:border-tech-blue-800 dark:bg-tech-blue-950/30 dark:text-tech-blue-300 [&>svg]:text-tech-blue-600 dark:[&>svg]:text-tech-blue-400",
        
        // AI Tools Platform variants
        "tech-blue":
          "border-tech-blue-200 bg-tech-blue-50 text-tech-blue-800 dark:border-tech-blue-800 dark:bg-tech-blue-950/30 dark:text-tech-blue-300 [&>svg]:text-tech-blue-600 dark:[&>svg]:text-tech-blue-400",
        "ai-purple":
          "border-ai-purple-200 bg-ai-purple-50 text-ai-purple-800 dark:border-ai-purple-800 dark:bg-ai-purple-950/30 dark:text-ai-purple-300 [&>svg]:text-ai-purple-600 dark:[&>svg]:text-ai-purple-400",
        "seo-teal":
          "border-seo-teal-200 bg-seo-teal-50 text-seo-teal-800 dark:border-seo-teal-800 dark:bg-seo-teal-950/30 dark:text-seo-teal-300 [&>svg]:text-seo-teal-600 dark:[&>svg]:text-seo-teal-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
  VariantProps<typeof alertVariants> & {
    dismissible?: boolean
    onDismiss?: () => void
  }
>(({ className, variant, dismissible, onDismiss, children, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  // Auto-select icon based on variant
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
      case "destructive":
        return <AlertCircle className="h-4 w-4" />
      case "info":
      case "tech-blue":
      case "ai-purple":
      case "seo-teal":
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {getIcon()}
      <div className="flex-1">
        {children}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>
      )}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }