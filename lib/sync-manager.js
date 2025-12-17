"use client";

import {
  getSyncQueue,
  clearSyncQueue,
  markAsSynced,
  bulkSave,
  addToSyncQueue,
} from "./offline-db";

class SyncManager {
  constructor() {
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    this.isSyncing = false;
    this.listeners = [];

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());
    }
  }

  handleOnline() {
    this.isOnline = true;
    this.notifyListeners();
    this.sync();
  }

  handleOffline() {
    this.isOnline = false;
    this.notifyListeners();
  }

  addListener(cb) {
    this.listeners.push(cb);
    return () => (this.listeners = this.listeners.filter((x) => x !== cb));
  }

  notifyListeners() {
    this.listeners.forEach((cb) => cb(this.isOnline));
  }

  async sync() {
    if (!this.isOnline || this.isSyncing) return;

    this.isSyncing = true;

    try {
      const queue = await getSyncQueue();

      for (const item of queue) {
        try {
          const endpoint = `/api/${item.storeName}`;
          let response;

          if (item.action === "create") {
            response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });
          }

          if (item.action === "update") {
            response = await fetch(`${endpoint}/${item.data._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });
          }

          if (item.action === "delete") {
            response = await fetch(`${endpoint}/${item.data._id}`, {
              method: "DELETE",
            });
          }

          if (response?.ok && item.action !== "delete") {
            await markAsSynced(item.storeName, item.data._id);
          }
        } catch (err) {
          console.error("Sync item failed:", err);
        }
      }

      await clearSyncQueue();
      await this.pullLatestData();
    } finally {
      this.isSyncing = false;
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
    ];

    for (const name of stores) {
      try {
        const res = await fetch(`/api/${name}`);
        if (!res.ok) continue;

        const json = await res.json();
        const data = Array.isArray(json) ? json : json.data;

        if (Array.isArray(data)) {
          await bulkSave(name, data);
        }
      } catch (err) {
        console.error(`Pull failed for ${name}`, err);
      }
    }
  }
}

export const syncManager = new SyncManager();

// Receive events from SW
if (typeof window !== "undefined" && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    const { type, payload } = event.data;
    if (!type) return;

    if (type === "ADD_TO_QUEUE") {
      const storeName = payload.url.split("/api/")[1].split("/")[0];

      const map = { post: "create", put: "update", delete: "delete" };
      const action = map[payload.method.toLowerCase()];

      addToSyncQueue(action, storeName, payload.body);
    }

    if (type === "RUN_SYNC") {
      syncManager.sync();
    }
  });
}
