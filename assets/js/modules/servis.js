// assets/js/modules/servis.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML, formatCurrency, formatDate, getTodayString, getDateOffsetString } from "../utils.js";

const KEY = "servis";
const CUSTOMER_KEY = "customers";
const PART_KEY = "parts";

// Date filter state
let dateFilter = "all"; // "all", "today", "week", "month", or "custom"
let customDate = "";

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;

// WhatsApp default number
const DEFAULT_WHATSAPP_NUMBER = "0895332782122";

// ======================
// GET FILTERED DATE RANGE
// ======================
function getDateFilterRange() {
  const today = getTodayString();
  
  if (dateFilter === "all") {
    // Return a very wide range to include all dates
    return { start: "1970-01-01", end: "2100-12-31" };
  } else if (dateFilter === "today") {
    return { start: today, end: today };
  } else if (dateFilter === "week") {
    return { start: getDateOffsetString(7), end: today };
  } else if (dateFilter === "month") {
    return { start: getDateOffsetString(30), end: today };
  } else if (dateFilter === "custom" && customDate) {
    return { start: customDate, end: customDate };
  }
  // Default to all
  return { start: "1970-01-01", end: "2100-12-31" };
}

// ======================
// INIT
// ======================
export function initServisPage() {
  // Set today's date as default and minimum date
  const today = getTodayString();
  const tanggalInput = document.getElementById("tanggal");
  tanggalInput.value = today;
  tanggalInput.min = today;
  
  // Set default date filter to all
  dateFilter = "all";
  
  renderCustomerDatalist();
  const searchInput = document.getElementById("searchServis");
  const statusFilter = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
  setupEvent();
  addItemRow(); // default 1 row
  setupSearch();
  setupStatusFilter();
  setupDateFilter();
}

// ======================
// STATUS FILTER
// ======================
function setupStatusFilter() {
  const statusFilter = document.getElementById("filterStatus");
  statusFilter.addEventListener("change", () => {
    currentPage = 1; // Reset to page 1
    const searchInput = document.getElementById("searchServis");
    renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter.value);
  });
}

// ======================
// DATE FILTER
// ======================
function setupDateFilter() {
  const filterTanggal = document.getElementById("filterTanggal");
  const customDateContainer = document.getElementById("customDateContainer");
  const customDateInput = document.getElementById("filterCustomDate");
  
  filterTanggal.addEventListener("change", () => {
    dateFilter = filterTanggal.value;
    currentPage = 1; // Reset to page 1
    
    // Show/hide custom date input
    if (dateFilter === "custom") {
      customDateContainer.style.display = "block";
      // Set custom date to today by default if empty
      if (!customDateInput.value) {
        customDateInput.value = getTodayString();
        customDate = customDateInput.value;
      }
    } else {
      customDateContainer.style.display = "none";
      customDate = "";
    }
    
    // Render table with new date filter
    const searchInput = document.getElementById("searchServis");
    const statusFilter = document.getElementById("filterStatus");
    renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
  });
  
  // Handle custom date change
  customDateInput.addEventListener("change", () => {
    customDate = customDateInput.value;
    currentPage = 1; // Reset to page 1
    const searchInput = document.getElementById("searchServis");
    const statusFilter = document.getElementById("filterStatus");
    renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
  });
}

// ======================
// SEARCH FUNCTIONALITY
// ======================
function setupSearch() {
  const searchInput = document.getElementById("searchServis");
  
  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1; // Reset to page 1
      const query = e.target.value.toLowerCase();
      const statusFilter = document.getElementById("filterStatus");
      renderTable(query, statusFilter ? statusFilter.value : "");
    }, 300);
  });
  
  // Clear search button
  const clearSearchBtn = document.getElementById("clearSearchServis");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentPage = 1;
      const statusFilter = document.getElementById("filterStatus");
      renderTable("", statusFilter ? statusFilter.value : "");
    });
  }
}

// ======================
// DATALIST CUSTOMER
// ======================
function renderCustomerDatalist(customers = null) {
  const custData = customers || getData(CUSTOMER_KEY);
  const input = document.getElementById("customerInput");
  const datalist = document.getElementById("customerDatalist");
  const customerNote = document.getElementById("customerNote");
  
  datalist.innerHTML = "";
  custData.forEach(c => {
    const safeName = sanitizeHTML(c.name);
    const safePolice = sanitizeHTML(c.policeNumber || "");
    const police = safePolice ? ` (${safePolice})` : "";
    datalist.innerHTML += `<option value="${safeName}${police}" data-id="${c.id}" data-police="${safePolice}">`;
  });
  
  // Handle selection
  input.addEventListener("input", () => {
    const hiddenSelect = document.getElementById("customerSelect");
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === input.value);
    if (selectedOption) {
      hiddenSelect.value = selectedOption.dataset.id;
      input.classList.remove("is-invalid");
      customerNote.style.display = "none";
    } else if (input.value) {
      // User typed something that doesn't match any option
      hiddenSelect.value = "";
      customerNote.textContent = "Pelanggan tidak ditemukan";
      customerNote.style.display = "block";
    } else {
      hiddenSelect.value = "";
      customerNote.style.display = "none";
    }
  });
  
  input.addEventListener("change", () => {
    const hiddenSelect = document.getElementById("customerSelect");
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === input.value);
    if (selectedOption) {
      hiddenSelect.value = selectedOption.dataset.id;
      input.classList.remove("is-invalid");
      customerNote.style.display = "none";
    } else if (input.value) {
      // User typed something that doesn't match exactly
      input.classList.add("is-invalid");
      customerNote.textContent = "Pelanggan tidak ditemukan";
      customerNote.style.display = "block";
    } else {
      customerNote.style.display = "none";
    }
  });
}

