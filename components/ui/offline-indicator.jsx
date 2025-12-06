"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { syncData } from "@/lib/sync-manager"
import { toast } from "sonner"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      await syncData()
      toast.success("Data synced successfully!")
    } catch (error) {
      toast.error("Sync failed")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
          <Wifi className="h-3 w-3" />
          Online
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1 text-orange-600 border-orange-600">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      )}
      {isOnline && (
        <Button variant="ghost" size="icon" onClick={handleSync} disabled={isSyncing} className="h-8 w-8">
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  )
}
