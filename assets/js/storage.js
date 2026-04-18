// assets/js/storage.js

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

// ======================
// EXPORT ALL DATA
// ======================
export function exportAllData() {
  const keys = [
    "customers",
    "servis",
    "parts",
    "shop_settings",
    "service_statuses",
    "categories",
    "vehicle_brands",
    "activity_log"
  ];
  
  const exportData = {};
  keys.forEach(key => {
    exportData[key] = getData(key);
  });
  
  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    data: exportData
  };
}

// ======================
// IMPORT ALL DATA
// ======================
export function importAllData(importedData) {
  if (!importedData || !importedData.data) {
    throw new Error("Format data tidak valid");
  }
  
  const keys = Object.keys(importedData.data);
  keys.forEach(key => {
    saveData(key, importedData.data[key]);
  });
}
