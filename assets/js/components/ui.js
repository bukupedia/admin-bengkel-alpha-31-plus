// assets/js/components/ui.js - Reusable UI Components

// ======================
// TOAST NOTIFICATIONS
// ======================
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close" aria-label="Tutup">&times;</button>
  `;
  
  container.appendChild(toast);
  
  // Close button handler
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Auto remove after duration
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.style.animation = 'slideOut 0.3s ease-out forwards';
  setTimeout(() => toast.remove(), 300);
}

// ======================
// CONFIRMATION DIALOG
// ======================
export function showConfirm(title, message, onConfirm, icon = '⚠️') {
  // Create modal if not exists
  let modalEl = document.getElementById('confirmDialog');
  
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'confirmDialog';
    modalEl.className = 'modal fade';
    modalEl.setAttribute('tabindex', '-1');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="confirm-modal-body">
            <div class="confirm-modal-icon"></div>
            <h5 class="confirm-modal-title"></h5>
            <p class="confirm-modal-message"></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" id="confirmBtn">Ya, Hapus</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }
  
  const iconEl = modalEl.querySelector('.confirm-modal-icon');
  const titleEl = modalEl.querySelector('.confirm-modal-title');
  const messageEl = modalEl.querySelector('.confirm-modal-message');
  const confirmBtn = modalEl.querySelector('#confirmBtn');
  
  // Set content
  iconEl.textContent = icon;
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  // Remove old event listener
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  // Add new event listener
  newConfirmBtn.addEventListener('click', () => {
    onConfirm();
    bootstrap.Modal.getInstance(modalEl)?.hide();
  });
  
  // Show modal
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// ======================
// LOADING OVERLAY
// ======================
export function showLoading(message = 'Memuat...') {
  let overlay = document.querySelector('.loading-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    document.body.appendChild(overlay);
  }
  
  overlay.innerHTML = `
    <div class="text-center">
      <div class="loading-spinner lg mb-3"></div>
      <p class="mb-0">${message}</p>
    </div>
  `;
  
  overlay.style.display = 'flex';
  return overlay;
}

export function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// ======================
// ALERT DIALOG
// ======================
export function showAlert(title, message, type = 'info') {
  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  showConfirm(title, message, () => {}, iconMap[type] || 'ℹ️');
}

// ======================
// FORM VALIDATION HELPER
// ======================
export function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  const inputs = form.querySelectorAll('[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('is-invalid');
      isValid = false;
    } else {
      input.classList.remove('is-invalid');
    }
  });
  
  return isValid;
}

// ======================
// CLEAR FORM
// ======================
export function clearForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  form.querySelectorAll('input, textarea, select').forEach(input => {
    if (input.type === 'checkbox' || input.type === 'radio') {
      input.checked = false;
    } else if (input.tagName === 'SELECT') {
      input.selectedIndex = 0;
    } else {
      input.value = '';
    }
    input.classList.remove('is-invalid');
  });
}

// ======================
// DEBOUNCE HELPER
// ======================
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ======================
// THEME TOGGLE
// ======================
const THEME_KEY = 'theme';

export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  return savedTheme;
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
  return newTheme;
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}