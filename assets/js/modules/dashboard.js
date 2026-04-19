// assets/js/modules/dashboard.js

import { getData } from "../storage.js";
import { formatCurrency, sanitizeHTML, getTodayString } from "../utils.js";

const SERVIS_KEY = "servis";
const CUSTOMER_KEY = "customers";
const PART_KEY = "parts";

// INIT
export function initDashboardPage() {
  loadDashboardData();
}

// ======================
// LOAD DASHBOARD DATA
// ======================
function loadDashboardData() {
  const allServisData = getData(SERVIS_KEY);
  const customerData = getData(CUSTOMER_KEY);
  const partData = getData(PART_KEY);
  
  // Filter servis data for today only
  const today = getTodayString();
  const servisData = allServisData.filter(s => s.tanggal === today);
  
  // Calculate total servis (today)
  const totalServis = servisData.length;
  
  // Calculate counts by status (today)
  const servisMenunggu = servisData.filter(s => s.status === "menunggu").length;
  const servisDiproses = servisData.filter(s => s.status === "servicing").length;
  const servisSelesai = servisData.filter(s => s.status === "selesai").length;
  const servisDibatalkan = servisData.filter(s => s.status === "dibatalkan").length;
  
  // Calculate total pendapatan (today, only from completed ones)
  const totalPendapatan = servisData
    .filter(s => s.status === "selesai")
    .reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Calculate total customers created today
  const todayCustomers = customerData.filter(c => c.createdAt && c.createdAt.startsWith(today));
  const totalPelanggan = todayCustomers.length;
  
  // Calculate total sparepart
  const totalSparepart = partData.length;
  
  // Update UI - Hari Ini
  document.getElementById("totalServis").textContent = totalServis;
  document.getElementById("servisMenunggu").textContent = servisMenunggu;
  document.getElementById("servisDiproses").textContent = servisDiproses;
  document.getElementById("servisSelesai").textContent = servisSelesai;
  document.getElementById("servisDibatalkan").textContent = servisDibatalkan;
  document.getElementById("totalPelanggan").textContent = totalPelanggan;
  document.getElementById("totalPendapatan").textContent = formatCurrency(totalPendapatan);
  
  // Add animation for status counts
  animateValue("totalServis", 0, totalServis, 500);
  animateValue("servisMenunggu", 0, servisMenunggu, 500);
  animateValue("servisDiproses", 0, servisDiproses, 500);
  animateValue("servisSelesai", 0, servisSelesai, 500);
  animateValue("servisDibatalkan", 0, servisDibatalkan, 500);
  animateValue("totalPelanggan", 0, totalPelanggan, 500);
  
  // Render recent servis (all, not just today)
  renderRecentServis(allServisData);
  
  // Render low stock parts
  renderLowStockParts(partData);
  
  // Render top selling parts
  renderTopSellingParts();
  renderTopSellingPartsToday();
  
  // Render top customers
  renderTopCustomers(allServisData, customerData);
  
  // ======================
  // LOAD OVERALL DATA (Keseluruhan)
  // ======================
  loadOverallData(allServisData, customerData, partData);
}

// ======================
// LOAD OVERALL DATA (Keseluruhan)
// ======================
function loadOverallData(allServisData, customerData, partData) {
  // Calculate overall total servis
  const totalServisOverall = allServisData.length;
  
  // Calculate counts by status (overall)
  const servisMenungguOverall = allServisData.filter(s => s.status === "menunggu").length;
  const servisDiprosesOverall = allServisData.filter(s => s.status === "servicing").length;
  const servisSelesaiOverall = allServisData.filter(s => s.status === "selesai").length;
  const servisDibatalkanOverall = allServisData.filter(s => s.status === "dibatalkan").length;
  
  // Calculate total pendapatan (overall, only from completed ones)
  const totalPendapatanOverall = allServisData
    .filter(s => s.status === "selesai")
    .reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Calculate total customers (overall)
  const totalPelangganOverall = customerData.length;
  
  // Update UI - Keseluruhan
  document.getElementById("totalServisOverall").textContent = totalServisOverall;
  document.getElementById("servisMenungguOverall").textContent = servisMenungguOverall;
  document.getElementById("servisDiprosesOverall").textContent = servisDiprosesOverall;
  document.getElementById("servisSelesaiOverall").textContent = servisSelesaiOverall;
  document.getElementById("servisDibatalkanOverall").textContent = servisDibatalkanOverall;
  document.getElementById("totalPelangganOverall").textContent = totalPelangganOverall;
  document.getElementById("totalPendapatanOverall").textContent = formatCurrency(totalPendapatanOverall);
  
  // Add animation for overall status counts
  animateValue("totalServisOverall", 0, totalServisOverall, 500);
  animateValue("servisMenungguOverall", 0, servisMenungguOverall, 500);
  animateValue("servisDiprosesOverall", 0, servisDiprosesOverall, 500);
  animateValue("servisSelesaiOverall", 0, servisSelesaiOverall, 500);
  animateValue("servisDibatalkanOverall", 0, servisDibatalkanOverall, 500);
  animateValue("totalPelangganOverall", 0, totalPelangganOverall, 500);
}

