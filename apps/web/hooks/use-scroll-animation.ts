import { useEffect, useRef } from "react"
import { useInView, useAnimation } from "framer-motion"

interface UseScrollAnimationOptions {
  threshold?: number
  triggerOnce?: boolean
  delay?: number
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, triggerOnce = true, delay = 0 } = options
  
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    threshold,
    once: triggerOnce 
  })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        controls.start("animate")
      }, delay * 1000)
      
      return () => clearTimeout(timer)
    } else {
      controls.start("initial")
    }
  }, [isInView, controls, delay])

  return { ref, controls, isInView }
}

export function useStaggeredScrollAnimation(itemCount: number, options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, triggerOnce = true, delay = 0 } = options
  
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    threshold,
    once: triggerOnce 
  })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        controls.start("animate")
      }, delay * 1000)
      
      return () => clearTimeout(timer)
    } else {
      controls.start("initial")
    }
  }, [isInView, controls, delay])

  const staggerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return { 
    ref, 
    controls, 
    isInView, 
    staggerVariants, 
    itemVariants 
  }
}