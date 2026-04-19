// assets/js/storage.js

// Data keys used in the app
export const DATA_KEYS = {
  PELANGGAN: "customers",
  SERVIS: "servis",
  SPAREPART: "sparepart",
  SETTINGS: "app_settings"
};

// Default app settings
const DEFAULT_SETTINGS = {
  adminUsername: "admin",
  adminPassword: "admin123",
  whatsappNumber: ""
};

export function getData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading data from localStorage key "${key}":`, error);
    return [];
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to localStorage key "${key}":`, error);
    alert("Gagal menyimpan data. Kapasitas penyimpanan mungkin penuh.");
    throw error;
  }
}

// Get all data keys in localStorage
export function getAllDataKeys() {
  return Object.values(DATA_KEYS);
}

// Get storage usage information
export function getStorageInfo() {
  let totalSize = 0;
  const dataInfo = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    const size = new Blob([value]).size;
    const itemCount = value ? JSON.parse(value).length : 0;
    
    totalSize += size;
    dataInfo[key] = {
      size: size,
      itemCount: itemCount
    };
  }
  
  return {
    totalSize: totalSize,
    dataInfo: dataInfo
  };
}

// Format bytes to human readable
export function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Export all data as JSON
export function exportAllData() {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    data: {}
  };
  
  // Export all localStorage data (excluding session)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Skip session keys
    if (key !== "admin_session" && key !== "session_fp") {
      try {
        const value = localStorage.getItem(key);
        exportData.data[key] = JSON.parse(value);
      } catch (e) {
        exportData.data[key] = localStorage.getItem(key);
      }
    }
  }
  
  return exportData;
}

// Import data from JSON
export function importData(jsonData) {
  try {
    const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    
    if (!data.data) {
      throw new Error("Format data tidak valid");
    }
    
    let importedCount = 0;
    
    for (const [key, value] of Object.entries(data.data)) {
      // Skip session keys
      if (key !== "admin_session" && key !== "session_fp") {
        localStorage.setItem(key, JSON.stringify(value));
        importedCount++;
      }
    }
    
    return { success: true, count: importedCount };
  } catch (error) {
    console.error("Error importing data:", error);
    return { success: false, message: error.message };
  }
}

// Clear all data (except settings and session)
export function clearAllData() {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Keep session, settings, and app credentials
      if (key !== "admin_session" && key !== "session_fp" && key !== "app_settings" && key !== "admin_credentials") {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return { success: true, count: keysToRemove.length };
  } catch (error) {
    console.error("Error clearing data:", error);
    return { success: false, message: error.message };
  }
}

// Get app settings
export function getSettings() {
  try {
    const settings = localStorage.getItem(DATA_KEYS.SETTINGS);
    if (settings) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(settings) };
    }
    return { ...DEFAULT_SETTINGS };
  } catch (error) {
    console.error("Error reading settings:", error);
    return { ...DEFAULT_SETTINGS };
  }
}

// Save app settings
export function saveSettings(settings) {
  try {
    const currentSettings = getSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(DATA_KEYS.SETTINGS, JSON.stringify(newSettings));
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false, message: error.message };
  }
}

// Get admin credentials
export function getAdminCredentials() {
  try {
    const creds = localStorage.getItem("admin_credentials");
    if (creds) {
      return JSON.parse(creds);
    }
    // Default credentials
    return {
      username: "admin",
      password: "admin123"
    };
  } catch (error) {
    return {
      username: "admin",
      password: "admin123"
    };
  }
}

// Save admin credentials
export function saveAdminCredentials(credentials) {
  try {
    localStorage.setItem("admin_credentials", JSON.stringify(credentials));
    return { success: true };
  } catch (error) {
    console.error("Error saving credentials:", error);
    return { success: false, message: error.message };
  }
}
