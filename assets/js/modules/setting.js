// assets/js/modules/setting.js

import { getData, saveData } from "../storage.js";

// Storage keys
const STORAGE_KEYS = {
  SHOP_INFO: "bengkel_shop_info",
  SERVICE_STATUS: "bengkel_service_status",
  CATEGORIES: "bengkel_categories",
  VEHICLE_BRANDS: "bengkel_vehicle_brands",
  SERVIS: "bengkel_servis",
  PELANGGAN: "bengkel_pelanggan",
  SPAREPART: "bengkel_sparepart"
};

// Default service status
const DEFAULT_SERVICE_STATUS = [
  { id: 1, name: "Menunggu", color: "#6c757d" },
  { id: 2, name: "Diproses", color: "#0d6efd" },
  { id: 3, name: "Selesai", color: "#198754" },
  { id: 4, name: "Dibatalkan", color: "#dc3545" }
];

// Default categories
const DEFAULT_CATEGORIES = [
  "Oli",
  "Ban",
  "Bus",
  "Aki",
  "Kampas Rem",
  "Busi",
  "Filter",
  "Sparepart Umum"
];

// Default vehicle brands
const DEFAULT_VEHICLE_BRANDS = [
  "Honda",
  "Yamaha",
  "Suzuki",
  "Kawasaki",
  "TVS",
  "Benelli",
  "BMW",
  "Harley-Davidson"
];

// Get shop info
export function getShopInfo() {
  return getData(STORAGE_KEYS.SHOP_INFO) || {
    name: "",
    phone: "",
    address: "",
    email: "",
    description: ""
  };
}

// Save shop info
export function saveShopInfo(shopInfo) {
  saveData(STORAGE_KEYS.SHOP_INFO, shopInfo);
}

// Get service status list
export function getServiceStatus() {
  const status = getData(STORAGE_KEYS.SERVICE_STATUS);
  if (!status || status.length === 0) {
    saveData(STORAGE_KEYS.SERVICE_STATUS, DEFAULT_SERVICE_STATUS);
    return DEFAULT_SERVICE_STATUS;
  }
  return status;
}

// Save service status list
export function saveServiceStatus(statusList) {
  saveData(STORAGE_KEYS.SERVICE_STATUS, statusList);
}

// Add new service status
export function addServiceStatus(name, color) {
  const statusList = getServiceStatus();
  const newId = Math.max(...statusList.map(s => s.id), 0) + 1;
  statusList.push({ id: newId, name, color });
  saveServiceStatus(statusList);
  return statusList;
}

// Delete service status
export function deleteServiceStatus(id) {
  const statusList = getServiceStatus().filter(s => s.id !== id);
  saveServiceStatus(statusList);
  return statusList;
}

