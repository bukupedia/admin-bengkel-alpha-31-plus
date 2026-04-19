// assets/js/modules/setting.js

import { getData, saveData } from "../storage.js";

// Keys for data storage
const STORE_INFO_KEY = "storeInfo";

// Application info
const APP_NAME = "Bengkel App";
const APP_VERSION = "1.0.0";
const DEV_NAME = "Arif Budiman";
const DEV_WHATSAPP = "0895332782122";

// Data keys to backup/restore
const DATA_KEYS = [
  "users",
  "servis",
  "pelanggan",
  "parts",
  "storeInfo"
];

// ======================
// TOAST NOTIFICATIONS
// ======================

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const bgClass = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-info"
  }[type] || "bg-info";

  const textClass = type === "warning" ? "text-dark" : "text-white";

  const icon = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  }[type] || "ℹ️";

  const toast = document.createElement("div");
  toast.className = `toast align-items-center ${bgClass} ${textClass} border-0 show`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.style.minWidth = "300px";
  toast.style.marginBottom = "10px";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center">
        <span class="me-2">${icon}</span> ${message}
      </div>
      <button type="button" class="btn-close ${type === "warning" ? "" : "btn-close-white"} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// ======================
// STORE INFO
// ======================

function getStoreInfo() {
  return getData(STORE_INFO_KEY) || {
    name: "",
    phone: "",
    email: "",
    description: ""
  };
}

function saveStoreInfo(info) {
  try {
    saveData(STORE_INFO_KEY, info);
    return true;
  } catch (error) {
    console.error("Error saving store info:", error);
    return false;
  }
}

function loadStoreInfoForm() {
  const info = getStoreInfo();
  document.getElementById("storeName").value = info.name || "";
  document.getElementById("storePhone").value = info.phone || "";
  document.getElementById("storeEmail").value = info.email || "";
  document.getElementById("storeDescription").value = info.description || "";
}

// ======================
// STORAGE INFO
// ======================

