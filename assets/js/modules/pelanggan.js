// assets/js/modules/pelanggan.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML } from "../utils.js";

const KEY = "customers";
const SERVIS_KEY = "servis";
const ACTIVITY_KEY = "activity_log";

let currentPage = 1;
const ITEMS_PER_PAGE = 10;

// ======================
// ACTIVITY LOGGING
// ======================
function logActivity(type, action, description, data = {}) {
  const activities = getData(ACTIVITY_KEY) || [];
  const activity = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    type,
    action,
    description,
    data,
    timestamp: new Date().toISOString()
  };
  activities.unshift(activity);
  if (activities.length > 100) {
    activities.pop();
  }
  saveData(ACTIVITY_KEY, activities);
}

// INIT PAGE
export function initPelangganPage() {
  migrateCustomerData(); // Migrate old data to new structure
  renderTable();
  setupEvent();
}

// MIGRATE CUSTOMER DATA - Convert old structure to new vehicles array
function migrateCustomerData() {
  const data = getData(KEY);
  let needsSave = false;
  
  const migratedData = data.map(customer => {
    // If customer already has vehicles array, skip
    if (customer.vehicles && Array.isArray(customer.vehicles)) {
      return customer;
    }
    
    // If customer has old vehicle fields, convert to vehicles array
    if (customer.policeNumber || customer.vehicleBrand || customer.vehicleName) {
      needsSave = true;
      return {
        ...customer,
        vehicles: [{
          id: generateId(),
          policeNumber: customer.policeNumber || "",
          vehicleBrand: customer.vehicleBrand || "",
          vehicleName: customer.vehicleName || ""
        }],
        // Keep old fields for backward compatibility temporarily
        _migrated: true
      };
    }
    
    // Customer with no vehicles - initialize empty array
    needsSave = true;
    return {
      ...customer,
      vehicles: []
    };
  });
  
  if (needsSave) {
    saveData(KEY, migratedData);
  }
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
      // Also search in vehicles
      const vehicleMatch = item.vehicles && item.vehicles.some(v => 
        (v.policeNumber && v.policeNumber.toLowerCase().includes(searchQuery))
      );
      return name.includes(searchQuery) || phone.includes(searchQuery) || vehicleMatch;
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
    // Get first vehicle police number for display
    const firstVehicle = item.vehicles && item.vehicles.length > 0 ? item.vehicles[0] : null;
    const safePolice = firstVehicle ? sanitizeHTML(firstVehicle.policeNumber) : '-';
    const vehicleCount = item.vehicles ? item.vehicles.length : 0;
    
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
        <td><span class="badge bg-secondary">${vehicleCount} kendaraan</span></td>
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
      // Also search in vehicles
      const vehicleMatch = item.vehicles && item.vehicles.some(v => 
        (v.policeNumber && v.policeNumber.toLowerCase().includes(searchQuery))
      );
      return name.includes(searchQuery) || phone.includes(searchQuery) || vehicleMatch;
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
  
  // Clear search button
  const clearSearchBtn = document.getElementById("clearSearchPelanggan");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentPage = 1;
      renderTable("");
    });
  }

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

    // Add new customer with vehicles array
    const newCustomer = {
      id: generateId(),
      name: sanitizedName,
      phone: sanitizedPhone,
      vehicles: [{
        id: generateId(),
        policeNumber: sanitizedPolice,
        vehicleBrand: sanitizedVehicleBrand,
        vehicleName: sanitizedVehicleName
      }]
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
    
    // Log activity
    logActivity("pelanggan", "create", "Pelanggan baru: " + sanitizedName, { customerId: newCustomer.id });
    
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

      // Update existing - maintain vehicles array structure
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
        
        // Update first vehicle or create new vehicles array
        if (!data[index].vehicles) {
          data[index].vehicles = [];
        }
        if (data[index].vehicles.length > 0) {
          data[index].vehicles[0].policeNumber = sanitizedPolice;
          data[index].vehicles[0].vehicleBrand = sanitizedVehicleBrand;
          data[index].vehicles[0].vehicleName = sanitizedVehicleName;
        } else {
          data[index].vehicles.push({
            id: generateId(),
            policeNumber: sanitizedPolice,
            vehicleBrand: sanitizedVehicleBrand,
            vehicleName: sanitizedVehicleName
          });
        }
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
  
  // Log activity
  logActivity("pelanggan", "delete", "Hapus pelanggan", { customerId: id });
  
  renderTable();
}