// ======================
// GET AVAILABLE PARTS (stock > 0)
// ======================
function getAvailableParts() {
  return getData(PART_KEY).filter(p => (p.qty || 0) > 0);
}

// ======================
// ITEM HANDLING
// ======================
function addItemRow() {
  const container = document.getElementById("itemContainer");
  const parts = getAvailableParts();
  
  const rowId = "row-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  
  const row = document.createElement("div");
  row.className = "row g-2 mb-2 item-row";
  row.id = rowId;
  row.dataset.rowId = rowId;
  
  // Build datalist options
  let options = ``;
  const allParts = getData(PART_KEY);
  allParts.forEach(p => {
    const safeName = sanitizeHTML(p.name);
    const stock = p.qty || 0;
    const disabled = stock === 0 ? 'disabled' : '';
    // Sanitize stock info to prevent XSS
    const stockText = stock === 0 ? 'Stok: Habis' : `Stok: ${stock}`;
    const safeStockText = sanitizeHTML(stockText);
    options += `<option value="${safeName}" data-id="${p.id}" data-price="${p.price}" data-stock="${stock}" ${disabled}>${safeName} (${safeStockText})</option>`;
  });
  
  row.innerHTML = `
    <div class="col-md-4">
      <label class="form-label small">Sparepart</label>
      <div class="input-group">
        <input type="text" class="form-control part-input" placeholder="Cari sparepart..." list="partDatalist-${rowId}">
        <button type="button" class="btn btn-outline-secondary btn-clear-part" title="Hapus pilihan">✕</button>
      </div>
      <datalist id="partDatalist-${rowId}">${options}</datalist>
      <input type="hidden" class="part-id">
      <div class="part-note small mt-1" style="display: none;"></div>
    </div>

    <div class="col-md-3">
      <label class="form-label small">Harga</label>
      <input type="number" class="form-control item-price" placeholder="Harga" min="0" readonly>
    </div>

    <div class="col-md-3">
      <label class="form-label small">Jumlah</label>
      <div class="input-group">
        <button class="btn btn-outline-secondary btn-minus" type="button">-</button>
        <input type="number" class="form-control text-center item-qty" value="1" min="1">
        <button class="btn btn-outline-secondary btn-plus" type="button">+</button>
      </div>
    </div>

    <div class="col-md-2 d-flex align-items-end">
      <button class="btn btn-danger w-100 btn-remove">✕</button>
    </div>
  `;
  
  container.appendChild(row);
  
  // References
  const partInput = row.querySelector(".part-input");
  const partIdInput = row.querySelector(".part-id");
  const priceInput = row.querySelector(".item-price");
  const qtyInput = row.querySelector(".item-qty");
  const partNote = row.querySelector(".part-note");
  const btnPlus = row.querySelector(".btn-plus");
  const btnMinus = row.querySelector(".btn-minus");
  const btnClearPart = row.querySelector(".btn-clear-part");
  
  // Handle part selection from datalist
  partInput.addEventListener("input", () => {
    const datalist = row.querySelector(`#partDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (selectedOption && !selectedOption.disabled) {
      partIdInput.value = selectedOption.dataset.id;
      priceInput.value = selectedOption.dataset.price;
      
      const stock = parseInt(selectedOption.dataset.stock);
      partNote.textContent = `Stok tersedia: ${stock}`;
      partNote.style.display = "block";
      // Green if stock >= 5, red if stock < 5 (low stock warning)
      partNote.className = stock >= 5 ? "part-note small text-success mt-1" : "part-note small text-danger mt-1";
      
      // Set max quantity based on stock
      qtyInput.max = stock;
      if (parseInt(qtyInput.value) > stock) {
        qtyInput.value = stock;
      }
    } else if (partInput.value) {
      // User typed something that doesn't match any option
      partIdInput.value = "";
      partNote.textContent = "Sparepart tidak ditemukan";
      partNote.style.display = "block";
      partNote.className = "part-note small text-danger mt-1";
    } else {
      partIdInput.value = "";
      partNote.style.display = "none";
    }
    
    calculateTotal();
  });
  
  // Clear part button
  btnClearPart.addEventListener("click", () => {
    partInput.value = "";
    partIdInput.value = "";
    priceInput.value = "";
    partNote.style.display = "none";
    qtyInput.value = 1;
    qtyInput.max = 99;
    calculateTotal();
  });
  
  // Plus button
  btnPlus.addEventListener("click", () => {
    const currentStock = partIdInput.value ? getPartStock(partIdInput.value) : Infinity;
    const currentQty = parseInt(qtyInput.value) || 0;
    const maxQty = partIdInput.value ? Math.min(currentStock, 99) : 99;
    
    if (currentQty < maxQty) {
      qtyInput.value = currentQty + 1;
      calculateTotal();
    }
  });
  
  // Minus button
  btnMinus.addEventListener("click", () => {
    const currentQty = parseInt(qtyInput.value) || 0;
    if (currentQty > 1) {
      qtyInput.value = currentQty - 1;
      calculateTotal();
    }
  });
  
  // Manual price input
  priceInput.addEventListener("input", calculateTotal);
  
  // Quantity change
  qtyInput.addEventListener("change", () => {
    // Validate quantity
    const stock = partIdInput.value ? getPartStock(partIdInput.value) : 999;
    let qty = parseInt(qtyInput.value) || 1;
    if (qty < 1) qty = 1;
    if (qty > stock) qty = stock;
    qtyInput.value = qty;
    calculateTotal();
  });
  
  // Remove row
  row.querySelector(".btn-remove").addEventListener("click", () => {
    row.remove();
    calculateTotal();
  });
}

// Get part stock
function getPartStock(partId) {
  const parts = getData(PART_KEY);
  const part = parts.find(p => p.id == partId);
  return part ? (part.qty || 0) : 0;
}

// ======================
// STOCK HELPER FUNCTIONS (refactored to avoid duplication)
// ======================
function returnStock(items) {
  if (!items || items.length === 0) return;
  
  const partData = getData(PART_KEY);
  items.forEach(item => {
    if (item.partId) {
      const partIndex = partData.findIndex(p => p.id == item.partId);
      if (partIndex !== -1) {
        partData[partIndex].qty = (partData[partIndex].qty || 0) + item.qty;
      }
    }
  });
  saveData(PART_KEY, partData);
}

function reduceStock(items) {
  if (!items || items.length === 0) return;
  
  const partData = getData(PART_KEY);
  items.forEach(item => {
    if (item.partId) {
      const partIndex = partData.findIndex(p => p.id == item.partId);
      if (partIndex !== -1) {
        partData[partIndex].qty = (partData[partIndex].qty || 0) - item.qty;
      }
    }
  });
  saveData(PART_KEY, partData);
}

// ======================
// HITUNG TOTAL
// ======================
function calculateTotal() {
  const rows = document.querySelectorAll(".item-row");
  let total = 0;
  const items = [];
  
  rows.forEach(row => {
    const name = row.querySelector(".part-input").value.trim();
    const price = parseInt(row.querySelector(".item-price").value) || 0;
    const qty = parseInt(row.querySelector(".item-qty").value) || 0;
    const partId = row.querySelector(".part-id").value;
    
    if (name && price > 0 && qty > 0) {
      total += price * qty;
      items.push({
        partId: partId || null,
        name,
        price,
        qty
      });
    }
  });
  
  document.getElementById("totalDisplay").innerText = formatCurrency(total);
  
  return { total, items };
}

// ======================
// RENDER TABLE
// ======================
function renderTable(searchQuery = "", statusFilter = "") {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  const table = document.getElementById("servisTable");
  
  // Get date filter range
  const dateRange = getDateFilterRange();
  
  table.innerHTML = "";
  
  // Filter by date range
  let filteredData = data.filter(item => {
    return item.tanggal >= dateRange.start && item.tanggal <= dateRange.end;
  });
  
  // Filter by search query and status
  if (searchQuery) {
    filteredData = filteredData.filter(item => {
      const customer = customers.find(c => c.id == item.customerId);
      const customerName = customer ? customer.name.toLowerCase() : "";
      const policeNumber = customer ? (customer.policeNumber || "").toLowerCase() : "";
      return customerName.includes(searchQuery) || policeNumber.includes(searchQuery);
    });
  }
  
  // Filter by status
  if (statusFilter) {
    filteredData = filteredData.filter(item => item.status === statusFilter);
  }
  
  // Sort by date (newest first)
  filteredData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  
  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Reset to page 1 if current page is out of range
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
  if (totalPages === 0) currentPage = 1;
  
  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  if (paginatedData.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">🔧</p>
        <p>${searchQuery || statusFilter ? "Tidak ada hasil pencarian" : "Belum ada data servis"}</p>
        <small>${searchQuery || statusFilter ? "Coba kata kunci lain" : "Klik tombol 'Tambah Servis' untuk menambah data"}</small>
      </div>
    </td></tr>`;
    // Also remove pagination container if exists
    const paginationContainer = document.getElementById("paginationContainer");
    if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }
    return;
  }
  
  // Render table rows
  paginatedData.forEach(item => {
    const customer = customers.find(c => c.id == item.customerId);
    const customerName = customer ? sanitizeHTML(customer.name) : "-";
    const customerPoliceNumber = customer ? sanitizeHTML(customer.policeNumber || "-") : "-";
    const customerPhone = customer ? (customer.phone || "") : "";
    const safeTanggal = sanitizeHTML(item.tanggal);
    
    // Status badges
    const statusMap = {
      "menunggu": { class: "secondary", text: "Menunggu" },
      "servicing": { class: "warning", text: "Diproses" },
      "selesai": { class: "success", text: "Selesai" },
      "dibatalkan": { class: "danger", text: "Dibatalkan" }
    };
    const statusInfo = statusMap[item.status] || statusMap.menunggu;
    
    // Get customer vehicle info
    const customerVehicleBrand = customer ? (customer.vehicleBrand || "") : "";
    const customerVehicleName = customer ? (customer.vehicleName || "") : "";
    const customerPoliceNumberVal = customer ? (customer.policeNumber || "") : "";
    
    // Check if vehicle info is complete (both brand and name are provided)
    const hasVehicleInfo = customerVehicleBrand.trim() !== "" && customerVehicleName.trim() !== "";
    
    // WhatsApp message based on status and vehicle info availability
    let waMessage = "";
    if (hasVehicleInfo) {
      // Messages WITH vehicle info
      if (item.status === "menunggu") {
        waMessage = `Kendaraan Anda ${customerVehicleBrand} ${customerVehicleName} dengan No. Polisi ${customerPoliceNumberVal} akan segera kami tangani. Harap menunggu. Informasi status kendaraan Anda akan dikirimkan melalui nomor ini. Terimakasih`;
      } else if (item.status === "servicing") {
        waMessage = `Pelanggan yang terhormat, Terimakasih sudah menunggu. Kendaraan Anda ${customerVehicleBrand} ${customerVehicleName} dengan No. Polisi ${customerPoliceNumberVal} sedang ditangani oleh mekanik kami`;
      } else if (item.status === "selesai") {
        waMessage = `Terimakasih sudah menunggu. Kendaraan Anda ${customerVehicleBrand} ${customerVehicleName} dengan No. Polisi ${customerPoliceNumberVal} sudah selesai kami tangani.`;
      } else if (item.status === "dibatalkan") {
        waMessage = `Status servis kendaraan Anda ${customerVehicleBrand} ${customerVehicleName} dengan No. Polisi ${customerPoliceNumberVal} telah Dibatalkan. Berikan Saran dan Kritik Anda melalui nomor ini. Saran dan Kritik yang Anda berikan akan membantu kami untuk menjadi lebih baik. Terimakasih telah berkunjung ke Bengkel Kami!. Hormat Kami.`;
      }
    } else {
      // Fallback messages WITHOUT vehicle info (when vehicle brand or name is not provided) but WITH police number
      if (item.status === "menunggu") {
        waMessage = `Kendaraan Anda dengan No. Polisi ${customerPoliceNumberVal} akan segera kami tangani. Harap menunggu. Informasi status kendaraan Anda akan dikirimkan melalui nomor ini. Terimakasih`;
      } else if (item.status === "servicing") {
        waMessage = `Pelanggan yang terhormat, Terimakasih sudah menunggu. Kendaraan Anda dengan No. Polisi ${customerPoliceNumberVal} sedang ditangani oleh mekanik kami`;
      } else if (item.status === "selesai") {
        waMessage = `Terimakasih sudah menunggu. Kendaraan Anda dengan No. Polisi ${customerPoliceNumberVal} sudah selesai kami tangani.`;
      } else if (item.status === "dibatalkan") {
        waMessage = "Status servis kendaraan Anda telah Dibatalkan. Berikan Saran dan Kritik Anda melalui nomor ini. Saran dan Kritik yang Anda berikan akan membantu kami untuk menjadi lebih baik. Terimaksih telah berkunjung ke Bengkel Kami!. Hormat Kami.";
      }
    }
    
    // WhatsApp - send to customer's phone number
    const formatWhatsAppNumber = (phone) => {
      if (!phone) return "";
      const digits = phone.replace(/\D/g, "");
      if (digits.startsWith("0")) {
        return "62" + digits.substring(1);
      } else if (digits.startsWith("62")) {
        return digits;
      }
      return "62" + digits;
    };
    const customerWaNumber = customerPhone ? formatWhatsAppNumber(customerPhone) : "";

    // Encode message for WhatsApp - send to customer's number
    const encodedMessage = encodeURIComponent(waMessage);
    const waHref = customerWaNumber ? `https://wa.me/${customerWaNumber}?text=${encodedMessage}` : "#";
    const waDisabled = !customerPhone ? "disabled" : "";
    const waTitle = !customerPhone ? "Nomor HP tidak tersedia" : "Kirim WhatsApp ke Pelanggan";
    
    table.innerHTML += `
      <tr>
        <td>${formatDate(safeTanggal)}</td>
        <td>${customerName}</td>
        <td>${customerPoliceNumber}</td>
        <td>${formatCurrency(item.total)}</td>
        <td>
          <span class="badge bg-${statusInfo.class}">${statusInfo.text}</span>
        </td>
        <td>
          <button class="btn btn-info btn-sm btn-view" data-id="${item.id}" title="Lihat Detail">👁</button>
          ${(item.status === "menunggu" || item.status === "servicing") ? `<button class="btn btn-warning btn-sm btn-edit" data-id="${item.id}" title="Edit Servis">✏</button>` : `<button class="btn btn-secondary btn-sm" disabled title="Tidak dapat edit">✏</button>`}
          ${item.status === "menunggu" ? `<button class="btn btn-primary btn-sm btn-start" data-id="${item.id}" title="Mulai Servis">▶</button>` : ''}
          ${item.status === "servicing" ? `<button class="btn btn-success btn-sm btn-selesai" data-id="${item.id}" title="Tandai Selesai">✓</button>` : ''}
          ${item.status === "menunggu" ? `<button class="btn btn-danger btn-sm btn-cancel" data-id="${item.id}" title="Batalkan Servis">Cancel</button>` : `<button class="btn btn-secondary btn-sm" disabled>Cancel</button>`}
          <a href="${waHref}" class="btn btn-success btn-sm" ${waDisabled} target="_blank" title="${waTitle}">📱</a>
        </td>
      </tr>
    `;
  });
  
  // Render pagination
  renderPagination(totalPages, totalItems);
}

// ======================
// RENDER PAGINATION
// ======================
function renderPagination(totalPages, totalItems) {
  // Check if container exists
  let paginationContainer = document.getElementById("paginationContainer");
  if (!paginationContainer) {
    // Create container if it doesn't exist
    const table = document.getElementById("servisTable");
    if (!table) return;
    
    paginationContainer = document.createElement("div");
    paginationContainer.id = "paginationContainer";
    paginationContainer.className = "d-flex justify-content-between align-items-center mt-3";
    table.parentNode.parentNode.appendChild(paginationContainer);
  }
  
  // Clear container
  paginationContainer.innerHTML = "";
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = `<small class="text-muted">Menampilkan ${totalItems} data</small>`;
    return;
  }
  
  // Info text
  const infoDiv = document.createElement("div");
  infoDiv.innerHTML = `<small class="text-muted">Menampilkan ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} dari ${totalItems} data</small>`;
  
  // Pagination buttons
  const paginationDiv = document.createElement("div");
  paginationDiv.className = "d-flex gap-1";
  
  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = `btn btn-sm btn-outline-secondary ${currentPage === 1 ? "disabled" : ""}`;
  prevBtn.textContent = "‹";
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      const searchInput = document.getElementById("searchServis");
      const statusFilter = document.getElementById("filterStatus");
      renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
    }
  });
  if (currentPage === 1) {
    prevBtn.setAttribute("disabled", "disabled");
  }
  paginationDiv.appendChild(prevBtn);
  
  // Page numbers - show at most 5 pages
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-secondary"}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener("click", () => {
      currentPage = i;
      const searchInput = document.getElementById("searchServis");
      const statusFilter = document.getElementById("filterStatus");
      renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
    });
    paginationDiv.appendChild(pageBtn);
  }
  
  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = `btn btn-sm btn-outline-secondary ${currentPage === totalPages ? "disabled" : ""}`;
  nextBtn.textContent = "›";
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      const searchInput = document.getElementById("searchServis");
      const statusFilter = document.getElementById("filterStatus");
      renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
    }
  });
  if (currentPage === totalPages) {
    nextBtn.setAttribute("disabled", "disabled");
  }
  paginationDiv.appendChild(nextBtn);
  
  paginationContainer.appendChild(infoDiv);
  paginationContainer.appendChild(paginationDiv);
}

