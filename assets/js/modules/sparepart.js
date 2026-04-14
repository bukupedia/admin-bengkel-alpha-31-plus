// assets/js/modules/sparepart.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML, formatCurrency } from "../utils.js";

const KEY = "parts";
const SERVIS_KEY = "servis";
const LOW_STOCK_THRESHOLD = 5; // Alert when stock is below this

function getSearchQuery() {
  const searchInput = document.getElementById("searchPart");
  return searchInput ? searchInput.value.toLowerCase() : "";
}

// GET LOW STOCK ITEMS
function getLowStockItems() {
  const data = getData(KEY);
  return data.filter(item => (item.qty || 0) <= LOW_STOCK_THRESHOLD);
}

// SHOW LOW STOCK WARNING
function showLowStockWarning() {
  const lowStockItems = getLowStockItems();
  if (lowStockItems.length > 0) {
    const message = `⚠️ Peringatan Stok Rendah:\n\n` + 
      lowStockItems.map(item => `• ${item.name}: ${item.qty} unit`).join("\n") +
      `\n\nSegera lakukan restok untuk menjaga kelancaran servis.`;
    // Only show warning once per session (use sessionStorage to track)
    if (!sessionStorage.getItem("lowStockWarningShown")) {
      alert(message);
      sessionStorage.setItem("lowStockWarningShown", "true");
    }
  }
}

// INIT
export function initSparepartPage() {
  renderTable(getSearchQuery());
  setupEvent();
  showLowStockWarning();
}

