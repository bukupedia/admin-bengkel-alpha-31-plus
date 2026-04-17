// assets/js/modules/pelanggan.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML } from "../utils.js";

const KEY = "customers";
const SERVIS_KEY = "servis";

let currentPage = 1;
const ITEMS_PER_PAGE = 10;

// INIT PAGE
export function initPelangganPage() {
  renderTable();
  setupEvent();
}

// RENDER TABLE
function renderTable(searchQuery = "") {
  const data = getData(KEY);
  const table = document.getElementById("pelangganTable");

  let filteredData = data;
  
  // Filter by search query
  if (searchQuery) {
    filteredData = data.filter(item => {
      const name = item.name.toLowerCase();
      const phone = item.phone ? item.phone.toLowerCase() : "";
      const police = item.policeNumber ? item.policeNumber.toLowerCase() : "";
      return name.includes(searchQuery) || phone.includes(searchQuery) || police.includes(searchQuery);
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  table.innerHTML = "";

  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">📋</p>
        <p>${searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data pelanggan"}</p>
        <small>${searchQuery ? "Coba kata kunci lain" : "Klik tombol 'Tambah' untuk menambahkan pelanggan"}</small>
      </div>
    </td></tr>`;
    renderPagination(0, 0, totalPages);
    return;
  }

  paginatedData.forEach((item) => {
    // Sanitize user input before rendering
    const safeName = sanitizeHTML(item.name);
    const safePhone = sanitizeHTML(item.phone);
    const safePolice = sanitizeHTML(item.policeNumber || '-');
    
    // Format WhatsApp URL - add Indonesia country code (62)
    const phoneNumber = item.phone ? item.phone.replace(/[^0-9]/g, '') : '';
    // Remove leading 0 and add Indonesia country code 62
    const waPhoneNumber = phoneNumber.replace(/^0/, '');
    const waUrl = waPhoneNumber ? `https://wa.me/62${waPhoneNumber}` : '#';
    
    table.innerHTML += `
      <tr>
        <td>${safeName}</td>
        <td>${safePhone}</td>
        <td>${safePolice}</td>
        <td>
          <button class="btn btn-info btn-sm btn-detail" data-id="${item.id}" title="Detail">👁️</button>
          <a href="${waUrl}" target="_blank" class="btn btn-success btn-sm btn-whatsapp" data-phone="${item.phone}" title="Kirim WhatsApp" ${!phoneNumber ? 'style="display:none"' : ''}>💬</a>
          <button class="btn btn-warning btn-sm btn-edit" data-id="${item.id}" title="Edit">✏️</button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}" title="Hapus">🗑</button>
        </td>
      </tr>
    `;
  });

  renderPagination(totalPages);
}

// RENDER PAGINATION
function renderPagination(totalPages) {
  // Get or create pagination container
  let paginationContainer = document.getElementById("paginationContainer");
  if (!paginationContainer) {
    const tableWrapper = document.querySelector(".table-responsive");
    if (tableWrapper) {
      paginationContainer = document.createElement("div");
      paginationContainer.id = "paginationContainer";
      paginationContainer.className = "d-flex justify-content-between align-items-center mt-3";
      paginationContainer.innerHTML = `
        <div id="paginationInfo" class="text-muted"></div>
        <nav><ul class="pagination mb-0" id="paginationList"></ul></nav>
      `;
      tableWrapper.appendChild(paginationContainer);
    }
  }
  
  const paginationList = document.getElementById("paginationList");
  const paginationInfo = document.getElementById("paginationInfo");
  
  if (totalPages <= 1) {
    paginationList.innerHTML = "";
    paginationInfo.textContent = "";
    return;
  }
  
  // Get current filtered data
  const searchQuery = document.getElementById("searchPelanggan")?.value.toLowerCase() || "";
  const data = getData(KEY);
  let filteredData = data;
  
  if (searchQuery) {
    filteredData = data.filter(item => {
      const name = item.name.toLowerCase();
      const phone = item.phone ? item.phone.toLowerCase() : "";
      const police = item.policeNumber ? item.policeNumber.toLowerCase() : "";
      return name.includes(searchQuery) || phone.includes(searchQuery) || police.includes(searchQuery);
    });
  }
  
  const totalItems = filteredData.length;
  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
  
  paginationInfo.textContent = `Menampilkan ${start} - ${end} dari ${totalItems} data`;
  
  let paginationHTML = "";
  
  // Previous button
  paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${currentPage - 1}">Sebelumnya</a>
  </li>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }
  
  // Next button
  paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${currentPage + 1}">Selanjutnya</a>
  </li>`;
  
  paginationList.innerHTML = paginationHTML;
  
  // Add click handlers
  paginationList.querySelectorAll(".page-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = parseInt(e.target.dataset.page);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        renderTable(searchQuery);
      }
    });
  });
}

// SETUP EVENT
function setupEvent() {
  const btnSave = document.getElementById("savePelanggan");
  const btnSaveEdit = document.getElementById("saveEditPelanggan");
  const table = document.getElementById("pelangganTable");
  const searchInput = document.getElementById("searchPelanggan");

  // Reset form when modal is closed (cancel or close without saving)
  const modalPelanggan = document.getElementById("modalPelanggan");
  modalPelanggan.addEventListener("hidden.bs.modal", () => {
    clearForm();
    // Remove edit ID
    delete document.getElementById("savePelanggan").dataset.editId;
  });

  // Reset edit modal when closed
  const modalEditPelanggan = document.getElementById("modalEditPelanggan");
  if (modalEditPelanggan) {
    modalEditPelanggan.addEventListener("hidden.bs.modal", () => {
      clearEditForm();
      delete document.getElementById("saveEditPelanggan").dataset.editId;
    });
  }

  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1; // Reset to first page on search
      const query = e.target.value.toLowerCase();
      renderTable(query);
    }, 300);
  });

  // Save new customer
  btnSave.addEventListener("click", () => {
    const nameInput = document.getElementById("namaPelanggan");
    const phoneInput = document.getElementById("noHp");
    const policeInput = document.getElementById("nomorPolisi");
    const vehicleBrandInput = document.getElementById("vehicleBrand");
    const vehicleNameInput = document.getElementById("vehicleName");
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const policeNumber = policeInput.value.trim();
    const vehicleBrand = vehicleBrandInput.value.trim();
    const vehicleName = vehicleNameInput.value.trim();

    // Validation - ensure required fields are filled
    if (!name || name.length === 0) {
      nameInput.classList.add("is-invalid");
      alert("Nama wajib diisi");
      return;
    }
    nameInput.classList.remove("is-invalid");

    // Validate phone is required
    if (!phone || phone.length === 0) {
      phoneInput.classList.add("is-invalid");
      alert("No. HP wajib diisi");
      return;
    }
    phoneInput.classList.remove("is-invalid");

    // Validate police number is required
    if (!policeNumber || policeNumber.length === 0) {
      policeInput.classList.add("is-invalid");
      alert("Nomor Polisi Kendaraan wajib diisi");
      return;
    }
    policeInput.classList.remove("is-invalid");

    // Validate phone format (allow digits, spaces, dashes, parentheses)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (phone && !phoneRegex.test(phone)) {
      phoneInput.classList.add("is-invalid");
      return;
    }
    phoneInput.classList.remove("is-invalid");

    // Additional sanitization: trim and limit length
    const sanitizedName = name.substring(0, 100).replace(/[<>]/g, "");
    const sanitizedPhone = phone ? phone.substring(0, 20) : "";
    const sanitizedPolice = policeNumber ? policeNumber.substring(0, 15) : "";
    const sanitizedVehicleBrand = vehicleBrand ? vehicleBrand.substring(0, 50) : "";
    const sanitizedVehicleName = vehicleName ? vehicleName.substring(0, 50) : "";

    // Add new
    const newCustomer = {
      id: generateId(),
      name: sanitizedName,
      phone: sanitizedPhone,
      policeNumber: sanitizedPolice,
      vehicleBrand: sanitizedVehicleBrand,
      vehicleName: sanitizedVehicleName
    };
    
    // Check for duplicate name
    const data = getData(KEY);
    const exists = data.some(c => c.name.toLowerCase() === sanitizedName.toLowerCase());
    if (exists) {
      alert("Nama pelanggan sudah ada!");
      return;
    }
    
    data.push(newCustomer);
    saveData(KEY, data);

    clearForm();
    renderTable();
    closeModal();
  });

  // Save edited customer
  if (btnSaveEdit) {
    btnSaveEdit.addEventListener("click", () => {
      const editId = btnSaveEdit.dataset.editId;
      if (!editId) return;

      const nameInput = document.getElementById("editNamaPelanggan");
      const phoneInput = document.getElementById("editNoHp");
      const policeInput = document.getElementById("editNomorPolisi");
      const vehicleBrandInput = document.getElementById("editVehicleBrand");
      const vehicleNameInput = document.getElementById("editVehicleName");
      
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const policeNumber = policeInput.value.trim();
      const vehicleBrand = vehicleBrandInput.value.trim();
      const vehicleName = vehicleNameInput.value.trim();

      // Validation - ensure required fields are filled
      if (!name || name.length === 0) {
        nameInput.classList.add("is-invalid");
        alert("Nama wajib diisi");
        return;
      }
      nameInput.classList.remove("is-invalid");

      // Validate phone is required
      if (!phone || phone.length === 0) {
        phoneInput.classList.add("is-invalid");
        alert("No. HP wajib diisi");
        return;
      }
      phoneInput.classList.remove("is-invalid");

      // Validate police number is required
      if (!policeNumber || policeNumber.length === 0) {
        policeInput.classList.add("is-invalid");
        alert("Nomor Polisi Kendaraan wajib diisi");
        return;
      }
      policeInput.classList.remove("is-invalid");

      // Validate phone format (allow digits, spaces, dashes, parentheses)
      const phoneRegex = /^[\d\s\-\(\)]+$/;
      if (phone && !phoneRegex.test(phone)) {
        phoneInput.classList.add("is-invalid");
        return;
      }
      phoneInput.classList.remove("is-invalid");

      // Additional sanitization: trim and limit length
      const sanitizedName = name.substring(0, 100).replace(/[<>]/g, "");
      const sanitizedPhone = phone ? phone.substring(0, 20) : "";
      const sanitizedPolice = policeNumber ? policeNumber.substring(0, 15) : "";
      const sanitizedVehicleBrand = vehicleBrand ? vehicleBrand.substring(0, 50) : "";
      const sanitizedVehicleName = vehicleName ? vehicleName.substring(0, 50) : "";

      // Update existing
      const data = getData(KEY);
      const index = data.findIndex(c => c.id == editId);
      if (index !== -1) {
        // Check for duplicate name (excluding current)
        const exists = data.some(c => c.name.toLowerCase() === sanitizedName.toLowerCase() && c.id != editId);
        if (exists) {
          alert("Nama pelanggan sudah ada!");
          return;
        }
        data[index].name = sanitizedName;
        data[index].phone = sanitizedPhone;
        data[index].policeNumber = sanitizedPolice;
        data[index].vehicleBrand = sanitizedVehicleBrand;
        data[index].vehicleName = sanitizedVehicleName;
        saveData(KEY, data);
      }

      clearEditForm();
      renderTable();
      closeEditModal();
    });
  }
  
  // Table events
  table.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      deleteCustomer(id);
    }
    
    if (e.target.classList.contains("btn-edit")) {
      const id = e.target.dataset.id;
      editCustomer(id);
    }
    
    if (e.target.classList.contains("btn-detail")) {
      const id = e.target.dataset.id;
      showCustomerDetail(id);
    }
  });
}

// DELETE CUSTOMER
function deleteCustomer(id) {
  // Check if customer has related servis records
  const servisData = getData(SERVIS_KEY);
  const relatedServis = servisData.filter(s => s.customerId == id);
  
  let confirmMessage = "Yakin ingin menghapus pelanggan ini?";
  if (relatedServis.length > 0) {
    confirmMessage = `Pelanggan ini memiliki ${relatedServis.length} record servis terkait.\nHapus pelanggan akan menyebabkan data servis tidak dapat ditampilkan dengan benar.\n\nApakah Anda tetap ingin menghapus?`;
  }
  
  if (!confirm(confirmMessage)) return;
  
  let data = getData(KEY);
  data = data.filter(item => item.id != id);
  saveData(KEY, data);
  renderTable();
}

// EDIT CUSTOMER
function editCustomer(id) {
  const data = getData(KEY);
  const customer = data.find(c => c.id == id);
  if (!customer) return;

  // Set values to edit form
  document.getElementById("editPelangganId").value = id;
  document.getElementById("editNamaPelanggan").value = customer.name || "";
  document.getElementById("editNoHp").value = customer.phone || "";
  document.getElementById("editNomorPolisi").value = customer.policeNumber || "";
  document.getElementById("editVehicleBrand").value = customer.vehicleBrand || "";
  document.getElementById("editVehicleName").value = customer.vehicleName || "";
  
  // Set edit ID
  document.getElementById("saveEditPelanggan").dataset.editId = id;
  
  // Show edit modal
  const modal = new bootstrap.Modal(document.getElementById("modalEditPelanggan"));
  modal.show();
}

// CLEAR FORM
function clearForm() {
  document.getElementById("namaPelanggan").value = "";
  document.getElementById("noHp").value = "";
  document.getElementById("nomorPolisi").value = "";
  document.getElementById("vehicleBrand").value = "";
  document.getElementById("vehicleName").value = "";
  
  // Remove validation classes
  document.getElementById("namaPelanggan").classList.remove("is-invalid");
  document.getElementById("noHp").classList.remove("is-invalid");
  document.getElementById("nomorPolisi").classList.remove("is-invalid");
  
  // Reset modal title
  document.querySelector("#modalPelanggan .modal-header h5").textContent = "Tambah Pelanggan";
}

// CLEAR EDIT FORM
function clearEditForm() {
  document.getElementById("editPelangganId").value = "";
  document.getElementById("editNamaPelanggan").value = "";
  document.getElementById("editNoHp").value = "";
  document.getElementById("editNomorPolisi").value = "";
  document.getElementById("editVehicleBrand").value = "";
  document.getElementById("editVehicleName").value = "";
  
  // Remove validation classes
  document.getElementById("editNamaPelanggan").classList.remove("is-invalid");
  document.getElementById("editNoHp").classList.remove("is-invalid");
  document.getElementById("editNomorPolisi").classList.remove("is-invalid");
}

// CLOSE MODAL
function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalPelanggan")
  );
  if (modal) {
    modal.hide();
  }
  
  // Reset form when modal is closed
  clearForm();
  
  // Remove edit ID
  delete document.getElementById("savePelanggan").dataset.editId;
}

// CLOSE EDIT MODAL
function closeEditModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalEditPelanggan")
  );
  if (modal) {
    modal.hide();
  }
  
  // Reset form when modal is closed
  clearEditForm();
  
  // Remove edit ID
  delete document.getElementById("saveEditPelanggan").dataset.editId;
}

// SHOW CUSTOMER DETAIL
function showCustomerDetail(id) {
  const data = getData(KEY);
  const customer = data.find(c => c.id == id);
  if (!customer) return;

  // Get servis history for this customer - only count those with status "selesai"
  const servisData = getData(SERVIS_KEY);
  const customerServis = servisData.filter(s => s.customerId == id && s.status === "selesai");

  const detailContent = document.getElementById("detailContent");
  if (!detailContent) return;

  detailContent.innerHTML = `
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label fw-bold">Nama</label>
        <p class="mb-0">${sanitizeHTML(customer.name)}</p>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label fw-bold">No. HP</label>
        <p class="mb-0">${sanitizeHTML(customer.phone || '-')}</p>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label fw-bold">Nomor Polisi</label>
        <p class="mb-0">${sanitizeHTML(customer.policeNumber || '-')}</p>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label fw-bold">Merek Kendaraan</label>
        <p class="mb-0">${sanitizeHTML(customer.vehicleBrand || '-')}</p>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label fw-bold">Nama Kendaraan</label>
        <p class="mb-0">${sanitizeHTML(customer.vehicleName || '-')}</p>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label fw-bold">Total Servis</label>
        <p class="mb-0">${customerServis.length} kali</p>
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById("modalDetailPelanggan"));
  modal.show();
}
