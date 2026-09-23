// ============================================================================
// Offline-Warteschlange für Trainings-Einträge (IndexedDB)
// ----------------------------------------------------------------------------
// Ist keine Internetverbindung da (z.B. im Kraftraum ohne Empfang), werden
// Trainings-Logs hier lokal zwischengespeichert und automatisch synchronisiert,
// sobald wieder eine Verbindung besteht. Analog zum Offline-Prinzip der
// TVN-Apps, nur mit IndexedDB statt einer reinen In-Memory-Lösung, weil die
// Einträge auch einen Browser-Neustart überstehen sollen.
// ============================================================================

const DB_NAME = 'dadi-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-training-logs';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueTrainingLog(entry) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).add(entry);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Konnte Eintrag nicht in die Offline-Warteschlange legen:', e);
    return false;
  }
}

export async function getQueuedLogs() {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Offline-Warteschlange konnte nicht gelesen werden:', e);
    return [];
  }
}

export async function removeQueuedLog(localId) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(localId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Eintrag konnte nicht aus der Warteschlange entfernt werden:', e);
    return false;
  }
}

/**
 * Versucht alle wartenden Einträge zu übertragen.
 * insertFn: async (entry) => { error } – die eigentliche Supabase-Insert-Funktion.
 * Gibt die Anzahl erfolgreich synchronisierter Einträge zurück.
 */
export async function syncQueuedLogs(insertFn) {
  if (!navigator.onLine) return 0;

  const queued = await getQueuedLogs();
  let synced = 0;

  for (const entry of queued) {
    const { localId, ...payload } = entry;
    try {
      const { error } = await insertFn(payload);
      if (!error) {
        await removeQueuedLog(localId);
        synced++;
      }
    } catch (e) {
      // Netzwerkfehler o.ä. – Eintrag bleibt in der Warteschlange, nächster Versuch später
      break;
    }
  }
  return synced;
}
