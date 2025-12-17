// offline-db.js — Fully rewritten, bulletproof IndexedDB helper
"use client";

const DB_NAME = "SchoolManagementDB";
const DB_VERSION = 3; // bump when stores change

const STORES = [
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
  "timetable",
  "syncQueue",
];

let db = null;

/* ---------------- Helpers ---------------- */
function generateId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
  } catch (e) {}
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function transactionPromise(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
    tx.onerror = () => reject(tx.error || new Error("Transaction error"));
  });
}

function ensureStoreExists(database, storeName) {
  if (!database.objectStoreNames.contains(storeName)) {
    throw new Error(
      `IndexedDB store "${storeName}" does not exist. Available stores: ${Array.from(
        database.objectStoreNames
      ).join(", ")}`
    );
  }
}

/* ---------------- Init & Upgrade ---------------- */
export async function initDB({ onUpgrade } = {}) {
  if (db) return db;

  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onerror = () => reject(req.error);
      req.onblocked = () =>
        console.warn("IndexedDB upgrade blocked by another tab");

      req.onupgradeneeded = (event) => {
        const database = event.target.result;
        for (const name of STORES) {
          if (!database.objectStoreNames.contains(name)) {
            const store = database.createObjectStore(name, { keyPath: "_id" });
            try {
              store.createIndex("synced", "synced", { unique: false });
              store.createIndex("updatedAt", "updatedAt", { unique: false });
            } catch (e) {
              console.warn("Index creation warning", e);
            }
          }
        }

        if (typeof onUpgrade === "function") {
          try {
            onUpgrade(event, database);
          } catch (e) {
            console.error("onUpgrade hook failed", e);
          }
        }
      };

      req.onsuccess = () => {
        db = req.result;
        db.onversionchange = () => {
          console.warn(
            "DB version changed elsewhere — closing local connection."
          );
          db.close();
          db = null;
        };
        resolve(db);
      };
    } catch (err) {
      reject(err);
    }
  });
}

export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

/* ---------------- Basic CRUD ---------------- */
async function getStore(storeName, mode = "readonly") {
  const database = await initDB();
  ensureStoreExists(database, storeName);
  return database.transaction(storeName, mode).objectStore(storeName);
}

export async function getAll(storeName) {
  const store = await getStore(storeName, "readonly");
  const req = store.getAll();
  return requestToPromise(req).then((r) => r || []);
}

export async function getById(storeName, id) {
  if (!id) return null;
  const store = await getStore(storeName, "readonly");
  const req = store.get(id);
  return requestToPromise(req).then((r) => (r === undefined ? null : r));
}

/* ---------------- Save (bulletproof) ---------------- */
export async function save(storeName, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("save expects an object");
  }

  const database = await initDB();
  ensureStoreExists(database, storeName);

  const item = {
    ...data,
    _id: data._id || generateId(),
    synced: data.synced ?? false,
    updatedAt: new Date().toISOString(),
  };

  // final safeguard
  if (!item._id) item._id = generateId();

  const tx = database.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const req = store.put(item);

  try {
    await requestToPromise(req);
    await transactionPromise(tx);
    return item;
  } catch (err) {
    throw new Error(`Failed to save to '${storeName}': ${err?.message || err}`);
  }
}

export async function remove(storeName, id) {
  if (!id) throw new Error("remove requires id");
  const database = await initDB();
  ensureStoreExists(database, storeName);

  const tx = database.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const req = store.delete(id);

  try {
    await requestToPromise(req);
    await transactionPromise(tx);
    return true;
  } catch (err) {
    throw new Error(
      `Failed to delete from '${storeName}': ${err?.message || err}`
    );
  }
}

/* ---------------- Sync Queue ---------------- */
export async function addToSyncQueue(action, storeName, data) {
  if (!action || !storeName)
    throw new Error("addToSyncQueue requires action and storeName");

  const database = await initDB();
  ensureStoreExists(database, "syncQueue");

  const item = {
    _id: generateId(),
    action,
    storeName,
    data,
    createdAt: new Date().toISOString(),
  };

  const tx = database.transaction("syncQueue", "readwrite");
  const store = tx.objectStore("syncQueue");
  const req = store.add(item);

  try {
    await requestToPromise(req);
    await transactionPromise(tx);
    return item;
  } catch (err) {
    throw new Error(`Failed to add to syncQueue: ${err?.message || err}`);
  }
}

export async function getSyncQueue() {
  return getAll("syncQueue");
}

export async function clearSyncQueue() {
  const database = await initDB();
  ensureStoreExists(database, "syncQueue");

  const tx = database.transaction("syncQueue", "readwrite");
  const store = tx.objectStore("syncQueue");
  const req = store.clear();

  try {
    await requestToPromise(req);
    await transactionPromise(tx);
    return true;
  } catch (err) {
    throw new Error(`Failed to clear syncQueue: ${err?.message || err}`);
  }
}

export async function markAsSynced(storeName, id) {
  if (!id) return null;
  const database = await initDB();
  ensureStoreExists(database, storeName);

  const item = await getById(storeName, id);
  if (!item) return null;

  item.synced = true;
  item.updatedAt = new Date().toISOString();

  const tx = database.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const req = store.put(item);

  try {
    await requestToPromise(req);
    await transactionPromise(tx);
    return item;
  } catch (err) {
    throw new Error(
      `Failed to mark as synced in '${storeName}': ${err?.message || err}`
    );
  }
}

/* ---------------- Bulk Save (bulletproof) ---------------- */
export async function bulkSave(storeName, items = []) {
  if (!Array.isArray(items)) throw new Error("bulkSave expects an array");

  const database = await initDB();
  ensureStoreExists(database, storeName);

  const tx = database.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);

  try {
    for (let raw of items) {
      // ensure object
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) raw = {};

      const item = {
        ...raw,
        _id: raw._id || generateId(),
        synced: raw.synced ?? true,
        updatedAt: raw.updatedAt || new Date().toISOString(),
      };

      // final safeguard
      if (!item._id) item._id = generateId();

      store.put(item);
    }

    await transactionPromise(tx);
    return true;
  } catch (err) {
    throw new Error(
      `bulkSave failed for '${storeName}': ${err?.message || err}`
    );
  }
}

/* ---------------- Utilities ---------------- */
export async function clearStore(storeName) {
  const database = await initDB();
  ensureStoreExists(database, storeName);

  const tx = database.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const req = store.clear();

  try {
    await requestToPromise(req);
    await transactionPromise(tx);
    return true;
  } catch (err) {
    throw new Error(
      `Failed to clear store '${storeName}': ${err?.message || err}`
    );
  }
}

export async function deleteDatabase() {
  closeDB();
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
    req.onblocked = () =>
      console.warn("deleteDatabase blocked - close other tabs to continue");
  });
}

/* ---------------- Default Export ---------------- */
export default {
  initDB,
  closeDB,
  getAll,
  getById,
  save,
  remove,
  bulkSave,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  markAsSynced,
  clearStore,
  deleteDatabase,
};
