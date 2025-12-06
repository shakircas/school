"use client"

import { useState, useEffect, useCallback } from "react"
import { initDB, getAll, save, remove, addToSyncQueue } from "@/lib/offline-db"
import { syncData } from "@/lib/sync-manager"
import { toast } from "sonner"

export function useOffline(storeName) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      toast.success("Back online! Syncing data...")
      handleSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning("You are offline. Changes will be saved locally.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [storeName])

  const loadData = async () => {
    setIsLoading(true)
    try {
      await initDB()
      const localData = await getAll(storeName)
      setData(localData)
    } catch (error) {
      console.error("Failed to load offline data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveItem = useCallback(
    async (item) => {
      try {
        const savedItem = await save(storeName, item)
        await addToSyncQueue("save", storeName, savedItem)
        setData((prev) => {
          const index = prev.findIndex((i) => i._id === savedItem._id)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = savedItem
            return updated
          }
          return [...prev, savedItem]
        })
        return savedItem
      } catch (error) {
        console.error("Failed to save item:", error)
        throw error
      }
    },
    [storeName],
  )

  const removeItem = useCallback(
    async (id) => {
      try {
        await remove(storeName, id)
        await addToSyncQueue("delete", storeName, { _id: id })
        setData((prev) => prev.filter((item) => item._id !== id))
      } catch (error) {
        console.error("Failed to remove item:", error)
        throw error
      }
    },
    [storeName],
  )

  const handleSync = useCallback(async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      await syncData()
      await loadData()
      toast.success("Data synced successfully!")
    } catch (error) {
      console.error("Sync failed:", error)
      toast.error("Sync failed. Will retry later.")
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, storeName])

  return {
    data,
    isLoading,
    isOnline,
    isSyncing,
    saveItem,
    removeItem,
    refresh: loadData,
    sync: handleSync,
  }
}
