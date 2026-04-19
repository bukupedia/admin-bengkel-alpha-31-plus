// assets/js/components/navbar.js

import { getCurrentUser, logout } from "../modules/auth.js";

export function renderNavbar() {
  const navbar = document.getElementById("navbar");
  const currentPage = document.body.dataset.page;
  
  // Get current user for display
  const user = getCurrentUser();

  if (!navbar) return;

  navbar.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        
        <a class="navbar-brand fw-bold" href="dashboard.html">
          🔧 BengkelApp
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav ms-auto">

            <li class="nav-item">
              <a class="nav-link ${currentPage === "dashboard" ? "active" : ""}" href="dashboard.html">📊 Dashboard</a>
            </li>

            <li class="nav-item">
              <a class="nav-link ${currentPage === "servis" ? "active" : ""}" href="servis.html">🔧 Servis</a>
            </li>

            <li class="nav-item">
              <a class="nav-link ${currentPage === "pelanggan" ? "active" : ""}" href="pelanggan.html">👤 Pelanggan</a>
            </li>

            <li class="nav-item">
              <a class="nav-link ${currentPage === "sparepart" ? "active" : ""}" href="sparepart.html">🔩 Sparepart</a>
            </li>

            <li class="nav-item">
              <a class="nav-link ${currentPage === "riwayat" ? "active" : ""}" href="riwayat.html">📜 Riwayat</a>
            </li>

            <li class="nav-item">
              <a class="nav-link ${currentPage === "nota" ? "active" : ""}" href="nota.html">🧾 Nota</a>
            </li>

            <li class="nav-item">
              <a class="nav-link ${currentPage === "setting" ? "active" : ""}" href="setting.html">⚙️ Pengaturan</a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="#" id="themeToggle" title="Ganti Tema">🌓</a>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                👤 ${user ? user.username : 'Admin'}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><span class="dropdown-item-text text-muted small">Logged in</span></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">🚪 Logout</a></li>
              </ul>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  `;
  
  // Setup logout event
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  // Setup theme toggle
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const currentTheme = localStorage.getItem("theme") || "light";
    themeToggle.innerHTML = currentTheme === "dark" ? "☀️" : "🌓";
    
    themeToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      themeToggle.innerHTML = newTheme === "dark" ? "☀️" : "🌓";
    });
  }
}
