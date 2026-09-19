import { deserialize, serialize } from './game.js';
const DB = 'solo-card-puzzle';
const STORE = 'saves';
const KEY = 'current';
function openDB() { return new Promise((resolve, reject) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
export async function save(state) { const db = await openDB(); await new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(serialize(state), KEY); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); }); db.close(); }
export async function load() { try {
    const db = await openDB();
    const raw = await new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readonly'); const r = tx.objectStore(STORE).get(KEY); r.onsuccess = () => resolve(typeof r.result === 'string' ? r.result : null); r.onerror = () => reject(r.error); });
    db.close();
    return raw ? deserialize(raw) : null;
}
catch {
    return null;
} }
export async function clear() { try {
    const db = await openDB();
    await new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(KEY); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
    db.close();
}
catch { } }
