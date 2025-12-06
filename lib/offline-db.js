"use client"

const DB_NAME = "SchoolManagementDB"
const DB_VERSION = 1

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
  "syncQueue",
]

let db = null

export async function initDB() {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      STORES.forEach((storeName) => {
        if (!database.objectStoreNames.contains(storeName)) {
          const store = database.createObjectStore(storeName, { keyPath: "_id" })
          store.createIndex("synced", "synced", { unique: false })
          store.createIndex("updatedAt", "updatedAt", { unique: false })
        }
      })
    }
  })
}

export async function getAll(storeName) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getById(storeName, id) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function save(storeName, data) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)

    const item = {
      ...data,
      _id: data._id || generateId(),
      synced: false,
      updatedAt: new Date().toISOString(),
    }

    const request = store.put(item)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(item)
  })
}

export async function remove(storeName, id) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(true)
  })
}

export async function addToSyncQueue(action, storeName, data) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("syncQueue", "readwrite")
    const store = transaction.objectStore("syncQueue")

    const item = {
      _id: generateId(),
      action,
      storeName,
      data,
      createdAt: new Date().toISOString(),
    }

    const request = store.add(item)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(item)
  })
}

export async function getSyncQueue() {
  return getAll("syncQueue")
}

export async function clearSyncQueue() {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("syncQueue", "readwrite")
    const store = transaction.objectStore("syncQueue")
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(true)
  })
}

export async function markAsSynced(storeName, id) {
  const database = await initDB()
  return new Promise(async (resolve, reject) => {
    const item = await getById(storeName, id)
    if (!item) return resolve(null)

    const transaction = database.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)

    item.synced = true
    const request = store.put(item)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(item)
  })
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function bulkSave(storeName, items) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)

    items.forEach((item) => {
      store.put({
        ...item,
        synced: true,
        updatedAt: item.updatedAt || new Date().toISOString(),
      })
    })

    transaction.oncomplete = () => resolve(true)
    transaction.onerror = () => reject(transaction.error)
  })
}
