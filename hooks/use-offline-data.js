"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import * as offlineDB from "@/lib/offline-db"
import { useOnlineStatus } from "./use-online-status"

export function useOfflineData(storeName, apiEndpoint) {
  const isOnline = useOnlineStatus()
  const [localData, setLocalData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetcher = async (url) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch")
    return response.json()
  }

  const {
    data: serverData,
    error,
    mutate,
  } = useSWR(isOnline ? apiEndpoint : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadLocalData = async () => {
      try {
        await offlineDB.initDB()
        const data = await offlineDB.getAll(storeName)
        setLocalData(data)
      } catch (err) {
        console.error("Error loading local data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadLocalData()
  }, [storeName])

  // Sync server data to IndexedDB when online
  useEffect(() => {
    if (serverData && Array.isArray(serverData)) {
      offlineDB.bulkSave(storeName, serverData)
      setLocalData(serverData)
    }
  }, [serverData, storeName])

  const data = isOnline && serverData ? serverData : localData

  const create = useCallback(
    async (item) => {
      const savedItem = await offlineDB.save(storeName, item)

      if (isOnline) {
        try {
          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          })

          if (response.ok) {
            const newItem = await response.json()
            await offlineDB.markAsSynced(storeName, savedItem._id)
            mutate()
            return newItem
          }
        } catch (err) {
          console.error("Error creating item:", err)
          await offlineDB.addToSyncQueue("create", storeName, savedItem)
        }
      } else {
        await offlineDB.addToSyncQueue("create", storeName, savedItem)
      }

      setLocalData((prev) => [...prev, savedItem])
      return savedItem
    },
    [storeName, apiEndpoint, isOnline, mutate],
  )

  const update = useCallback(
    async (id, updates) => {
      const existingItem = await offlineDB.getById(storeName, id)
      const updatedItem = { ...existingItem, ...updates, _id: id }
      await offlineDB.save(storeName, updatedItem)

      if (isOnline) {
        try {
          const response = await fetch(`${apiEndpoint}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })

          if (response.ok) {
            await offlineDB.markAsSynced(storeName, id)
            mutate()
            return await response.json()
          }
        } catch (err) {
          console.error("Error updating item:", err)
          await offlineDB.addToSyncQueue("update", storeName, updatedItem)
        }
      } else {
        await offlineDB.addToSyncQueue("update", storeName, updatedItem)
      }

      setLocalData((prev) => prev.map((item) => (item._id === id ? updatedItem : item)))
      return updatedItem
    },
    [storeName, apiEndpoint, isOnline, mutate],
  )

  const remove = useCallback(
    async (id) => {
      await offlineDB.remove(storeName, id)

      if (isOnline) {
        try {
          await fetch(`${apiEndpoint}/${id}`, { method: "DELETE" })
          mutate()
        } catch (err) {
          console.error("Error deleting item:", err)
          await offlineDB.addToSyncQueue("delete", storeName, { _id: id })
        }
      } else {
        await offlineDB.addToSyncQueue("delete", storeName, { _id: id })
      }

      setLocalData((prev) => prev.filter((item) => item._id !== id))
    },
    [storeName, apiEndpoint, isOnline, mutate],
  )

  const refresh = useCallback(() => {
    if (isOnline) {
      mutate()
    }
  }, [isOnline, mutate])

  return {
    data,
    isLoading: isLoading || (!serverData && isOnline && !error),
    error,
    isOnline,
    create,
    update,
    remove,
    refresh,
  }
}
