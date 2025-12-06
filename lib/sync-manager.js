"use client"

import { getSyncQueue, clearSyncQueue, markAsSynced, bulkSave } from "./offline-db"

class SyncManager {
  constructor() {
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true
    this.isSyncing = false
    this.listeners = []

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline())
      window.addEventListener("offline", () => this.handleOffline())
    }
  }

  handleOnline() {
    this.isOnline = true
    this.notifyListeners()
    this.sync()
  }

  handleOffline() {
    this.isOnline = false
    this.notifyListeners()
  }

  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.isOnline))
  }

  async sync() {
    if (!this.isOnline || this.isSyncing) return

    this.isSyncing = true

    try {
      const queue = await getSyncQueue()

      for (const item of queue) {
        try {
          const endpoint = `/api/${item.storeName}`
          let response

          switch (item.action) {
            case "create":
              response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item.data),
              })
              break

            case "update":
              response = await fetch(`${endpoint}/${item.data._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item.data),
              })
              break

            case "delete":
              response = await fetch(`${endpoint}/${item.data._id}`, {
                method: "DELETE",
              })
              break
          }

          if (response?.ok && item.action !== "delete") {
            await markAsSynced(item.storeName, item.data._id)
          }
        } catch (error) {
          console.error("Sync error for item:", item, error)
        }
      }

      await clearSyncQueue()
      await this.pullLatestData()
    } catch (error) {
      console.error("Sync error:", error)
    } finally {
      this.isSyncing = false
    }
  }

  async pullLatestData() {
    const stores = [
      "students",
      "teachers",
      "attendance",
      "fees",
      "exams",
      "quizzes",
      "mcqs",
      "assignments",
      "results",
      "classes",
      "subjects",
    ]

    for (const storeName of stores) {
      try {
        const response = await fetch(`/api/${storeName}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            await bulkSave(storeName, data)
          }
        }
      } catch (error) {
        console.error(`Error pulling ${storeName}:`, error)
      }
    }
  }
}

export const syncManager = new SyncManager()
