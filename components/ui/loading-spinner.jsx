import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function LoadingSpinner({ className, size = "default" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
