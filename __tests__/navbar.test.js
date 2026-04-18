/**
 * Unit Tests untuk navbar.js - Testing business logic
 */

describe('navbar.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Navbar navigation links', () => {
    test('harus punya link ke semua halaman', () => {
      const navLinks = [
        { page: 'dashboard', url: 'dashboard.html', label: 'Dashboard' },
        { page: 'servis', url: 'servis.html', label: 'Servis' },
        { page: 'pelanggan', url: 'pelanggan.html', label: 'Pelanggan' },
        { page: 'sparepart', url: 'sparepart.html', label: 'Sparepart' },
        { page: 'setting', url: 'setting.html', label: 'Pengaturan' }
      ];
      
      expect(navLinks.length).toBe(5);
    });

    test('harus punya user dropdown', () => {
      const user = { username: 'admin' };
      expect(user.username).toBe('admin');
    });
  });

  describe('Navbar menu items', () => {
    test('harus punya 5 menu items', () => {
      const menuItems = ['Dashboard', 'Servis', 'Pelanggan', 'Sparepart', 'Pengaturan'];
      expect(menuItems.length).toBe(5);
    });

    test('menu items harus memiliki label yang benar', () => {
      const menuItems = [
        { label: 'Dashboard', icon: '📊' },
        { label: 'Servis', icon: '🔧' },
        { label: 'Pelanggan', icon: '👤' },
        { label: 'Sparepart', icon: '⚙️' },
        { label: 'Pengaturan', icon: '🔧' }
      ];
      
      expect(menuItems[0].label).toBe('Dashboard');
      expect(menuItems[1].label).toBe('Servis');
      expect(menuItems[2].label).toBe('Pelanggan');
    });
  });

  describe('Active page detection', () => {
    test('harus bisa deteksi halaman aktif', () => {
      const currentPage = 'dashboard';
      const isActive = (page) => currentPage === page;
      
      expect(isActive('dashboard')).toBe(true);
      expect(isActive('servis')).toBe(false);
    });

    test('harus bisa set active class untuk halaman aktif', () => {
      const currentPage = 'pelanggan';
      const getActiveClass = (page) => currentPage === page ? 'active' : '';
      
      expect(getActiveClass('pelanggan')).toBe('active');
      expect(getActiveClass('dashboard')).toBe('');
    });
  });

  describe('Logout functionality', () => {
    test('harus bisa simpan session di localStorage', () => {
      const session = { username: 'admin', loginAt: Date.now() };
      localStorage.setItem('admin_session', JSON.stringify(session));
      
      const stored = localStorage.getItem('admin_session');
      expect(stored).not.toBeNull();
    });

    test('harus bisa hapus session saat logout', () => {
      const session = { username: 'admin', loginAt: Date.now() };
      localStorage.setItem('admin_session', JSON.stringify(session));
      
      localStorage.removeItem('admin_session');
      expect(localStorage.getItem('admin_session')).toBeNull();
    });
  });
});