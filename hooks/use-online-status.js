"use client"

import { useState, useEffect } from "react"
import { syncManager } from "@/lib/sync-manager"

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const unsubscribe = syncManager.addListener((online) => {
      setIsOnline(online)
    })

    return unsubscribe
  }, [])

  return isOnline
}