// ======================
// EVENT
// ======================
function setupEvent() {
  const btnSave = document.getElementById("saveServis");
  const btnAddItem = document.getElementById("addItem");
  const table = document.getElementById("servisTable");
  const btnClearCustomer = document.getElementById("clearCustomer");
  
  // Clear customer button
  btnClearCustomer.addEventListener("click", () => {
    document.getElementById("customerInput").value = "";
    document.getElementById("customerSelect").value = "";
    document.getElementById("customerNote").style.display = "none";
  });

  // Edit modal event listeners
  const btnEditAddItem = document.getElementById("editAddItem");
  const btnSaveEditServis = document.getElementById("saveEditServis");
  const modalEditServis = document.getElementById("modalEditServis");
  
  btnEditAddItem.addEventListener("click", () => {
    addEditItemRow();
  });
  
  btnSaveEditServis.addEventListener("click", saveEditServis);
  
  // Reset edit form when modal is closed
  modalEditServis.addEventListener("hidden.bs.modal", () => {
    document.getElementById("editItemContainer").innerHTML = "";
    document.getElementById("editServisId").value = "";
  });
  
  // Reset form when modal is closed (cancel or close without saving)
  const modalServis = document.getElementById("modalServis");
  modalServis.addEventListener("hidden.bs.modal", () => {
    resetForm();
  });
  
  // Add item
  btnAddItem.addEventListener("click", addItemRow);
  
  // Save with confirmation
  btnSave.addEventListener("click", () => {
    const { total, items } = calculateTotal();
    const customerInput = document.getElementById("customerInput");
    const customerId = document.getElementById("customerSelect").value;
    const tanggal = document.getElementById("tanggal").value;
    
    // Validation
    let errors = [];
    
    if (!tanggal) {
      document.getElementById("tanggal").classList.add("is-invalid");
      errors.push("• Tanggal belum dipilih");
    } else {
      document.getElementById("tanggal").classList.remove("is-invalid");
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (tanggal < today) {
      document.getElementById("tanggal").classList.add("is-invalid");
      errors.push("• Tidak dapat memilih tanggal yang sudah lewat");
    }
    
    if (!customerId) {
      customerInput.classList.add("is-invalid");
      errors.push("• Pelanggan belum dipilih");
    } else {
      customerInput.classList.remove("is-invalid");
    }
    
    if (items.length === 0) {
      errors.push("• Minimal satu item servis harus ditambahkan");
    }
    
    if (errors.length > 0) {
      alert("Validasi Gagal:\n" + errors.join("\n"));
      return;
    }
    
    // Show confirmation with calculation details
    const customers = getData(CUSTOMER_KEY);
    const customer = customers.find(c => c.id == customerId);
    const parts = getData(PART_KEY);
    
    let confirmationMsg = `Konfirmasi Penyimpanan Servis:\n\n`;
    confirmationMsg += `Pelanggan: ${customer ? customer.name : '-'}\n`;
    confirmationMsg += `Tanggal: ${formatDate(tanggal)}\n\n`;
    confirmationMsg += `Item Servis:\n`;
    
    items.forEach(item => {
      const partName = item.partId ? item.name : `${item.name} (Manual)`;
      confirmationMsg += `• ${partName}: ${formatCurrency(item.price)} x ${item.qty} = ${formatCurrency(item.price * item.qty)}\n`;
    });
    
    confirmationMsg += `\nTotal: ${formatCurrency(total)}\n\n`;
    confirmationMsg += `Lanjutkan menyimpan?`;
    
    if (!confirm(confirmationMsg)) {
      return;
    }
    
    // Check stock availability before saving
    const partData = getData(PART_KEY);
    const stockErrors = [];
    
    items.forEach(item => {
      if (item.partId) {
        const part = partData.find(p => p.id == item.partId);
        if (part) {
          const currentStock = part.qty || 0;
          if (item.qty > currentStock) {
            stockErrors.push(`• ${item.name}: Stok tidak cukup (tersedia: ${currentStock}, diperlukan: ${item.qty})`);
          }
        }
      }
    });
    
    // Stock is NOT reduced here - will be reduced when status changes to "selesai"
    // This allows spareparts to remain available for other servis until job is completed
    
    const newServis = {
      id: generateId(),
      tanggal,
      customerId,
      items,
      total,
      catatan: document.getElementById("catatan").value,
      status: "menunggu"
    };
    
    const data = getData(KEY);
    data.push(newServis);
    saveData(KEY, data);
    
    resetForm();
    const searchInput = document.getElementById("searchServis");
    const statusFilter = document.getElementById("filterStatus");
    renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
    
    // Close modal using Bootstrap
    const modalElement = document.getElementById("modalServis");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  });
  
  // Table action
  table.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    
    if (e.target.classList.contains("btn-delete")) {
      deleteServis(id);
    }
    
    if (e.target.classList.contains("btn-cancel")) {
      cancelServis(id);
    }
    
    if (e.target.classList.contains("btn-selesai")) {
      updateStatus(id, "selesai");
    }
    
    if (e.target.classList.contains("btn-start")) {
      updateStatus(id, "servicing");
    }
    
    if (e.target.classList.contains("btn-view")) {
      showDetail(id);
    }
    
    if (e.target.classList.contains("btn-edit")) {
      showEditModal(id);
    }
  });
}

