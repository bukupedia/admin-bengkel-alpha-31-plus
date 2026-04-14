// assets/js/utils.js

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sanitize HTML to prevent XSS attacks
export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Format currency to Indonesian Rupiah
export function formatCurrency(amount) {
  return "Rp " + parseInt(amount || 0).toLocaleString("id-ID");
}

// Format date to Indonesian format
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
