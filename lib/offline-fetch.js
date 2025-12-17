// lib/offline-fetch.js
import { addToSyncQueue, save } from "./offline-db";

/**
 * offlineFetch(endpoint, options, storeName)
 * - endpoint: full or relative URL (e.g. /api/students)
 * - options: fetch options (method, headers, body)
 * - storeName: the store to persist item when offline (e.g. "students")
 *
 * Returns server response JSON when online; if offline or network fails returns
 * { queued: true, local: localItem } (202) and queues operation for background sync.
 */
export async function offlineFetch(
  endpoint,
  options = {},
  storeName = null,
  localItem = null
) {
  const method = (options.method || "GET").toUpperCase();
  try {
    const res = await fetch(endpoint, options);
    if (res.ok) {
      const json = await res.json().catch(() => null);
      return json || { ok: true };
    }

    // if server returned error (500s), treat as offline queue candidate
    throw new Error("network or server error");
  } catch (err) {
    // prepare body to send to queue
    let body = null;
    try {
      if (options.body) {
        body =
          typeof options.body === "string"
            ? JSON.parse(options.body)
            : options.body;
      }
    } catch (e) {
      body = options.body || null;
    }

    // If storeName provided, save locally (so UI sees the entity)
    let saved = localItem;
    if (storeName && body) {
      // create a local copy with _id if missing
      const item = {
        ...(body || {}),
        _id: (body && body._id) || Date.now().toString(36),
      };
      saved = await save(storeName, item);
    }

    // Inform service worker (if controlled)
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "ADD_TO_QUEUE",
          payload: { url: endpoint, method, body: body || saved || null },
        });
      } else {
        // if no SW, fallback: add to sync queue directly (requires offline-db import)
        await addToSyncQueue(
          method.toLowerCase(),
          storeName || endpoint.split("/").pop(),
          body || saved || {}
        );
      }
    } catch (e) {
      // swallow errors
      console.warn("failed to post message to SW", e);
      await addToSyncQueue(
        method.toLowerCase(),
        storeName || endpoint.split("/").pop(),
        body || saved || {}
      );
    }

    // try to register sync
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.sync) await reg.sync.register("edumanage-sync");
    } catch (e) {
      // ignore
    }

    return { queued: true, local: saved || null };
  }
}
