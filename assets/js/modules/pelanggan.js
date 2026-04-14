// assets/js/modules/pelanggan.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML } from "../utils.js";

const KEY = "customers";
const SERVIS_KEY = "servis";

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

  table.innerHTML = "";

  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="4" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">📋</p>
        <p>${searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data pelanggan"}</p>
        <small>${searchQuery ? "Coba kata kunci lain" : "Klik tombol 'Tambah' untuk menambahkan pelanggan"}</small>
      </div>
    </td></tr>`;
    return;
  }

  filteredData.forEach((item) => {
    // Sanitize user input before rendering
    const safeName = sanitizeHTML(item.name);
    const safePhone = sanitizeHTML(item.phone);
    const safePolice = sanitizeHTML(item.policeNumber || '-');
    
    table.innerHTML += `
      <tr>
        <td>${safeName}</td>
        <td>${safePhone}</td>
        <td>${safePolice}</td>
        <td>
          <button class="btn btn-warning btn-sm btn-edit" data-id="${item.id}" title="Edit">✏️</button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}" title="Hapus">🗑</button>
        </td>
      </tr>
    `;
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
      return;
    }
    nameInput.classList.remove("is-invalid");

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
        return;
      }
      nameInput.classList.remove("is-invalid");

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