function getStorageInfo() {
  let used = 0;
  let total = 5 * 1024 * 1024; // 5MB typical localStorage limit

  // Calculate used space
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length * 2; // 2 bytes per char (UTF-16)
    }
  }

  const available = total - used;

  return {
    total: formatBytes(total),
    used: formatBytes(used),
    available: formatBytes(available),
    usedBytes: used,
    totalBytes: total
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function updateStorageDisplay() {
  const storage = getStorageInfo();
  document.getElementById("totalStorage").textContent = storage.total;
  document.getElementById("usedStorage").textContent = storage.used;
  document.getElementById("availableStorage").textContent = storage.available;
}

// ======================
// BACKUP / EXPORT
// ======================

function exportData() {
  try {
    const data = {};
    DATA_KEYS.forEach(key => {
      data[key] = getData(key);
    });

    // Add export metadata
    data._exportMeta = {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString()
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `bengkel-app-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Data berhasil di-export ke JSON!", "success");
  } catch (error) {
    console.error("Error exporting data:", error);
    showToast("Gagal export data: " + error.message, "error");
  }
}

// ======================
// IMPORT
// ======================

function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);

        // Validate the import file
        if (!data.servis || !data.pelanggan || !data.parts) {
          reject(new Error("Format file tidak valid. File JSON tidak mengandung data yang benar."));
          return;
        }

        // Check for confirmation
        const confirmImport = confirm(
          "Apakah Anda yakin ingin mengimpor data dari file ini?\n\n" +
          "Data SERVIS: " + (data.servis?.length || 0) + " item\n" +
          "Data PELANGGAN: " + (data.pelanggan?.length || 0) + " item\n" +
          "Data SPAREPART: " + (data.parts?.length || 0) + " item\n\n" +
          "PERINGATAN: Data yang ada akan ditimpa dengan data dari file!"
        );

        if (!confirmImport) {
          resolve({ success: false, message: "Import dibatalkan oleh user." });
          return;
        }

        // Import each data key
        DATA_KEYS.forEach(key => {
          if (data[key]) {
            saveData(key, data[key]);
          }
        });

        showToast("Data berhasil di-import!", "success");
        resolve({ success: true });
      } catch (error) {
        console.error("Error importing data:", error);
        reject(error);
      }
    };

    reader.onerror = function() {
      reject(new Error("Gagal membaca file."));
    };

    reader.readAsText(file);
  });
}

// ======================
// LOAD DUMMY DATA
// ======================

async function loadDummyData() {
  try {
    const confirmLoad = confirm(
      "Apakah Anda yakin ingin memuat dummy data?\n\n" +
      "Data yang akan dimuat:\n" +
      "- 2 User (admin, mekanik)\n" +
      "- 5 Pelanggan\n" +
      "- 7 Record Servis\n" +
      "- 15 Sparepart\n" +
      "- Info Toko\n\n" +
      "PERINGATAN: Data yang ada akan ditimpa!"
    );

    if (!confirmLoad) {
      return;
    }

    // Fetch dummy data from file
    const response = await fetch("dummy-data.json");
    if (!response.ok) {
      throw new Error("Gagal memuat file dummy-data.json");
    }

    const data = await response.json();

    // Import each data key
    DATA_KEYS.forEach(key => {
      if (data[key]) {
        saveData(key, data[key]);
      }
    });

    showToast("Dummy data berhasil dimuat!", "success");
    updateStorageDisplay();
    
    // Reload store info form
    loadStoreInfoForm();
  } catch (error) {
    console.error("Error loading dummy data:", error);
    showToast("Gagal memuat dummy data: " + error.message, "error");
  }
}

// ======================
// RESET ALL DATA
// ======================

function resetAllData() {
  try {
    // Clear all data keys
    DATA_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });

    // Also clear any other app data
    const appKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith("_")) {
        try {
          JSON.parse(localStorage.getItem(key));
          appKeys.push(key);
        } catch (e) {
          // Not JSON, skip
        }
      }
    }

    appKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    showToast("Semua data berhasil direset!", "success");
    return true;
  } catch (error) {
    console.error("Error resetting data:", error);
    showToast("Gagal reset data: " + error.message, "error");
    return false;
  }
}

// ======================
// EVENT HANDLERS
// ======================

function setupEvent() {
  // Store Info Form
  const storeForm = document.getElementById("storeInfoForm");
  if (storeForm) {
    storeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const info = {
        name: document.getElementById("storeName").value.trim(),
        phone: document.getElementById("storePhone").value.trim(),
        email: document.getElementById("storeEmail").value.trim(),
        description: document.getElementById("storeDescription").value.trim()
      };

      if (saveStoreInfo(info)) {
        showToast("Informasi toko berhasil disimpan!", "success");
      } else {
        showToast("Gagal menyimpan informasi toko.", "error");
      }
    });
  }

  // Export Button
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportData);
  }

  // Import Button
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => {
      importFile.click();
    });

    importFile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await importData(file);
          updateStorageDisplay();
        } catch (error) {
          showToast("Gagal import: " + error.message, "error");
        }
        // Clear the file input
        importFile.value = "";
      }
    });
  }

  // Dummy Data Button
  const dummyDataBtn = document.getElementById("dummyDataBtn");
  if (dummyDataBtn) {
    dummyDataBtn.addEventListener("click", loadDummyData);
  }

  // Reset Button
  const resetBtn = document.getElementById("resetBtn");
  const resetModal = document.getElementById("resetModal");
  const confirmReset = document.getElementById("confirmReset");
  const confirmResetBtn = document.getElementById("confirmResetBtn");

  if (resetBtn && resetModal) {
    const modal = new bootstrap.Modal(resetModal);

    resetBtn.addEventListener("click", () => {
      modal.show();
    });

    // Enable/disable confirm button based on input
    if (confirmReset && confirmResetBtn) {
      confirmReset.addEventListener("input", (e) => {
        confirmResetBtn.disabled = e.target.value.trim() !== "RESET";
      });

      confirmResetBtn.addEventListener("click", () => {
        if (confirmReset.value.trim() === "RESET") {
          modal.hide();
          if (resetAllData()) {
            updateStorageDisplay();
            // Reset form
            loadStoreInfoForm();
            // Reset confirmation input
            confirmReset.value = "";
            confirmResetBtn.disabled = true;
          }
        }
      });
    }
  }

  // WhatsApp Developer Link
  const devWhatsApp = document.getElementById("devWhatsApp");
  if (devWhatsApp) {
    devWhatsApp.href = `https://wa.me/${DEV_WHATSAPP.replace(/-/g, "")}`;
    devWhatsApp.target = "_blank";
    devWhatsApp.title = `Hubungi ${DEV_NAME} via WhatsApp`;
  }
}

function updateAppInfo() {
  const appNameEl = document.getElementById("appName");
  const appVersionEl = document.getElementById("appVersion");

  if (appNameEl) appNameEl.textContent = APP_NAME;
  if (appVersionEl) appVersionEl.textContent = APP_VERSION;
}

// ======================
// INIT
// ======================

export function initSettingPage() {
  loadStoreInfoForm();
  updateStorageDisplay();
  updateAppInfo();
  setupEvent();
}