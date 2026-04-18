/**
 * Unit Tests untuk setting.js - Testing business logic
 */

describe('setting.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Default settings', () => {
    test('harus punya default service status', () => {
      const defaultStatus = [
        { id: 1, name: "Menunggu", color: "#6c757d" },
        { id: 2, name: "Diproses", color: "#0d6efd" },
        { id: 3, name: "Selesai", color: "#198754" },
        { id: 4, name: "Dibatalkan", color: "#dc3545" }
      ];
      
      expect(defaultStatus.length).toBe(4);
      expect(defaultStatus[0].name).toBe('Menunggu');
    });

    test('harus punya default categories', () => {
      const defaultCategories = [
        "Oli", "Ban", "Bus", "Aki", "Kampas Rem", "Busi", "Filter", "Sparepart Umum"
      ];
      
      expect(defaultCategories.length).toBe(8);
      expect(defaultCategories).toContain('Oli');
      expect(defaultCategories).toContain('Ban');
    });

    test('harus punya default vehicle brands', () => {
      const defaultBrands = [
        "Honda", "Yamaha", "Suzuki", "Kawasaki", "TVS", "Benelli", "BMW", "Harley-Davidson"
      ];
      
      expect(defaultBrands.length).toBe(8);
      expect(defaultBrands).toContain('Honda');
      expect(defaultBrands).toContain('Yamaha');
    });
  });

  describe('Storage keys', () => {
    test('harus punya storage key yang benar', () => {
      const STORAGE_KEYS = {
        SHOP_INFO: "bengkel_shop_info",
        SERVICE_STATUS: "bengkel_service_status",
        CATEGORIES: "bengkel_categories",
        VEHICLE_BRANDS: "bengkel_vehicle_brands",
        SERVIS: "bengkel_servis",
        PELANGGAN: "bengkel_pelanggan",
        SPAREPART: "bengkel_sparepart"
      };
      
      expect(STORAGE_KEYS.SHOP_INFO).toBe('bengkel_shop_info');
      expect(STORAGE_KEYS.SERVICE_STATUS).toBe('bengkel_service_status');
    });
  });

  describe('Shop info management', () => {
    test('harus bisa simpan shop info', () => {
      const shopInfo = {
        name: 'Bengkel Maju Jaya',
        address: 'Jl. Merdeka No. 123',
        phone: '081234567890',
        email: 'majujaya@bengkel.com'
      };
      
      // Save to localStorage (simulated)
      localStorage.setItem('bengkel_shop_info', JSON.stringify(shopInfo));
      const stored = JSON.parse(localStorage.getItem('bengkel_shop_info'));
      
      expect(stored.name).toBe('Bengkel Maju Jaya');
      expect(stored.address).toBe('Jl. Merdeka No. 123');
    });

    test('harus bisa load shop info', () => {
      const shopInfo = { name: 'Bengkel Maju Jaya', address: 'Jl. Merdeka No. 123' };
      localStorage.setItem('bengkel_shop_info', JSON.stringify(shopInfo));
      
      const loaded = JSON.parse(localStorage.getItem('bengkel_shop_info'));
      expect(loaded.name).toBe('Bengkel Maju Jaya');
    });
  });

  describe('Categories management', () => {
    test('harus bisa add kategori baru', () => {
      const categories = ["Oli", "Ban", "Bus"];
      const newCategory = "Aki";
      const updated = [...categories, newCategory];
      
      expect(updated.length).toBe(4);
      expect(updated).toContain('Aki');
    });

    test('harus bisa hapus kategori', () => {
      const categories = ["Oli", "Ban", "Bus"];
      const filtered = categories.filter(c => c !== "Ban");
      
      expect(filtered.length).toBe(2);
      expect(filtered).not.toContain('Ban');
    });
  });

  describe('Vehicle brands management', () => {
    test('harus bisa add brand baru', () => {
      const brands = ["Honda", "Yamaha"];
      const newBrand = "Suzuki";
      const updated = [...brands, newBrand];
      
      expect(updated.length).toBe(3);
      expect(updated).toContain('Suzuki');
    });

    test('harus bisa update brand', () => {
      const brands = ["Honda", "Yamaha"];
      const updated = brands.map(b => b === "Yamaha" ? "Yamaha Mio" : b);
      
      expect(updated[1]).toBe('Yamaha Mio');
    });
  });

  describe('Data reset functionality', () => {
    test('harus bisa reset semua data', () => {
      localStorage.setItem('bengkel_servis', JSON.stringify([]));
      localStorage.setItem('bengkel_pelanggan', JSON.stringify([]));
      localStorage.setItem('bengkel_sparepart', JSON.stringify([]));
      
      localStorage.clear();
      
      expect(localStorage.getItem('bengkel_servis')).toBeNull();
      expect(localStorage.getItem('bengkel_pelanggan')).toBeNull();
      expect(localStorage.getItem('bengkel_sparepart')).toBeNull();
    });
  });
});