// assets/js/app.js

import { requireAuth } from "./modules/auth.js";
import { renderNavbar } from "./components/navbar.js";
import { initPelangganPage } from "./modules/pelanggan.js";
import { initServisPage } from "./modules/servis.js";
import { initSparepartPage } from "./modules/sparepart.js";
import { initDashboardPage } from "./modules/dashboard.js";
import { initSettingPage } from "./modules/setting.js";

// Main initialization function
function initApp() {
  // Check auth but don't block rendering
  const isAuth = requireAuth();
  
  // Always render navbar first
  renderNavbar();

  // Continue with page-specific initialization
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
  if (page === "setting") {
    initSettingPage();
  }
}

// Export for external use
export { initApp };

// Run on DOM ready
document.addEventListener("DOMContentLoaded", initApp);

// Also run immediately as fallback (in case DOM is already ready)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  // DOM already ready, run init
  initApp();
}