// Get categories
export function getCategories() {
  const categories = getData(STORAGE_KEYS.CATEGORIES);
  if (!categories || categories.length === 0) {
    saveData(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return categories;
}

// Save categories
export function saveCategories(categories) {
  saveData(STORAGE_KEYS.CATEGORIES, categories);
}

// Add new category
export function addCategory(name) {
  const categories = getCategories();
  if (!categories.includes(name)) {
    categories.push(name);
    saveCategories(categories);
  }
  return categories;
}

// Delete category
export function deleteCategory(name) {
  const categories = getCategories().filter(c => c !== name);
  saveCategories(categories);
  return categories;
}

// Get vehicle brands
export function getVehicleBrands() {
  const brands = getData(STORAGE_KEYS.VEHICLE_BRANDS);
  if (!brands || brands.length === 0) {
    saveData(STORAGE_KEYS.VEHICLE_BRANDS, DEFAULT_VEHICLE_BRANDS);
    return DEFAULT_VEHICLE_BRANDS;
  }
  return brands;
}

// Save vehicle brands
export function saveVehicleBrands(brands) {
  saveData(STORAGE_KEYS.VEHICLE_BRANDS, brands);
}

// Add new vehicle brand
export function addVehicleBrand(name) {
  const brands = getVehicleBrands();
  if (!brands.includes(name)) {
    brands.push(name);
    saveVehicleBrands(brands);
  }
  return brands;
}

// Delete vehicle brand
export function deleteVehicleBrand(name) {
  const brands = getVehicleBrands().filter(b => b !== name);
  saveVehicleBrands(brands);
  return brands;
}

// Export all data
export function exportAllData() {
  const data = {
    shopInfo: getShopInfo(),
    serviceStatus: getServiceStatus(),
    categories: getCategories(),
    vehicleBrands: getVehicleBrands(),
    servis: getData(STORAGE_KEYS.SERVIS),
    pelanggan: getData(STORAGE_KEYS.PELANGGAN),
    sparepart: getData(STORAGE_KEYS.SPAREPART),
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bengkel_backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import data
export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.shopInfo) saveData(STORAGE_KEYS.SHOP_INFO, data.shopInfo);
        if (data.serviceStatus) saveData(STORAGE_KEYS.SERVICE_STATUS, data.serviceStatus);
        if (data.categories) saveData(STORAGE_KEYS.CATEGORIES, data.categories);
        if (data.vehicleBrands) saveData(STORAGE_KEYS.VEHICLE_BRANDS, data.vehicleBrands);
        if (data.servis) saveData(STORAGE_KEYS.SERVIS, data.servis);
        if (data.pelanggan) saveData(STORAGE_KEYS.PELANGGAN, data.pelanggan);
        if (data.sparepart) saveData(STORAGE_KEYS.SPAREPART, data.sparepart);
        
        resolve(true);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Reset all data
export function resetAllData() {
  localStorage.clear();
  // Re-initialize defaults
  saveData(STORAGE_KEYS.SERVICE_STATUS, DEFAULT_SERVICE_STATUS);
  saveData(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  saveData(STORAGE_KEYS.VEHICLE_BRANDS, DEFAULT_VEHICLE_BRANDS);
}

// Render shop info form
function renderShopInfo() {
  const shopInfo = getShopInfo();
  document.getElementById("shopName").value = shopInfo.name || "";
  document.getElementById("shopPhone").value = shopInfo.phone || "";
  document.getElementById("shopAddress").value = shopInfo.address || "";
  document.getElementById("shopEmail").value = shopInfo.email || "";
  document.getElementById("shopDescription").value = shopInfo.description || "";
}

// Render service status list
function renderServiceStatus() {
  const statusList = getServiceStatus();
  const container = document.getElementById("serviceStatusList");
  
  if (statusList.length <= 4) {
    container.innerHTML = `
      <div class="alert alert-warning mb-2">
        ⚠️ Status default (Menunggu, Diproses, Selesai, Dibatalkan) wajib ada dan tidak dapat dihapus.
      </div>
    `;
  } else {
    container.innerHTML = "";
  }
  
  const html = statusList.map(status => `
    <div class="d-inline-flex align-items-center me-2 mb-2">
      <span class="badge" style="background-color: ${status.color}; font-size: 0.9rem; padding: 0.5rem 0.75rem;">
        ${status.name}
      </span>
      ${status.id > 4 ? `<button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteServiceStatus(${status.id})">✕</button>` : ""}
    </div>
  `).join("");
  
  container.innerHTML += html;
}

// Render categories
function renderCategories() {
  const categories = getCategories();
  const container = document.getElementById("categoryList");
  
  const html = categories.map(cat => `
    <div class="d-inline-flex align-items-center me-2 mb-2">
      <span class="badge bg-secondary">${cat}</span>
      <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteCategory('${cat}')">✕</button>
    </div>
  `).join("");
  
  container.innerHTML = html || '<p class="text-muted">Belum ada kategori</p>';
}

// Render vehicle brands
function renderVehicleBrands() {
  const brands = getVehicleBrands();
  const container = document.getElementById("vehicleBrandList");
  
  const html = brands.map(brand => `
    <div class="d-inline-flex align-items-center me-2 mb-2">
      <span class="badge bg-info">${brand}</span>
      <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteVehicleBrand('${brand}')">✕</button>
    </div>
  `).join("");
  
  container.innerHTML = html || '<p class="text-muted">Belum ada merek kendaraan</p>';
}

// Initialize setting page
export function initSettingPage() {
  // Render all settings
  renderShopInfo();
  renderServiceStatus();
  renderCategories();
  renderVehicleBrands();
  
  // Shop info form submit
  document.getElementById("formShopInfo").addEventListener("submit", (e) => {
    e.preventDefault();
    const shopInfo = {
      name: document.getElementById("shopName").value.trim(),
      phone: document.getElementById("shopPhone").value.trim(),
      address: document.getElementById("shopAddress").value.trim(),
      email: document.getElementById("shopEmail").value.trim(),
      description: document.getElementById("shopDescription").value.trim()
    };
    saveShopInfo(shopInfo);
    alert("✅ Informasi tokosimpan!");
  });
  
  // Add service status
  document.getElementById("addServiceStatus").addEventListener("click", () => {
    const name = document.getElementById("newServiceStatus").value.trim();
    const color = document.getElementById("newServiceStatusColor").value;
    if (name) {
      addServiceStatus(name, color);
      document.getElementById("newServiceStatus").value = "";
      renderServiceStatus();
      alert("✅ Status servis ditambahkan!");
    }
  });
  
  // Add category
  document.getElementById("addCategory").addEventListener("click", () => {
    const name = document.getElementById("newCategory").value.trim();
    if (name) {
      addCategory(name);
      document.getElementById("newCategory").value = "";
      renderCategories();
      alert("✅ Kategori ditambahkan!");
    }
  });
  
  // Add vehicle brand
  document.getElementById("addVehicleBrand").addEventListener("click", () => {
    const name = document.getElementById("newVehicleBrand").value.trim();
    if (name) {
      addVehicleBrand(name);
      document.getElementById("newVehicleBrand").value = "";
      renderVehicleBrands();
      alert("✅ Merek kendaraan ditambahkan!");
    }
  });
  
  // Export data
  document.getElementById("exportData").addEventListener("click", () => {
    exportAllData();
    alert("✅ Data berhasil diexport!");
  });
  
  // Import data
  document.getElementById("importData").addEventListener("click", async () => {
    const fileInput = document.getElementById("importFile");
    const file = fileInput.files[0];
    if (!file) {
      alert("⚠️ Pilih file terlebih dahulu!");
      return;
    }
    try {
      await importData(file);
      // Refresh all renders
      renderShopInfo();
      renderServiceStatus();
      renderCategories();
      renderVehicleBrands();
      alert("✅ Data berhasil diimport!");
    } catch (error) {
      alert("⚠️ Gagal import data! Pastikan format file benar.");
      console.error(error);
    }
  });
  
  // Reset confirmation
  const confirmInput = document.getElementById("confirmReset");
  const confirmBtn = document.getElementById("confirmResetBtn");
  
  confirmInput.addEventListener("input", (e) => {
    confirmBtn.disabled = e.target.value !== "RESET";
  });
  
  // Reset all data
  confirmBtn.addEventListener("click", () => {
    resetAllData();
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalResetData"));
    modal.hide();
    // Refresh all renders
    renderShopInfo();
    renderServiceStatus();
    renderCategories();
    renderVehicleBrands();
    alert("✅ Semua data telah direset!");
  });
}

// Make delete functions available globally for onclick handlers
window.deleteServiceStatus = function(id) {
  const statusList = deleteServiceStatus(id);
  renderServiceStatus();
  alert("✅ Status servis dihapus!");
};

window.deleteCategory = function(name) {
  const categories = deleteCategory(name);
  renderCategories();
  alert("✅ Kategori dihapus!");
};

window.deleteVehicleBrand = function(name) {
  const brands = deleteVehicleBrand(name);
  renderVehicleBrands();
  alert("✅ Merek kendaraan dihapus!");
};