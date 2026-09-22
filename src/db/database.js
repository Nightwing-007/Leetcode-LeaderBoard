// Single Database Service for Sri Eshwar College of Engineering Leaderboard
// Built on IndexedDB with auto-sync and API fallback

const DB_NAME = 'SECE_Leaderboard_SingleDB';
const DB_VERSION = 1;
const STORE_NAME = 'students';

let dbInstance = null;

export function initDatabase() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'rollNo' });
        store.createIndex('department', 'department', { unique: false });
        store.createIndex('batch', 'batch', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB Error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Retrieves all student records from the single DB.
 */
export async function dbGetAllStudents() {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Replaces/Updates records in the single DB when Excel data is uploaded.
 */
export async function dbReplaceAllStudents(studentsArray) {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear existing store to store strictly the latest dataset
    store.clear();

    studentsArray.forEach(student => {
      store.put(student);
    });

    tx.oncomplete = () => resolve(studentsArray);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Upserts array of students into the single DB.
 */
export async function dbUpsertStudents(studentsArray) {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    studentsArray.forEach(student => {
      store.put(student);
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Insert or update a single student record in the DB.
 */
export async function dbSaveStudent(student) {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(student);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete a student from the single DB by rollNo.
 */
export async function dbDeleteStudent(rollNo) {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(rollNo);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clears the single DB.
 */
export async function dbClearAll() {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}