// ======================
// RENDER TABLE
// ======================
function renderTable(searchQuery = "") {
  const data = getData(KEY);
  const table = document.getElementById("partTable");

  let filteredData = data;
  
  // Filter by search query
  if (searchQuery) {
    filteredData = data.filter(item => {
      const name = item.name.toLowerCase();
      return name.includes(searchQuery);
    });
  }

  table.innerHTML = "";

  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="4" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">⚙️</p>
        <p>${searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data sparepart"}</p>
        <small>${searchQuery ? "Coba kata kunci lain" : "Klik tombol 'Tambah' untuk menambahkan sparepart"}</small>
      </div>
    </td></tr>`;
    return;
  }

  filteredData.forEach(item => {
    // Sanitize user input
    const safeName = sanitizeHTML(item.name);
    const safeQty = item.qty !== undefined ? item.qty : 0;
    const safePrice = formatCurrency(item.price);
    
    table.innerHTML += `
      <tr>
        <td>${safeName}</td>
        <td>${safeQty}</td>
        <td>${safePrice}</td>
        <td>
          <button class="btn btn-warning btn-sm btn-edit" data-id="${item.id}" title="Edit">✏️</button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}" title="Hapus">🗑</button>
        </td>
      </tr>
    `;
  });
}

// ======================
// EVENT
// ======================
function setupEvent() {
  const btnSave = document.getElementById("savePart");
  const table = document.getElementById("partTable");
  const searchInput = document.getElementById("searchPart");

  // Reset form when modal is closed (cancel or close without saving)
  const modalPart = document.getElementById("modalPart");
  modalPart.addEventListener("hidden.bs.modal", () => {
    clearForm();
    // Remove edit ID
    delete document.getElementById("savePart").dataset.editId;
  });

  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value.toLowerCase();
      renderTable(query);
    }, 300);
  });

  btnSave.addEventListener("click", () => {
    const nameInput = document.getElementById("namaPart");
    const qtyInput = document.getElementById("qtyPart");
    const priceInput = document.getElementById("hargaPart");
    
    const name = nameInput.value.trim();
    const qty = parseInt(qtyInput.value) || 0;
    const price = parseInt(priceInput.value);

    // Validation - ensure numeric fields have valid positive numbers
    if (!name || name.length === 0) {
      nameInput.classList.add("is-invalid");
      return;
    }
    nameInput.classList.remove("is-invalid");
    
    // Validate price is a positive number
    if (!price || price <= 0 || isNaN(price)) {
      priceInput.classList.add("is-invalid");
      return;
    }
    priceInput.classList.remove("is-invalid");
    
    // Also ensure price is an integer
    if (!Number.isInteger(price)) {
      priceInput.classList.add("is-invalid");
      return;
    }

    // Validate quantity is a non-negative integer
    if (qty < 0 || isNaN(qty)) {
      qtyInput.classList.add("is-invalid");
      return;
    }
    qtyInput.classList.remove("is-invalid");
    
    // Also ensure quantity is an integer
    if (!Number.isInteger(qty)) {
      qtyInput.classList.add("is-invalid");
      return;
    }

    // Additional sanitization: trim and limit length
    const sanitizedName = name.substring(0, 100).replace(/[<>]/g, "");

    // Check if editing or adding
    const editId = btnSave.dataset.editId;
    const data = getData(KEY);
    
    if (editId) {
      // Update existing
      const index = data.findIndex(p => p.id == editId);
      if (index !== -1) {
        // Check for duplicate name (excluding current)
        const exists = data.some(p => p.name.toLowerCase() === sanitizedName.toLowerCase() && p.id != editId);
        if (exists) {
          alert("Nama sparepart sudah ada!");
          return;
        }
        data[index].name = sanitizedName;
        data[index].qty = qty;
        data[index].price = price;
        saveData(KEY, data);
      }
      delete btnSave.dataset.editId;
    } else {
      // Add new
      const newPart = {
        id: generateId(),
        name: sanitizedName,
        qty,
        price
      };
      
      // Check for duplicate name
      const exists = data.some(p => p.name.toLowerCase() === sanitizedName.toLowerCase());
      if (exists) {
        alert("Nama sparepart sudah ada!");
        return;
      }
      
      data.push(newPart);
      saveData(KEY, data);
    }

    clearForm();
    renderTable(searchInput.value.toLowerCase());
    closeModal();
  });
  
  // Table events
  table.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      deletePart(id);
    }
    
    if (e.target.classList.contains("btn-edit")) {
      const id = e.target.dataset.id;
      editPart(id);
    }
  });
}

// ======================
// DELETE
// ======================
function deletePart(id) {
  // Check if part is used in any servis
  const servisData = getData(SERVIS_KEY);
  const partData = getData(KEY);
  const part = partData.find(p => p.id == id);
  
  let relatedServis = [];
  if (part) {
    relatedServis = servisData.filter(s => 
      s.items && s.items.some(item => item.partId == id)
    );
  }
  
  let confirmMessage = "Yakin ingin menghapus sparepart ini?";
  if (relatedServis.length > 0) {
    confirmMessage = `Sparepart ini digunakan di ${relatedServis.length} record servis.\nHapus sparepart akan menyebabkan data tersebut tidak lengkap.\n\nApakah Anda tetap ingin menghapus?`;
  }
  
  if (!confirm(confirmMessage)) return;
  
  let data = getData(KEY);
  data = data.filter(item => item.id != id);
  saveData(KEY, data);
  renderTable(getSearchQuery());
}

// ======================
// EDIT
// ======================
function editPart(id) {
  const data = getData(KEY);
  const part = data.find(p => p.id == id);
  if (!part) return;

  // Set values to form
  document.getElementById("namaPart").value = part.name;
  document.getElementById("qtyPart").value = part.qty || 0;
  document.getElementById("hargaPart").value = part.price;
  
  // Set edit ID
  document.getElementById("savePart").dataset.editId = id;
  
  // Update modal title
  document.querySelector("#modalPart .modal-header h5").textContent = "Edit Sparepart";
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("modalPart"));
  modal.show();
}

// ======================
// UTIL
// ======================
function clearForm() {
  document.getElementById("namaPart").value = "";
  document.getElementById("qtyPart").value = "";
  document.getElementById("hargaPart").value = "";
  
  // Remove validation classes
  document.getElementById("namaPart").classList.remove("is-invalid");
  document.getElementById("qtyPart").classList.remove("is-invalid");
  document.getElementById("hargaPart").classList.remove("is-invalid");
  
  // Reset modal title
  document.querySelector("#modalPart .modal-header h5").textContent = "Tambah Sparepart";
}

function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalPart")
  );
  if (modal) {
    modal.hide();
  }
  
  // Reset form when modal is closed
  clearForm();
  
  // Remove edit ID
  delete document.getElementById("savePart").dataset.editId;
}
