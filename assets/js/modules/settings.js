// assets/js/modules/settings.js

import { getData, saveData, getStorageInfo, formatBytes, exportAllData, importData, clearAllData, getSettings, saveSettings, getAdminCredentials, saveAdminCredentials, DATA_KEYS } from "../storage.js";

// INIT PAGE
export function initSettingsPage() {
  // Expose handler functions to window for onclick handlers
  window.saveSettingsHandler = saveSettingsHandler;
  window.exportDataHandler = exportDataHandler;
  window.importDataHandler = importDataHandler;
  window.deleteAllDataHandler = deleteAllDataHandler;
  
  renderSettingsForm();
  renderStorageInfo();
}

// Render settings form with current values
function renderSettingsForm() {
  const settings = getSettings();
  const credentials = getAdminCredentials();
  
  // WhatsApp number
  document.getElementById("whatsappNumber").value = settings.whatsappNumber || "";
  
  // Admin credentials
  document.getElementById("adminUsername").value = credentials.username;
  document.getElementById("adminPassword").value = credentials.password;
}

// Render storage information
function renderStorageInfo() {
  const info = getStorageInfo();
  
  document.getElementById("totalStorage").textContent = formatBytes(info.totalSize);
  
  // Render detail table
  const tbody = document.getElementById("storageDetailTable");
  tbody.innerHTML = "";
  
  for (const [key, data] of Object.entries(info.dataInfo)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${key}</td>
      <td>${data.itemCount}</td>
      <td>${formatBytes(data.size)}</td>
    `;
    tbody.appendChild(tr);
  }
  
  // If no data
  if (tbody.children.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-muted">Belum ada data</td></tr>`;
  }
}

// Setup event listeners
function setupEvent() {
  // Save settings
  document.getElementById("saveSettingsBtn").addEventListener("click", saveSettingsHandler);
  
  // Export data
  document.getElementById("exportDataBtn").addEventListener("click", exportDataHandler);
  
  // Import data
  document.getElementById("importDataBtn").addEventListener("click", importDataHandler);
  
  // Delete all data
  document.getElementById("deleteAllDataBtn").addEventListener("click", deleteAllDataHandler);
}

// Save settings handler
function saveSettingsHandler() {
  const whatsappNumber = document.getElementById("whatsappNumber").value.trim();
  const adminUsername = document.getElementById("adminUsername").value.trim();
  const adminPassword = document.getElementById("adminPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  
  // Validate
  if (!whatsappNumber) {
    alert("Nomor WhatsApp tidak boleh kosong");
    return;
  }
  
  if (!adminUsername) {
    alert("Username tidak boleh kosong");
    return;
  }
  
  if (!adminPassword) {
    alert("Password tidak boleh kosong");
    return;
  }
  
  if (adminPassword !== confirmPassword) {
    alert("Konfirmasi password tidak cocok");
    return;
  }
  
  // Save WhatsApp number to settings
  const settingsResult = saveSettings({ whatsappNumber: whatsappNumber });
  
  // Save admin credentials
  const credentialsResult = saveAdminCredentials({ 
    username: adminUsername, 
    password: adminPassword 
  });
  
  if (settingsResult.success && credentialsResult.success) {
    alert("Pengaturan berhasil disimpan!");
    document.getElementById("confirmPassword").value = "";
    document.getElementById("adminPassword").value = "";
  } else {
    alert("Gagal menyimpan pengaturan");
  }
}

// Export data handler
function exportDataHandler() {
  const data = exportAllData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `bengkel_backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import data handler
function importDataHandler() {
  const fileInput = document.getElementById("importFile");
  
  if (!fileInput.files.length) {
    alert("Pilih file JSON terlebih dahulu");
    return;
  }
  
  const file = fileInput.files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const result = importData(e.target.result);
      
      if (result.success) {
        alert(`Berhasil mengimpor ${result.count} data!`);
        fileInput.value = ""; // Reset file input
        renderStorageInfo(); // Refresh storage info
      } else {
        alert("Gagal mengimpor data: " + result.message);
      }
    } catch (error) {
      alert("Error mengimpor data: " + error.message);
    }
  };
  
  reader.readAsText(file);
}

// Delete all data handler
function deleteAllDataHandler() {
  if (!confirm("Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!")) {
    return;
  }
  
  if (!confirm("Konfirmasi terakhir: Semua data akan dihapus Permanen. Lanjutkan?")) {
    return;
  }
  
  const result = clearAllData();
  
  if (result.success) {
    alert(`Berhasil menghapus ${result.count} data!`);
    renderStorageInfo(); // Refresh storage info
  } else {
    alert("Gagal menghapus data: " + result.message);
  }
}