// EDIT CUSTOMER
function editCustomer(id) {
  const data = getData(KEY);
  const customer = data.find(c => c.id == id);
  if (!customer) return;

  // Get first vehicle for edit form
  const firstVehicle = customer.vehicles && customer.vehicles.length > 0 ? customer.vehicles[0] : null;

  // Set values to edit form
  document.getElementById("editPelangganId").value = id;
  document.getElementById("editNamaPelanggan").value = customer.name || "";
  document.getElementById("editNoHp").value = customer.phone || "";
  document.getElementById("editNomorPolisi").value = firstVehicle ? firstVehicle.policeNumber || "" : "";
  document.getElementById("editVehicleBrand").value = firstVehicle ? firstVehicle.vehicleBrand || "" : "";
  document.getElementById("editVehicleName").value = firstVehicle ? firstVehicle.vehicleName || "" : "";
  
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

  // Build vehicles list HTML
  const vehicles = customer.vehicles || [];
  let vehiclesHTML = '';
  if (vehicles.length > 0) {
    vehiclesHTML = vehicles.map((v, index) => `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>Kendaraan ${index + 1}</strong><br>
              <small>
                ${sanitizeHTML(v.policeNumber || '-')} - ${sanitizeHTML(v.vehicleBrand || '-')} ${sanitizeHTML(v.vehicleName || '-')}
              </small>
            </div>
            <button class="btn btn-sm btn-outline-danger btn-delete-vehicle" data-customer-id="${customer.id}" data-vehicle-index="${index}" title="Hapus Kendaraan">🗑</button>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    vehiclesHTML = '<p class="text-muted">Belum ada kendaraan terdaftar</p>';
  }

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
        <label class="form-label fw-bold">Total Servis</label>
        <p class="mb-0">${customerServis.length} kali</p>
      </div>
    </div>
    <hr>
    <div class="mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">Kendaraan (${vehicles.length})</h6>
        <button class="btn btn-sm btn-primary btn-add-vehicle" data-customer-id="${customer.id}">+ Tambah Kendaraan</button>
      </div>
      ${vehiclesHTML}
    </div>
  `;

  // Add event listener for add vehicle button
  const addVehicleBtn = detailContent.querySelector(".btn-add-vehicle");
  if (addVehicleBtn) {
    addVehicleBtn.addEventListener("click", () => {
      showAddVehicleModal(customer.id);
    });
  }

  // Add event listeners for delete vehicle buttons
  detailContent.querySelectorAll(".btn-delete-vehicle").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const customerId = e.target.dataset.customerId;
      const vehicleIndex = parseInt(e.target.dataset.vehicleIndex);
      deleteVehicle(customerId, vehicleIndex);
    });
  });

  const modal = new bootstrap.Modal(document.getElementById("modalDetailPelanggan"));
  modal.show();
}

// ADD VEHICLE MODAL
function showAddVehicleModal(customerId) {
  // Create modal if not exists
  let modalAddVehicle = document.getElementById("modalAddVehicle");
  if (!modalAddVehicle) {
    const modalHtml = `
      <div class="modal fade" id="modalAddVehicle">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5>Tambah Kendaraan</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="hidden" id="addVehicleCustomerId">
              <input id="addVehiclePoliceNumber" class="form-control mb-2" placeholder="Nomor Polisi Kendaraan" required>
              <input id="addVehicleBrand" class="form-control mb-2" placeholder="Merek Kendaraan: Honda, Yamaha, Suzuki...">
              <input id="addVehicleName" class="form-control" placeholder="Nama Kendaraan: Beat, Mio, Nex...">
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button class="btn btn-primary" id="saveAddVehicle">Simpan</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    modalAddVehicle = document.getElementById("modalAddVehicle");
  }

  // Set customer ID
  document.getElementById("addVehicleCustomerId").value = customerId;

  // Clear form
  document.getElementById("addVehiclePoliceNumber").value = "";
  document.getElementById("addVehicleBrand").value = "";
  document.getElementById("addVehicleName").value = "";
  document.getElementById("addVehiclePoliceNumber").classList.remove("is-invalid");

  // Show modal
  const modal = new bootstrap.Modal(modalAddVehicle);
  modal.show();

  // Setup save event
  const saveBtn = document.getElementById("saveAddVehicle");
  const newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

  newSaveBtn.addEventListener("click", () => {
    const custId = document.getElementById("addVehicleCustomerId").value;
    const policeInput = document.getElementById("addVehiclePoliceNumber");
    const brandInput = document.getElementById("addVehicleBrand");
    const nameInput = document.getElementById("addVehicleName");

    const policeNumber = policeInput.value.trim();
    const vehicleBrand = brandInput.value.trim();
    const vehicleName = nameInput.value.trim();

    // Validate police number is required
    if (!policeNumber || policeNumber.length === 0) {
      policeInput.classList.add("is-invalid");
      alert("Nomor Polisi Kendaraan wajib diisi");
      return;
    }
    policeInput.classList.remove("is-invalid");

    // Sanitize
    const sanitizedPolice = policeNumber.substring(0, 15).replace(/[<>]/g, "");
    const sanitizedBrand = vehicleBrand ? vehicleBrand.substring(0, 50).replace(/[<>]/g, "") : "";
    const sanitizedName = vehicleName ? vehicleName.substring(0, 50).replace(/[<>]/g, "") : "";

    // Add vehicle to customer
    const data = getData(KEY);
    const customerIndex = data.findIndex(c => c.id == custId);
    if (customerIndex !== -1) {
      if (!data[customerIndex].vehicles) {
        data[customerIndex].vehicles = [];
      }
      data[customerIndex].vehicles.push({
        id: generateId(),
        policeNumber: sanitizedPolice,
        vehicleBrand: sanitizedBrand,
        vehicleName: sanitizedName
      });
      saveData(KEY, data);

      // Close modal and refresh detail
      const modalInstance = bootstrap.Modal.getInstance(modalAddVehicle);
      if (modalInstance) {
        modalInstance.hide();
      }
      showCustomerDetail(custId);
      renderTable();
    }
  });
}

// DELETE VEHICLE
function deleteVehicle(customerId, vehicleIndex) {
  const customer = getData(KEY).find(c => c.id == customerId);
  if (!customer || !customer.vehicles || customer.vehicles.length === 0) return;

  const vehicle = customer.vehicles[vehicleIndex];
  const confirmMessage = `Hapus kendaraan ${vehicle.policeNumber || 'ini'}?`;

  if (!confirm(confirmMessage)) return;

  const data = getData(KEY);
  const index = data.findIndex(c => c.id == customerId);
  if (index !== -1) {
    data[index].vehicles.splice(vehicleIndex, 1);
    saveData(KEY, data);

    // Refresh detail view
    showCustomerDetail(customerId);
    renderTable();
  }
}