// ======================
// SHOW EDIT MODAL
// ======================
function showEditModal(id) {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  const parts = getData(PART_KEY);
  
  const servis = data.find(s => s.id == id);
  if (!servis) return;
  
  const customer = customers.find(c => c.id == servis.customerId);
  
  // Set hidden ID
  document.getElementById("editServisId").value = servis.id;
  
  // Set read-only fields
  document.getElementById("editTanggal").value = servis.tanggal;
  document.getElementById("editCustomer").value = customer ? sanitizeHTML(customer.name) : "-";
  
  // Set catatan
  document.getElementById("editCatatan").value = servis.catatan || "";
  
  // Clear and populate items
  const container = document.getElementById("editItemContainer");
  container.innerHTML = "";
  
  // Pass completion status to item row loading for proper max qty calculation
  const wasCompleted = servis.status === "selesai";
  
  // Load existing items
  servis.items.forEach(item => {
    addEditItemRow(item, wasCompleted);
  });
  
  // Calculate initial total
  updateEditTotal();
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("modalEditServis"));
  modal.show();
}

// ======================
// ADD EDIT ITEM ROW
// ======================
function addEditItemRow(existingItem = null, wasCompleted = false) {
  const container = document.getElementById("editItemContainer");
  
  const rowId = "edit-row-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  
  const row = document.createElement("div");
  row.className = "row g-2 mb-2 item-row edit-item-row";
  row.id = rowId;
  row.dataset.rowId = rowId;
  
  // Build datalist options
  let options = ``;
  const allParts = getData(PART_KEY);
  allParts.forEach(p => {
    const safeName = sanitizeHTML(p.name);
    const stock = p.qty || 0;
    const disabled = stock === 0 ? 'disabled' : '';
    // Sanitize stock info to prevent XSS
    const stockText = stock === 0 ? 'Stok: Habis' : `Stok: ${stock}`;
    const safeStockText = sanitizeHTML(stockText);
    options += `<option value="${safeName}" data-id="${p.id}" data-price="${p.price}" data-stock="${stock}" ${disabled}>${safeName} (${safeStockText})</option>`;
  });
  
  const partId = existingItem ? existingItem.partId || "" : "";
  const partName = existingItem ? sanitizeHTML(existingItem.name) : "";
  const price = existingItem ? existingItem.price : "";
  const qty = existingItem ? existingItem.qty : 1;
  
  row.innerHTML = `
    <div class="col-md-4">
      <label class="form-label small">Sparepart</label>
      <div class="input-group">
        <input type="text" class="form-control part-input edit-part-input" placeholder="Cari sparepart..." list="editPartDatalist-${rowId}" value="${partName}">
        <button type="button" class="btn btn-outline-secondary btn-clear-part" title="Hapus pilihan">✕</button>
      </div>
      <datalist id="editPartDatalist-${rowId}">${options}</datalist>
      <input type="hidden" class="part-id edit-part-id" value="${partId}">
      <div class="part-note small mt-1" style="display: none;"></div>
    </div>

    <div class="col-md-3">
      <label class="form-label small">Harga</label>
      <input type="number" class="form-control item-price edit-item-price" placeholder="Harga" min="0" value="${price}" readonly>
    </div>

    <div class="col-md-3">
      <label class="form-label small">Jumlah</label>
      <div class="input-group">
        <button class="btn btn-outline-secondary btn-minus" type="button">-</button>
        <input type="number" class="form-control text-center item-qty edit-item-qty" value="${qty}" min="1">
        <button class="btn btn-outline-secondary btn-plus" type="button">+</button>
      </div>
    </div>

    <div class="col-md-2 d-flex align-items-end">
      <button class="btn btn-danger w-100 btn-remove edit-btn-remove">✕</button>
    </div>
  `;
  
  container.appendChild(row);
  
  // If existing item, set up the initial state
  let qtyInput = row.querySelector(".item-qty");
  if (existingItem) {
    const partNote = row.querySelector(".part-note");
    const allParts = getData(PART_KEY);
    const part = allParts.find(p => p.id == partId);
    if (part) {
      const stock = part.qty || 0;
      partNote.textContent = `Stok tersedia: ${stock}`;
      partNote.style.display = "block";
      // Show red color if stock is low (< 5), green if stock is sufficient (>= 5)
      partNote.className = stock >= 5 ? "part-note small text-success mt-1" : "part-note small text-danger mt-1";
      
      // If was completed, stock was already reduced, so add original qty to available stock
      // If not completed, stock wasn't reduced yet, so use available stock as-is
      qtyInput.max = wasCompleted ? (stock + qty) : stock;
    }
  }
  
  // References
  const partInput = row.querySelector(".part-input");
  const partIdInput = row.querySelector(".part-id");
  const priceInput = row.querySelector(".item-price");
  const partNote = row.querySelector(".part-note");
  const btnPlus = row.querySelector(".btn-plus");
  const btnMinus = row.querySelector(".btn-minus");
  const btnClearPart = row.querySelector(".btn-clear-part");
  const btnRemove = row.querySelector(".btn-remove");
  
  // Handle part selection from datalist
  partInput.addEventListener("input", () => {
    const datalist = row.querySelector(`#editPartDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (selectedOption && !selectedOption.disabled) {
      partIdInput.value = selectedOption.dataset.id;
      priceInput.value = selectedOption.dataset.price;
      
      const stock = parseInt(selectedOption.dataset.stock);
      partNote.textContent = `Stok tersedia: ${stock}`;
      partNote.style.display = "block";
      // Show red color if stock is low (< 5), green if stock is sufficient (>= 5)
      partNote.className = stock >= 5 ? "part-note small text-success mt-1" : "part-note small text-danger mt-1";
      
      // Set max quantity based on stock
      qtyInput.max = stock;
      if (parseInt(qtyInput.value) > stock) {
        qtyInput.value = stock;
      }
    } else if (partInput.value) {
      partIdInput.value = "";
      partNote.textContent = "Sparepart tidak ditemukan";
      partNote.style.display = "block";
      partNote.className = "part-note small text-danger mt-1";
    } else {
      partIdInput.value = "";
      partNote.style.display = "none";
    }
    updateEditTotal();
  });
  
  // Clear part button
  btnClearPart.addEventListener("click", () => {
    partInput.value = "";
    partIdInput.value = "";
    priceInput.value = "";
    qtyInput.value = 1;
    partNote.style.display = "none";
    updateEditTotal();
  });
  
  // Quantity controls
  btnMinus.addEventListener("click", () => {
    let qty = parseInt(qtyInput.value);
    if (qty > 1) {
      qtyInput.value = qty - 1;
      updateEditTotal();
    }
  });
  
  btnPlus.addEventListener("click", () => {
    let qty = parseInt(qtyInput.value);
    if (qty < parseInt(qtyInput.max)) {
      qtyInput.value = qty + 1;
      updateEditTotal();
    }
  });
  
  qtyInput.addEventListener("change", () => {
    let qty = parseInt(qtyInput.value);
    if (qty < 1) qtyInput.value = 1;
    if (qtyInput.max && qty > parseInt(qtyInput.max)) qtyInput.value = qtyInput.max;
    updateEditTotal();
  });
  
  // Remove button
  btnRemove.addEventListener("click", () => {
    row.remove();
    updateEditTotal();
  });
  
  updateEditTotal();
}

// ======================
// UPDATE EDIT TOTAL
// ======================
function updateEditTotal() {
  const container = document.getElementById("editItemContainer");
  const rows = container.querySelectorAll(".edit-item-row");
  let total = 0;
  
  rows.forEach(row => {
    const price = parseInt(row.querySelector(".item-price").value) || 0;
    const qty = parseInt(row.querySelector(".item-qty").value) || 0;
    total += price * qty;
  });
  
  document.getElementById("editTotalDisplay").innerText = formatCurrency(total);
}

// ======================
// GET EDIT ITEMS
// ======================
function getEditItems() {
  const container = document.getElementById("editItemContainer");
  const rows = container.querySelectorAll(".edit-item-row");
  const items = [];
  
  rows.forEach(row => {
    const partId = row.querySelector(".part-id").value;
    const name = row.querySelector(".part-input").value;
    const price = parseInt(row.querySelector(".item-price").value) || 0;
    const qty = parseInt(row.querySelector(".item-qty").value) || 0;
    
    if (name && price > 0 && qty > 0) {
      items.push({ partId, name, price, qty });
    }
  });
  
  return items;
}

// ======================
// SAVE EDIT SERVIS
// ======================
function saveEditServis() {
  const servisId = document.getElementById("editServisId").value;
  const items = getEditItems();
  const catatan = document.getElementById("editCatatan").value;
  
  // Validation
  if (items.length === 0) {
    alert("Minimal satu item servis harus ditambahkan");
    return;
  }
  
  // Calculate total
  let total = 0;
  items.forEach(item => {
    total += item.price * item.qty;
  });
  
  // Get existing servis data
  const data = getData(KEY);
  const oldServis = data.find(s => s.id == servisId);
  
  if (!oldServis) {
    alert("Data servis tidak ditemukan");
    return;
  }
  
  // Confirmation
  if (!confirm(`Konfirmasi Perubahan Servis:\n\nTotal baru: ${formatCurrency(total)}\n\nLanjutkan menyimpan?`)) {
    return;
  }
  
  const wasCompleted = oldServis.status === "selesai";
  
  // Only adjust stock if servis was already completed
  if (wasCompleted) {
    const partData = getData(PART_KEY);
    
    // First, return old items stock
    returnStock(oldServis.items);
    
    // Check stock availability for new items after returning old stock
    const stockErrors = [];
    items.forEach(item => {
      if (item.partId) {
        const part = partData.find(p => p.id == item.partId);
        if (part) {
          const currentStock = part.qty || 0;
          if (item.qty > currentStock) {
            stockErrors.push(`• ${item.name}: Stok tidak cukup (tersedia: ${currentStock}, diperlukan: ${item.qty})`);
          }
        }
      }
    });
    
    // Return old items stock back if there's a stock error
    if (stockErrors.length > 0) {
      // Revert the stock return
      reduceStock(oldServis.items);
      alert("Stok Tidak Mencukupi:\n" + stockErrors.join("\n"));
      return;
    }
    
    // Reduce stock for new items
    reduceStock(items);
  }
  
  // Update servis data
  const servisIndex = data.findIndex(s => s.id == servisId);
  if (servisIndex !== -1) {
    data[servisIndex].items = items;
    data[servisIndex].total = total;
    data[servisIndex].catatan = catatan;
  }
  
  saveData(KEY, data);
  
  // Close modal and refresh table
  const modalElement = document.getElementById("modalEditServis");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
  
  const searchInput = document.getElementById("searchServis");
  const statusFilter = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
}

// ======================
// SHOW DETAIL
// ======================
function showDetail(id) {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  
  const servis = data.find(s => s.id == id);
  if (!servis) return;
  
  const customer = customers.find(c => c.id == servis.customerId);
  
  document.getElementById("detailCustomer").textContent = customer ? customer.name : "-";
  document.getElementById("detailPoliceNumber").textContent = customer ? (customer.policeNumber || "-") : "-";
  document.getElementById("detailVehicleBrand").textContent = customer ? (customer.vehicleBrand || "-") : "-";
  document.getElementById("detailVehicleName").textContent = customer ? (customer.vehicleName || "-") : "-";
  document.getElementById("detailTanggal").textContent = formatDate(servis.tanggal);
  const statusText = servis.status === "selesai" ? "Selesai" : (servis.status === "servicing" ? "Diproses" : (servis.status === "dibatalkan" ? "Dibatalkan" : "Menunggu"));
  document.getElementById("detailStatus").textContent = statusText;
  document.getElementById("detailTotal").textContent = formatCurrency(servis.total);
  
  // Show catatan
  const detailCatatan = document.getElementById("detailCatatan");
  detailCatatan.textContent = servis.catatan || "-";
  
  const itemsList = document.getElementById("detailItems");
  itemsList.innerHTML = servis.items.map(item => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        ${sanitizeHTML(item.name)}
        <small class="d-block text-muted">${formatCurrency(item.price)} x ${item.qty}</small>
      </div>
      <span class="badge bg-primary rounded-pill">${formatCurrency(item.price * item.qty)}</span>
    </li>
  `).join('');
  
  const modal = new bootstrap.Modal(document.getElementById("modalDetail"));
  modal.show();
}

// ======================
// DELETE
// ======================
function deleteServis(id) {
  if (!confirm("Yakin ingin menghapus data servis ini?")) return;
  
  let data = getData(KEY);
  const servis = data.find(s => s.id == id);
  
  // Return stock if servis was completed (selesai)
  if (servis && servis.status === "selesai") {
    returnStock(servis.items);
  }
  
  data = data.filter(item => item.id != id);
  
  saveData(KEY, data);
  const searchInput = document.getElementById("searchServis");
  const statusFilter = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
}

// ======================
// CANCEL SERVIS
// ======================
function cancelServis(id) {
  let data = getData(KEY);
  const servis = data.find(s => s.id == id);
  
  if (!servis) {
    alert("Data servis tidak ditemukan");
    return;
  }
  
  // Stock is only returned if servis was completed (selesai)
  const wasCompleted = servis.status === "selesai";
  let confirmMsg = "Yakin ingin membatalkan servis ini?";
  if (wasCompleted) {
    confirmMsg = "Yakin ingin membatalkan servis ini?\n\nStok sparepart akan dikembalikan.";
  }
  
  if (!confirm(confirmMsg)) return;
  
  // Return stock only if servis was completed
  if (wasCompleted) {
    returnStock(servis.items);
  }
  
  // Update status to dibatalkan
  const servisIndex = data.findIndex(s => s.id == id);
  if (servisIndex !== -1) {
    data[servisIndex].status = "dibatalkan";
  }
  
  saveData(KEY, data);
  const searchInput = document.getElementById("searchServis");
  const statusFilter = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
}

// ======================
// UPDATE STATUS
// ======================
function updateStatus(id, newStatus) {
  let data = getData(KEY);
  const servis = data.find(s => s.id == id);
  
  if (!servis) {
    alert("Data servis tidak ditemukan");
    return;
  }
  
  const oldStatus = servis.status;
  
  // Handle stock when changing to "selesai" (completed)
  if (newStatus === "selesai" && oldStatus !== "selesai") {
    const partData = getData(PART_KEY);
    const stockErrors = [];
    
    // Check stock availability before reducing
    servis.items.forEach(item => {
      if (item.partId) {
        const part = partData.find(p => p.id == item.partId);
        if (part) {
          const currentStock = part.qty || 0;
          if (item.qty > currentStock) {
            stockErrors.push(`• ${item.name}: Stok tidak cukup (tersedia: ${currentStock}, diperlukan: ${item.qty})`);
          }
        }
      }
    });
    
    if (stockErrors.length > 0) {
      alert("Stok Tidak Mencukupi:\n" + stockErrors.join("\n"));
      return;
    }
    
    // Reduce stock for each item
    reduceStock(servis.items);
  }
  
  // Handle stock when changing FROM "selesai" to another status (return stock)
  if (oldStatus === "selesai" && newStatus !== "selesai") {
    returnStock(servis.items);
  }
  
  data = data.map(item => {
    if (item.id == id) item.status = newStatus;
    return item;
  });
  
  saveData(KEY, data);
  const searchInput = document.getElementById("searchServis");
  const statusFilter = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
}

// ======================
// RESET FORM
// ======================
function resetForm() {
  // Reset to today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("tanggal").value = today;
  
  document.getElementById("customerInput").value = "";
  document.getElementById("customerSelect").value = "";
  document.getElementById("itemContainer").innerHTML = "";
  document.getElementById("totalDisplay").innerText = formatCurrency(0);
  document.getElementById("catatan").value = "";
  document.getElementById("customerNote").style.display = "none";
  
  // Remove validation classes
  document.getElementById("tanggal").classList.remove("is-invalid");
  document.getElementById("customerInput").classList.remove("is-invalid");
  
  // Reset customer datalist
  renderCustomerDatalist();
  
  addItemRow();
}

// ======================
// CLOSE MODAL
// ======================
function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalServis")
  );
  if (modal) {
    modal.hide();
  }
}
