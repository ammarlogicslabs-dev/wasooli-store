import { useEffect, useState } from "react";
import {
  getSettings,
  STORAGE_KEYS,
  fetchPublicSettings,
} from "../services/storage/adminDataService";

export function useStoreSettings() {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    // 1. Fetch public settings on mount
    fetchPublicSettings()
      .then((s) => {
        if (s) setSettings(s);
      })
      .catch(() => {});

    // 2. Listen to custom event when admin updates settings
    const handleDataEvent = (e) => {
      if (!e?.detail?.key || e.detail.key === STORAGE_KEYS.settings) {
        setSettings(getSettings());
      }
    };

    // 3. Listen to cross-tab storage changes
    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEYS.settings) {
        setSettings(getSettings());
      }
    };

    window.addEventListener("wasooli-data", handleDataEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("wasooli-data", handleDataEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  return settings;
}

export default useStoreSettings;

