import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { cardHover, fadeInUp, scaleIn } from "@/lib/animations"

const animatedCardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-border hover:shadow-md",
        elevated: "shadow-lg hover:shadow-xl border-border/50",
        "tech-blue": 
          "border-tech-blue-200 dark:border-tech-blue-800 bg-tech-blue-50/50 dark:bg-tech-blue-950/50 hover:shadow-md hover:shadow-tech-blue-200/20",
        "ai-purple": 
          "border-ai-purple-200 dark:border-ai-purple-800 bg-ai-purple-50/50 dark:bg-ai-purple-950/50 hover:shadow-md hover:shadow-ai-purple-200/20",
        "seo-teal": 
          "border-seo-teal-200 dark:border-seo-teal-800 bg-seo-teal-50/50 dark:bg-seo-teal-950/50 hover:shadow-md hover:shadow-seo-teal-200/20",
        success: 
          "border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-950/50 hover:shadow-md hover:shadow-success-200/20",
        warning: 
          "border-warning-200 dark:border-warning-800 bg-warning-50/50 dark:bg-warning-950/50 hover:shadow-md hover:shadow-warning-200/20",
        error: 
          "border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-950/50 hover:shadow-md hover:shadow-error-200/20",
        gradient: 
          "border-0 bg-gradient-to-br from-tech-blue-50 to-ai-purple-50 dark:from-tech-blue-950 dark:to-ai-purple-950 shadow-lg hover:shadow-xl",
      },
      animation: {
        none: "",
        hover: "",
        fadeIn: "",
        scaleIn: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animation: "hover",
    },
  }
)

export interface AnimatedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedCardVariants> {
  delay?: number
  clickable?: boolean
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant, animation, delay = 0, clickable = false, children, ...props }, ref) => {
    const getAnimationVariants = () => {
      switch (animation) {
        case "fadeIn":
          return fadeInUp
        case "scaleIn":
          return scaleIn
        case "hover":
          return cardHover
        default:
          return cardHover
      }
    }

    const getInitialProps = () => {
      if (animation === "fadeIn" || animation === "scaleIn") {
        return {
          initial: "initial",
          animate: "animate",
          transition: { delay },
        }
      }
      return {
        initial: "initial",
        whileHover: "hover",
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          animatedCardVariants({ variant, animation }),
          clickable && "hover:cursor-pointer",
          className
        )}
        variants={getAnimationVariants()}
        {...getInitialProps()}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

const AnimatedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
AnimatedCardHeader.displayName = "AnimatedCardHeader"

const AnimatedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.3 }}
    {...props}
  />
))
AnimatedCardTitle.displayName = "AnimatedCardTitle"

const AnimatedCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.3 }}
    {...props}
  />
))
AnimatedCardDescription.displayName = "AnimatedCardDescription"

const AnimatedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3, duration: 0.3 }}
    {...props}
  />
))
AnimatedCardContent.displayName = "AnimatedCardContent"

const AnimatedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.3 }}
    {...props}
  />
))
AnimatedCardFooter.displayName = "AnimatedCardFooter"

export { 
  AnimatedCard, 
  AnimatedCardHeader, 
  AnimatedCardFooter, 
  AnimatedCardTitle, 
  AnimatedCardDescription, 
  AnimatedCardContent,
  animatedCardVariants 
}