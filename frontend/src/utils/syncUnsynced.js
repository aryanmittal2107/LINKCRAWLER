// src/utils/syncUnsynced.js
import { createLink } from '../api';

// This function tries to push any locally-saved (offline) links
// to the backend once the user logs in.
export async function syncUnsynced() {
  const unsynced = JSON.parse(localStorage.getItem('unsynced_links') || '[]');
  if (!unsynced.length) return { synced: 0 };

  let synced = 0;

  for (const item of [...unsynced]) {
    try {
      await createLink(item);
      synced++;

      // Remove the synced link from local storage
      const current = JSON.parse(localStorage.getItem('unsynced_links') || '[]');
      current.shift();
      localStorage.setItem('unsynced_links', JSON.stringify(current));
    } catch (err) {
      if (err && err.status === 401) {
        console.warn('Sync stopped: authentication required.');
        break;
      }
      console.warn('Sync failed, will retry later:', err);
      break;
    }
  }

  return { synced };
}
