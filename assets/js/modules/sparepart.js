// assets/js/modules/sparepart.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML, formatCurrency } from "../utils.js";
import { showToast } from "../components/ui.js";

const KEY = "parts";
const SERVIS_KEY = "servis";
const LOW_STOCK_THRESHOLD = 5; // Alert when stock is below this
const ITEMS_PER_PAGE = 10;

let currentPage = 1;
let filteredData = [];

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
      showToast(message, "warning");
      sessionStorage.setItem("lowStockWarningShown", "true");
    }
  }
}

// INIT
export function initSparepartPage() {
  currentPage = 1;
  renderTable(getSearchQuery());
  setupEvent();
  showLowStockWarning();
}

// ======================
// RENDER TABLE
// ======================
function renderTable(searchQuery = "") {
  const data = getData(KEY);
  
  // Filter by search query
  if (searchQuery) {
    filteredData = data.filter(item => {
      const name = item.name ? item.name.toLowerCase() : "";
      const supplier = item.supplier ? item.supplier.toLowerCase() : "";
      const perusahaan = item.perusahaan ? item.perusahaan.toLowerCase() : "";
      return name.includes(searchQuery) || supplier.includes(searchQuery) || perusahaan.includes(searchQuery);
    });
  } else {
    filteredData = [...data];
  }

  const table = document.getElementById("partTable");
  table.innerHTML = "";

  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">⚙️</p>
        <p>${searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data sparepart"}</p>
        <small>${searchQuery ? "Coba kata kunci lain" : "Klik tombol 'Tambah' untuk menambahkan sparepart"}</small>
      </div>
    </td></tr>`;
    renderPagination();
    return;
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length);
  const pageData = filteredData.slice(startIndex, endIndex);

  pageData.forEach(item => {
    // Sanitize user input
    const safeName = sanitizeHTML(item.name || "");
    const safeSupplier = sanitizeHTML(item.supplier || "-");
    const safeTelp = item.telpSupplier ? sanitizeHTML(item.telpSupplier) : "-";
    const safeQty = item.qty !== undefined ? item.qty : 0;
    const safePrice = formatCurrency(item.price || 0);
    
    // Add warning badge for low stock (< 5)
    const lowStockWarning = safeQty < 5 ? `<span class="badge bg-warning text-dark ms-1" title="Stok rendah">⚠️</span>` : "";
    
    const whatsappLink = item.telpSupplier 
      ? `https://wa.me/${item.telpSupplier.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(item.supplier || 'Supplier')},%20saya%20ingin%20memesan%20${encodeURIComponent(item.name)}`
      : '#';

    table.innerHTML += `
      <tr>
        <td>${safeName}${lowStockWarning}</td>
        <td>${safeSupplier}</td>
        <td>${safeTelp}</td>
        <td>${safeQty}</td>
        <td>${safePrice}</td>
        <td>
          <button class="btn btn-info btn-sm btn-detail" data-id="${item.id}" title="Detail">👁️</button>
          <button class="btn btn-warning btn-sm btn-edit" data-id="${item.id}" title="Edit">✏️</button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}" title="Hapus">🗑</button>
          ${item.telpSupplier ? `<a href="${whatsappLink}" target="_blank" class="btn btn-success btn-sm" title="WhatsApp">📱</a>` : ''}
        </td>
      </tr>
    `;
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let html = "";
  
  // Previous button
  html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${currentPage - 1}">‹</a>
  </li>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }
  
  // Next button
  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${currentPage + 1}">›</a>
  </li>`;
  
  pagination.innerHTML = html;
}

// ======================
// EVENT
// ======================
function setupEvent() {
  const btnSave = document.getElementById("savePart");
  const btnSaveEdit = document.getElementById("saveEditPart");
  const table = document.getElementById("partTable");
  const searchInput = document.getElementById("searchPart");
  const pagination = document.getElementById("pagination");

  // Reset form when modal is closed (cancel or close without saving)
  const modalPart = document.getElementById("modalPart");
  modalPart.addEventListener("hidden.bs.modal", () => {
    clearForm();
    // Remove edit ID
    delete document.getElementById("savePart").dataset.editId;
  });

  // Reset edit modal when closed
  const modalEditPart = document.getElementById("modalEditPart");
  if (modalEditPart) {
    modalEditPart.addEventListener("hidden.bs.modal", () => {
      clearEditForm();
      delete document.getElementById("saveEditPart").dataset.editId;
    });
  }

  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      const query = e.target.value.toLowerCase();
      renderTable(query);
    }, 300);
  });
  
  // Clear search button
  const clearSearchBtn = document.getElementById("clearSearchPart");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentPage = 1;
      renderTable("");
    });
  }

  // Pagination click
  pagination.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.target.tagName === 'A' && !e.target.parentElement.classList.contains('disabled')) {
      const page = parseInt(e.target.dataset.page);
      if (page >= 1 && page <= Math.ceil(filteredData.length / ITEMS_PER_PAGE)) {
        currentPage = page;
        renderTable(searchInput.value.toLowerCase());
      }
    }
  });

  // Save new part
  btnSave.addEventListener("click", () => {
    const nameInput = document.getElementById("namaPart");
    const deskripsiInput = document.getElementById("deskripsiPart");
    const supplierInput = document.getElementById("supplierPart");
    const perusahaanInput = document.getElementById("perusahaanPart");
    const telpSupplierInput = document.getElementById("telpSupplierPart");
    const qtyInput = document.getElementById("qtyPart");
    const priceInput = document.getElementById("hargaPart");
    
    const name = nameInput.value.trim();
    const deskripsi = deskripsiInput.value.trim();
    const supplier = supplierInput.value.trim();
    const perusahaan = perusahaanInput.value.trim();
    const telpSupplier = telpSupplierInput.value.trim();
    const qty = parseInt(qtyInput.value) || 0;
    const price = parseInt(priceInput.value);

    // Validation - ensure numeric fields have valid positive numbers
    if (!name || name.length === 0) {
      nameInput.classList.add("is-invalid");
      return;
    }
    nameInput.classList.remove("is-invalid");
    
    // Validate supplier (required)
    if (!supplier || supplier.length === 0) {
      supplierInput.classList.add("is-invalid");
      return;
    }
    supplierInput.classList.remove("is-invalid");
    
    // Validate telpSupplier (required)
    if (!telpSupplier || telpSupplier.length === 0) {
      telpSupplierInput.classList.add("is-invalid");
      return;
    }
    telpSupplierInput.classList.remove("is-invalid");
    
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

    // Add new
    const newPart = {
      id: generateId(),
      name: sanitizedName,
      deskripsi: deskripsi.substring(0, 500).replace(/[<>]/g, ""),
      supplier: supplier.substring(0, 100).replace(/[<>]/g, ""),
      perusahaan: perusahaan.substring(0, 100).replace(/[<>]/g, ""),
      telpSupplier: telpSupplier.replace(/[^0-9]/g, ""),
      qty,
      price
    };
    
    // Check for duplicate name
    const data = getData(KEY);
    const exists = data.some(p => p.name.toLowerCase() === sanitizedName.toLowerCase());
    if (exists) {
      showToast("Nama sparepart sudah ada!", "warning");
      return;
    }
    
    data.push(newPart);
    saveData(KEY, data);

    clearForm();
    renderTable(searchInput.value.toLowerCase());
    closeModal();
  });

  // Save edited part
  if (btnSaveEdit) {
    btnSaveEdit.addEventListener("click", () => {
      const editId = btnSaveEdit.dataset.editId;
      if (!editId) return;

      const nameInput = document.getElementById("editNamaPart");
      const deskripsiInput = document.getElementById("editDeskripsiPart");
      const supplierInput = document.getElementById("editSupplierPart");
      const perusahaanInput = document.getElementById("editPerusahaanPart");
      const telpSupplierInput = document.getElementById("editTelpSupplierPart");
      const qtyInput = document.getElementById("editQtyPart");
      const priceInput = document.getElementById("editHargaPart");
      
      const name = nameInput.value.trim();
      const deskripsi = deskripsiInput.value.trim();
      const supplier = supplierInput.value.trim();
      const perusahaan = perusahaanInput.value.trim();
      const telpSupplier = telpSupplierInput.value.trim();
      const qty = parseInt(qtyInput.value) || 0;
      const price = parseInt(priceInput.value);

      // Validation - ensure numeric fields have valid positive numbers
      if (!name || name.length === 0) {
        nameInput.classList.add("is-invalid");
        return;
      }
      nameInput.classList.remove("is-invalid");
      
      // Validate supplier (required)
      if (!supplier || supplier.length === 0) {
        supplierInput.classList.add("is-invalid");
        return;
      }
      supplierInput.classList.remove("is-invalid");
      
      // Validate telpSupplier (required)
      if (!telpSupplier || telpSupplier.length === 0) {
        telpSupplierInput.classList.add("is-invalid");
        return;
      }
      telpSupplierInput.classList.remove("is-invalid");
      
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

      // Update existing
      const data = getData(KEY);
      const index = data.findIndex(p => p.id == editId);
      if (index !== -1) {
        // Check for duplicate name (excluding current)
        const exists = data.some(p => p.name.toLowerCase() === sanitizedName.toLowerCase() && p.id != editId);
        if (exists) {
          showToast("Nama sparepart sudah ada!", "warning");
          return;
        }
        data[index].name = sanitizedName;
        data[index].deskripsi = deskripsi.substring(0, 500).replace(/[<>]/g, "");
        data[index].supplier = supplier.substring(0, 100).replace(/[<>]/g, "");
        data[index].perusahaan = perusahaan.substring(0, 100).replace(/[<>]/g, "");
        data[index].telpSupplier = telpSupplier.replace(/[^0-9]/g, "");
        data[index].qty = qty;
        data[index].price = price;
        saveData(KEY, data);
      }

      clearEditForm();
      renderTable(searchInput.value.toLowerCase());
      closeEditModal();
    });
  }
  
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
    
    if (e.target.classList.contains("btn-detail")) {
      const id = e.target.dataset.id;
      showDetail(id);
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

  // Set values to edit form
  document.getElementById("editPartId").value = id;
  document.getElementById("editNamaPart").value = part.name || "";
  document.getElementById("editDeskripsiPart").value = part.deskripsi || "";
  document.getElementById("editSupplierPart").value = part.supplier || "";
  document.getElementById("editPerusahaanPart").value = part.perusahaan || "";
  document.getElementById("editTelpSupplierPart").value = part.telpSupplier || "";
  document.getElementById("editQtyPart").value = part.qty || 0;
  document.getElementById("editHargaPart").value = part.price || 0;
  
  // Set edit ID
  document.getElementById("saveEditPart").dataset.editId = id;
  
  // Show edit modal
  const modal = new bootstrap.Modal(document.getElementById("modalEditPart"));
  modal.show();
}

// ======================
// DETAIL
// ======================
function showDetail(id) {
  const data = getData(KEY);
  const part = data.find(p => p.id == id);
  if (!part) return;

  const detailBody = document.getElementById("detailPartBody");
  const whatsappLink = part.telpSupplier 
    ? `https://wa.me/${part.telpSupplier.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(part.supplier || 'Supplier')},%20saya%20ingin%20memesan%20${encodeURIComponent(part.name)}`
    : '#';
  const whatsappButton = part.telpSupplier 
    ? `<a href="${whatsappLink}" target="_blank" class="btn btn-success">📱 Kirim WhatsApp ke Supplier</a>`
    : '<span class="text-muted">Nomor telepon supplier tidak tersedia</span>';

  detailBody.innerHTML = `
    <div class="container-fluid">
      <div class="row mb-3">
        <div class="col-md-4 fw-bold">Nama Sparepart:</div>
        <div class="col-md-8">${sanitizeHTML(part.name || '-')}</div>
      </div>
      ${part.deskripsi ? `
      <div class="row mb-3">
        <div class="col-md-4 fw-bold">Deskripsi/Keterangan:</div>
        <div class="col-md-8">${sanitizeHTML(part.deskripsi)}</div>
      </div>
      ` : ''}
      <div class="row mb-3">
        <div class="col-md-4 fw-bold">Nama Supplier:</div>
        <div class="col-md-8">${sanitizeHTML(part.supplier || '-')}</div>
      </div>
      <div class="row mb-3">
        <div class="col-md-4 fw-bold">Nama Perusahaan:</div>
        <div class="col-md-8">${sanitizeHTML(part.perusahaan || '-')}</div>
      </div>
      <div class="row mb-3">
        <div class="col-md-4 fw-bold">Nomor Telepon:</div>
        <div class="col-md-8">${sanitizeHTML(part.telpSupplier || '-')}</div>
      </div>
      <div class="row mb-3">
        <div class="col-md-4 fw-bold">Quantity:</div>
        <div class="col-md-8">${part.qty || 0}</div>
      </div>
      <div class="row mb-3">
        <div class="col-md-4 fw-bold">Harga:</div>
        <div class="col-md-8">${formatCurrency(part.price || 0)}</div>
      </div>
      <div class="row mt-4">
        <div class="col-12">${whatsappButton}</div>
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById("modalDetailPart"));
  modal.show();
}

// ======================
// UTIL
// ======================
function clearForm() {
  document.getElementById("namaPart").value = "";
  document.getElementById("deskripsiPart").value = "";
  document.getElementById("supplierPart").value = "";
  document.getElementById("perusahaanPart").value = "";
  document.getElementById("telpSupplierPart").value = "";
  document.getElementById("qtyPart").value = "";
  document.getElementById("hargaPart").value = "";
  
  // Remove validation classes
  document.getElementById("namaPart").classList.remove("is-invalid");
  document.getElementById("deskripsiPart").classList.remove("is-invalid");
  document.getElementById("supplierPart").classList.remove("is-invalid");
  document.getElementById("perusahaanPart").classList.remove("is-invalid");
  document.getElementById("telpSupplierPart").classList.remove("is-invalid");
  document.getElementById("qtyPart").classList.remove("is-invalid");
  document.getElementById("hargaPart").classList.remove("is-invalid");
  
  // Reset modal title
  document.querySelector("#modalPart .modal-header h5").textContent = "Tambah Sparepart";
}

function clearEditForm() {
  document.getElementById("editPartId").value = "";
  document.getElementById("editNamaPart").value = "";
  document.getElementById("editDeskripsiPart").value = "";
  document.getElementById("editSupplierPart").value = "";
  document.getElementById("editPerusahaanPart").value = "";
  document.getElementById("editTelpSupplierPart").value = "";
  document.getElementById("editQtyPart").value = "";
  document.getElementById("editHargaPart").value = "";
  
  // Remove validation classes
  document.getElementById("editNamaPart").classList.remove("is-invalid");
  document.getElementById("editDeskripsiPart").classList.remove("is-invalid");
  document.getElementById("editSupplierPart").classList.remove("is-invalid");
  document.getElementById("editPerusahaanPart").classList.remove("is-invalid");
  document.getElementById("editTelpSupplierPart").classList.remove("is-invalid");
  document.getElementById("editQtyPart").classList.remove("is-invalid");
  document.getElementById("editHargaPart").classList.remove("is-invalid");
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

function closeEditModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalEditPart")
  );
  if (modal) {
    modal.hide();
  }
  
  // Reset form when modal is closed
  clearEditForm();
  
  // Remove edit ID
  delete document.getElementById("saveEditPart").dataset.editId;
}
