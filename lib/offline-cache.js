export async function saveOffline(key, data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getOffline(key) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}
