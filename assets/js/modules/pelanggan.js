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
  const table = document.getElementById("pelangganTable");
  const searchInput = document.getElementById("searchPelanggan");

  // Reset form when modal is closed (cancel or close without saving)
  const modalPelanggan = document.getElementById("modalPelanggan");
  modalPelanggan.addEventListener("hidden.bs.modal", () => {
    clearForm();
    // Remove edit ID
    delete document.getElementById("savePelanggan").dataset.editId;
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
    const nameInput = document.getElementById("namaPelanggan");
    const phoneInput = document.getElementById("noHp");
    const policeInput = document.getElementById("nomorPolisi");
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const policeNumber = policeInput.value.trim();

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

    // Check if editing or adding
    const editId = btnSave.dataset.editId;
    const data = getData(KEY);
    
    if (editId) {
      // Update existing
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
        saveData(KEY, data);
      }
      delete btnSave.dataset.editId;
    } else {
      // Add new
      const newCustomer = {
        id: generateId(),
        name: sanitizedName,
        phone: sanitizedPhone,
        policeNumber: sanitizedPolice
      };
      
      // Check for duplicate name
      const exists = data.some(c => c.name.toLowerCase() === sanitizedName.toLowerCase());
      if (exists) {
        alert("Nama pelanggan sudah ada!");
        return;
      }
      
      data.push(newCustomer);
      saveData(KEY, data);
    }

    clearForm();
    renderTable();
    closeModal();
  });
  
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

  // Set values to form
  document.getElementById("namaPelanggan").value = customer.name;
  document.getElementById("noHp").value = customer.phone || "";
  document.getElementById("nomorPolisi").value = customer.policeNumber || "";
  
  // Set edit ID
  document.getElementById("savePelanggan").dataset.editId = id;
  
  // Update modal title
  document.querySelector("#modalPelanggan .modal-header h5").textContent = "Edit Pelanggan";
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("modalPelanggan"));
  modal.show();
}

// CLEAR FORM
function clearForm() {
  document.getElementById("namaPelanggan").value = "";
  document.getElementById("noHp").value = "";
  document.getElementById("nomorPolisi").value = "";
  
  // Remove validation classes
  document.getElementById("namaPelanggan").classList.remove("is-invalid");
  document.getElementById("noHp").classList.remove("is-invalid");
  
  // Reset modal title
  document.querySelector("#modalPelanggan .modal-header h5").textContent = "Tambah Pelanggan";
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
