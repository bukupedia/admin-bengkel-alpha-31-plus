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
