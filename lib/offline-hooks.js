// /lib/offline-hooks.js
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  initDB,
  getAll,
  getById,
  save,
  remove,
  addToSyncQueue,
  markAsSynced,
  bulkSave,
} from "./offline-db";
import { syncManager } from "./sync-manager";

/**
 * useOnline - returns boolean online status and a forceSync function.
 */
export function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const unsub = syncManager.addListener((isOnline) => {
      setOnline(isOnline);
    });

    // initial
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    return () => unsub();
  }, []);

  const forceSync = useCallback(() => {
    syncManager.sync();
  }, []);

  return { online, forceSync };
}

/**
 * useOfflineResource(storeName)
 * - list: local items (from indexeddb)
 * - refreshFromServer() -> tries to fetch /api/{storeName} and bulkSave
 * - create/update/delete: will perform online fetch if navigator.onLine,
 *   otherwise save locally + queue action for sync manager
 */
export function useOfflineResource(storeName) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { online, forceSync } = useOnline();

  useEffect(() => {
    let mounted = true;
    async function load() {
      await initDB();
      const local = await getAll(storeName);
      if (!mounted) return;
      setItems(local || []);
      setLoading(false);
    }
    load();
    return () => (mounted = false);
  }, [storeName]);

  // refresh from server and put in local DB
  const refreshFromServer = useCallback(async () => {
    try {
      const res = await fetch(`/api/${storeName}`);
      if (!res.ok) return null;
      const json = await res.json();
      // server may return { data } or array — handle both
      const data = Array.isArray(json) ? json : json.data || json;
      if (Array.isArray(data)) {
        await bulkSave(storeName, data);
        setItems(data);
        return data;
      }
      return null;
    } catch (err) {
      console.warn("refreshFromServer error", err);
      return null;
    }
  }, [storeName]);

  // CREATE or UPDATE helper
  const saveItem = useCallback(
    async (item, opts = {}) => {
      // items created offline should have _id
      const isUpdate = !!item._id;
      // If online -> direct API
      if (online) {
        try {
          const method = isUpdate ? "PUT" : "POST";
          const url = isUpdate
            ? `/api/${storeName}/${item._id}`
            : `/api/${storeName}`;
          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
          const json = await res.json();
          // push to local DB as synced copy
          const saved = json?.data || json || item;
          await save(storeName, saved);
          setItems((prev) => {
            const filtered = prev.filter((p) => p._id !== saved._id);
            return [saved, ...filtered];
          });
          return saved;
        } catch (err) {
          // fallback to offline behaviour
          console.warn("online save failed, switching to offline queue", err);
        }
      }

      // OFFLINE: save locally and queue
      const local = await save(storeName, item);
      const action = isUpdate ? "update" : "create";
      await addToSyncQueue(action, storeName, local);
      setItems((prev) => {
        const filtered = prev.filter((p) => p._id !== local._id);
        return [local, ...filtered];
      });
      return local;
    },
    [online, storeName]
  );

  const deleteItem = useCallback(
    async (id) => {
      if (online) {
        try {
          const res = await fetch(`/api/${storeName}/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("delete failed");
          await remove(storeName, id); // remove local copy too
          setItems((prev) => prev.filter((p) => p._id !== id));
          return true;
        } catch (err) {
          console.warn("online delete failed, queueing", err);
        }
      }

      // offline queue delete
      // mark delete in syncQueue; actual deletion from local store is safe to do now
      await addToSyncQueue("delete", storeName, { _id: id });
      await remove(storeName, id);
      setItems((prev) => prev.filter((p) => p._id !== id));
      return true;
    },
    [online, storeName]
  );

  // manual reload from indexedDB
  const reloadLocal = useCallback(async () => {
    const local = await getAll(storeName);
    setItems(local || []);
    return local;
  }, [storeName]);

  return {
    items,
    loading,
    online,
    refreshFromServer,
    saveItem,
    deleteItem,
    reloadLocal,
    forceSync,
  };
}
