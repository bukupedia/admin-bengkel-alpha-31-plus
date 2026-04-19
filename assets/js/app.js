// assets/js/app.js

import { requireAuth } from "./modules/auth.js";
import { renderNavbar } from "./components/navbar.js";
import { initPelangganPage } from "./modules/pelanggan.js";
import { initServisPage } from "./modules/servis.js";
import { initSparepartPage } from "./modules/sparepart.js";
import { initDashboardPage } from "./modules/dashboard.js";
import { initSettingsPage } from "./modules/settings.js";

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Protect all pages - redirect to login if not authenticated
  if (!requireAuth()) {
    return;
  }
  
  // ✅ render navbar di semua halaman
  renderNavbar();

  const page = document.body.dataset.page;

  if (page === "dashboard") {
    initDashboardPage();
  }
  if (page === "pelanggan") {
    initPelangganPage();
  }
  if (page === "servis") {
    initServisPage();
  }
  if (page === "sparepart") {
    initSparepartPage();
  }
  if (page === "pengaturan") {
    initSettingsPage();
  }
});
