import {
  // Navigation & UI
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Settings,
  User,
  Search,
  Filter,
  MoreHorizontal,
  MoreVertical,
  
  // Status & Feedback
  Check,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
  RefreshCw,
  
  // SEO Tools Icons
  FileText,
  Image,
  Link,
  Globe,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Sparkles,
  Brain,
  Eye,
  EyeOff,
  
  // Content & Media
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  Hash,
  Quote,
  Code,
  FileImage,
  Download,
  Upload,
  Copy,
  Clipboard,
  
  // Actions
  Play,
  Pause,
  Stop,
  Edit,
  Trash2,
  Save,
  Share,
  ExternalLink,
  Plus,
  Minus,
  
  // Social & Communication
  Mail,
  MessageCircle,
  Phone,
  Share2,
  
  // Technology
  Cpu,
  Database,
  Server,
  Cloud,
  Wifi,
  Smartphone,
  Monitor,
  Tablet,
  
  // Business
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  
  // Miscellaneous
  Star,
  Heart,
  Bookmark,
  Flag,
  Award,
  Shield,
  Lock,
  Unlock,
  Key,
  
  type LucideIcon,
} from "lucide-react"

// Icon size configurations
export const iconSizes = {
  xs: "h-3 w-3", // 12px
  sm: "h-4 w-4", // 16px
  md: "h-5 w-5", // 20px
  lg: "h-6 w-6", // 24px
  xl: "h-8 w-8", // 32px
  "2xl": "h-10 w-10", // 40px
} as const

export type IconSize = keyof typeof iconSizes

// SEO Tools specific icons mapping
export const seoToolIcons = {
  // Content Tools
  "optimizador-contenido": FileText,
  "generar-titulo-seo": Type,
  "detector-contenido-duplicado": Copy,
  "generador-meta-descripcion": AlignLeft,
  
  // Image Tools
  "renombrador-imagenes": Image,
  "compresor-imagenes": FileImage,
  "optimizador-imagenes": Sparkles,
  
  // Analysis Tools
  "auditor-seo": BarChart3,
  "scraper-keywords": Target,
  "analizador-competencia": TrendingUp,
  "generador-sitemap": Globe,
  
  // Technical Tools
  "verificador-enlaces": Link,
  "analizador-velocidad": Zap,
  "monitor-posiciones": Eye,
  "generador-robots": Code,
} as const

// Status icons with semantic meaning
export const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  loading: Loader2,
  pending: Clock,
} as const

// Navigation icons
export const navigationIcons = {
  home: Home,
  menu: Menu,
  close: X,
  back: ArrowLeft,
  forward: ArrowRight,
  up: ArrowUp,
  down: ArrowDown,
  settings: Settings,
  user: User,
  search: Search,
} as const

// Action icons
export const actionIcons = {
  edit: Edit,
  delete: Trash2,
  save: Save,
  copy: Copy,
  share: Share,
  download: Download,
  upload: Upload,
  play: Play,
  pause: Pause,
  stop: Stop,
  refresh: RefreshCw,
  external: ExternalLink,
  plus: Plus,
  minus: Minus,
} as const

// Content icons
export const contentIcons = {
  text: FileText,
  image: Image,
  code: Code,
  link: Link,
  list: List,
  quote: Quote,
  bold: Bold,
  italic: Italic,
  underline: Underline,
} as const

// Business icons
export const businessIcons = {
  analytics: BarChart3,
  chart: PieChart,
  trending: TrendingUp,
  target: Target,
  activity: Activity,
  calendar: Calendar,
  clock: Clock,
  dollar: DollarSign,
  cart: ShoppingCart,
} as const

// Technology icons
export const technologyIcons = {
  cpu: Cpu,
  database: Database,
  server: Server,
  cloud: Cloud,
  wifi: Wifi,
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
  brain: Brain,
  zap: Zap,
  sparkles: Sparkles,
} as const

// Helper function to get icon component
export function getIcon(iconName: string): LucideIcon {
  // Check SEO tools first
  if (iconName in seoToolIcons) {
    return seoToolIcons[iconName as keyof typeof seoToolIcons]
  }
  
  // Check status icons
  if (iconName in statusIcons) {
    return statusIcons[iconName as keyof typeof statusIcons]
  }
  
  // Check navigation icons
  if (iconName in navigationIcons) {
    return navigationIcons[iconName as keyof typeof navigationIcons]
  }
  
  // Check action icons
  if (iconName in actionIcons) {
    return actionIcons[iconName as keyof typeof actionIcons]
  }
  
  // Check content icons
  if (iconName in contentIcons) {
    return contentIcons[iconName as keyof typeof contentIcons]
  }
  
  // Check business icons
  if (iconName in businessIcons) {
    return businessIcons[iconName as keyof typeof businessIcons]
  }
  
  // Check technology icons
  if (iconName in technologyIcons) {
    return technologyIcons[iconName as keyof typeof technologyIcons]
  }
  
  // Default fallback
  return Info
}

// Helper function to get icon size class
export function getIconSize(size: IconSize): string {
  return iconSizes[size]
}

// Export all icon categories for easy access
export {
  // Navigation & UI
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Settings,
  User,
  Search,
  Filter,
  MoreHorizontal,
  MoreVertical,
  
  // Status & Feedback
  Check,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
  RefreshCw,
  
  // SEO Tools Icons
  FileText,
  Image,
  Link,
  Globe,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Sparkles,
  Brain,
  Eye,
  EyeOff,
  
  // Content & Media
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  Hash,
  Quote,
  Code,
  FileImage,
  Download,
  Upload,
  Copy,
  Clipboard,
  
  // Actions
  Play,
  Pause,
  Stop,
  Edit,
  Trash2,
  Save,
  Share,
  ExternalLink,
  Plus,
  Minus,
  
  // Social & Communication
  Mail,
  MessageCircle,
  Phone,
  Share2,
  
  // Technology
  Cpu,
  Database,
  Server,
  Cloud,
  Wifi,
  Smartphone,
  Monitor,
  Tablet,
  
  // Business
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  
  // Miscellaneous
  Star,
  Heart,
  Bookmark,
  Flag,
  Award,
  Shield,
  Lock,
  Unlock,
  Key,
}