// ======================
// ANIMATE COUNTER
// ======================
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  
  // Don't animate for currency values, just set directly
  if (obj.textContent.includes("Rp")) {
    obj.textContent = formatCurrency(end);
    return;
  }
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ======================
// RENDER RECENT SERVIS
// ======================
function renderRecentServis(data) {
  const container = document.getElementById("recentServis");
  if (!container) return;
  
  // Sort by date (newest first) and take last 5
  const recentData = [...data]
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 5);
  
  if (recentData.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="mb-1">📋</p>
        <p>Belum ada data servis</p>
        <small>Mulai menambahkan servis di halaman Servis</small>
      </div>
    `;
    return;
  }
  
  const customers = getData(CUSTOMER_KEY);
  
  container.innerHTML = recentData.map(item => {
    const customer = customers.find(c => c.id == item.customerId);
    const customerName = customer ? sanitizeHTML(customer.name) : "-";
    const policeNumber = customer ? sanitizeHTML(customer.policeNumber || "-") : "-";
    
    // Status mapping synced with servis.js
    const statusMap = {
      "menunggu": { class: "secondary", text: "Menunggu" },
      "servicing": { class: "warning", text: "Diproses" },
      "selesai": { class: "success", text: "Selesai" },
      "dibatalkan": { class: "danger", text: "Dibatalkan" }
    };
    const statusInfo = statusMap[item.status] || statusMap.menunggu;
    
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${customerName}</strong>
              <br>
              <small class="text-muted">${policeNumber} • ${sanitizeHTML(item.tanggal)}</small>
            </div>
            <div class="text-end">
              <div class="fw-bold">${formatCurrency(item.total)}</div>
              <span class="badge bg-${statusInfo.class}">${statusInfo.text}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ======================
// RENDER LOW STOCK PARTS
// ======================
function renderLowStockParts(data) {
  const container = document.getElementById("lowStockParts");
  if (!container) return;
  
  // Filter parts with stock less than 5
  const lowStockData = data.filter(p => (p.qty || 0) < 5);
  
  // Sort by stock (lowest first)
  lowStockData.sort((a, b) => (a.qty || 0) - (b.qty || 0));
  
  if (lowStockData.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="mb-1">🔩</p>
        <p>Semua sparepart memiliki stok mencukupi</p>
        <small>Stok sparepart &gt;= 5</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = lowStockData.map(item => {
    const stock = item.qty || 0;
    const stockClass = stock === 0 ? 'text-danger' : (stock < 3 ? 'text-warning' : 'text-muted');
    
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${sanitizeHTML(item.name)}</strong>
              <br>
              <small class="text-muted">${formatCurrency(item.price)}</small>
            </div>
            <div class="text-end">
              <span class="badge ${stock === 0 ? 'bg-danger' : 'bg-warning'}">Stok: ${stock}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ======================
// RENDER TOP CUSTOMERS
// ======================
function renderTopCustomers(servisData, customerData) {
  const container = document.getElementById("topCustomers");
  if (!container) return;
  
  // Count services per customer (only completed ones)
  const customerCount = {};
  servisData.forEach(servis => {
    if (servis.status === "selesai" && servis.customerId) {
      if (!customerCount[servis.customerId]) {
        customerCount[servis.customerId] = 0;
      }
      customerCount[servis.customerId]++;
    }
  });
  
  // Convert to array and sort by count (highest first), take top 3
  const sortedCustomers = Object.entries(customerCount)
    .map(([id, count]) => ({
      id,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  
  if (sortedCustomers.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="mb-1">👑</p>
        <p>Belum ada data pelanggan dengan servis</p>
        <small>Data akan muncul setelah pelanggan menyelesaikan servis</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = sortedCustomers.map((item, index) => {
    const customer = customerData.find(c => c.id == item.id);
    const customerName = customer ? sanitizeHTML(customer.name) : "-";
    const policeNumber = customer ? sanitizeHTML(customer.policeNumber || "-") : "-";
    const rankEmoji = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : '#' + (index + 1)));
    
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="me-2">${rankEmoji}</span>
              <strong>${customerName}</strong>
              <br>
              <small class="text-muted">${policeNumber}</small>
            </div>
            <div class="text-end">
              <span class="badge bg-primary">${item.count} servis</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ======================
// RENDER TOP SELLING PARTS (All Time)
// ======================
function renderTopSellingParts() {
  const container = document.getElementById("topSellingParts");
  if (!container) return;
  
  // Get all servis with "selesai" status (completed)
  const allServisData = getData(SERVIS_KEY).filter(s => s.status === "selesai");
  
  // Count parts sold
  const partCount = {};
  allServisData.forEach(servis => {
    if (servis.items && Array.isArray(servis.items)) {
      servis.items.forEach(item => {
        if (item.partId) {
          if (!partCount[item.partId]) {
            partCount[item.partId] = {
              name: item.name,
              qty: 0,
              price: item.price
            };
          }
          partCount[item.partId].qty += item.qty || 0;
        }
      });
    }
  });
  
  // Convert to array and sort by quantity (highest first)
  const sortedParts = Object.entries(partCount)
    .map(([id, info]) => ({
      id,
      name: info.name,
      qty: info.qty,
      price: info.price
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3); // Top 3
  
  if (sortedParts.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="mb-1">🏆</p>
        <p>Belum ada data penjualan sparepart</p>
        <small>Data penjualan akan muncul setelah servis selesai</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = sortedParts.map((item, index) => {
    const rankEmoji = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : (index + 4)));
    
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="me-2">${rankEmoji}</span>
              <strong>${sanitizeHTML(item.name)}</strong>
              <br>
              <small class="text-muted">${formatCurrency(item.price)}</small>
            </div>
            <div class="text-end">
              <span class="badge bg-success">Terjual: ${item.qty}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ======================
// RENDER TOP SELLING PARTS (Today)
// ======================
function renderTopSellingPartsToday() {
  const container = document.getElementById("topSellingPartsToday");
  if (!container) return;
  
  const today = getTodayString();
  
  // Get today's servis with "selesai" status
  const todayServisData = getData(SERVIS_KEY).filter(s => s.status === "selesai" && s.tanggal === today);
  
  // Count parts sold today
  const partCount = {};
  todayServisData.forEach(servis => {
    if (servis.items && Array.isArray(servis.items)) {
      servis.items.forEach(item => {
        if (item.partId) {
          if (!partCount[item.partId]) {
            partCount[item.partId] = {
              name: item.name,
              qty: 0,
              price: item.price
            };
          }
          partCount[item.partId].qty += item.qty || 0;
        }
      });
    }
  });
  
  // Convert to array and sort by quantity (highest first)
  const sortedParts = Object.entries(partCount)
    .map(([id, info]) => ({
      id,
      name: info.name,
      qty: info.qty,
      price: info.price
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3); // Top 3
  
  if (sortedParts.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="mb-1">🏆</p>
        <p>Belum ada penjualan sparepart hari ini</p>
        <small>Data penjualan akan muncul setelah servis selesai</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = sortedParts.map((item, index) => {
    const rankEmoji = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : (index + 4)));
    
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="me-2">${rankEmoji}</span>
              <strong>${sanitizeHTML(item.name)}</strong>
              <br>
              <small class="text-muted">${formatCurrency(item.price)}</small>
            </div>
            <div class="text-end">
              <span class="badge bg-success">Terjual: ${item.qty}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}