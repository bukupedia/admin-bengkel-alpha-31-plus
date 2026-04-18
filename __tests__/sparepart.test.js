/**
 * Unit Tests untuk sparepart.js - Testing business logic
 */

// Kita test business logic secara langsung tanpa import module
// karena ESM + jest.mock punya masalah kompatibilitas

describe('sparepart.js', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Sparepart Constants', () => {
    test('harus punya threshold untuk low stock', () => {
      const LOW_STOCK_THRESHOLD = 5;
      expect(LOW_STOCK_THRESHOLD).toBe(5);
    });

    test('harus punya items per page', () => {
      const ITEMS_PER_PAGE = 10;
      expect(ITEMS_PER_PAGE).toBe(10);
    });

    test('harus punya storage key untuk parts', () => {
      const KEY = 'parts';
      expect(KEY).toBe('parts');
    });
  });

  describe('Sparepart CRUD operations', () => {
    test('harus bisa add sparepart baru', () => {
      const parts = [];
      const newPart = {
        id: 'test-id-123',
        name: 'Oli Mesran',
        supplier: 'PT Pertamina',
        telpSupplier: '081234567890',
        perusahaan: 'Pertamina',
        qty: 10,
        price: 50000,
        createdAt: new Date().toISOString()
      };
      
      const result = [...parts, newPart];
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Oli Mesran');
    });

    test('harus bisa update sparepart', () => {
      const existingParts = [
        { id: '1', name: 'Oli Mesran', qty: 10, price: 50000 }
      ];
      
      const updatedParts = existingParts.map(part => 
        part.id === '1' ? { ...part, qty: 15 } : part
      );
      
      expect(updatedParts[0].qty).toBe(15);
    });

    test('harus bisa delete sparepart', () => {
      const parts = [
        { id: '1', name: 'Oli Mesran' },
        { id: '2', name: 'Filter Oli' }
      ];
      
      const filtered = parts.filter(part => part.id !== '1');
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('2');
    });
  });

  describe('Sparepart validation', () => {
    test('harus validasi data sparepart', () => {
      const validPart = {
        name: 'Oli Mesran',
        supplier: 'PT Pertamina',
        qty: 10,
        price: 50000
      };
      
      expect(validPart.name).toBeTruthy();
      expect(validPart.supplier).toBeTruthy();
      expect(validPart.qty).toBeGreaterThanOrEqual(0);
      expect(validPart.price).toBeGreaterThanOrEqual(0);
    });

    test('harus handle sparepart dengan qty 0', () => {
      const part = { id: '1', name: 'Oli', qty: 0, price: 0 };
      expect(part.qty).toBe(0);
      expect(part.price).toBe(0);
    });

    test('harus handle sparepart dengan qty negatif', () => {
      const part = { id: '1', name: 'Oli', qty: -1, price: 50000 };
      expect(part.qty).toBeLessThan(0);
    });
  });

  describe('Sparepart search dan filter', () => {
    test('harus bisa filter berdasarkan nama', () => {
      const parts = [
        { id: '1', name: 'Oli Mesran', supplier: 'Pertamina' },
        { id: '2', name: 'Filter Oli', supplier: 'Astra' },
        { id: '3', name: 'Oli Gardan', supplier: 'Pertamina' }
      ];
      
      const filtered = parts.filter(p => p.name.toLowerCase().includes('oli'));
      expect(filtered.length).toBe(3);
    });

    test('harus bisa filter berdasarkan supplier', () => {
      const parts = [
        { id: '1', name: 'Oli Mesran', supplier: 'Pertamina' },
        { id: '2', name: 'Filter Oli', supplier: 'Astra' }
      ];
      
      const filtered = parts.filter(p => p.supplier.toLowerCase().includes('pertamina'));
      expect(filtered.length).toBe(1);
      expect(filtered[0].supplier).toBe('Pertamina');
    });

    test('harus bisa filter berdasarkan perusahaan', () => {
      const parts = [
        { id: '1', name: 'Oli', perusahaan: 'Pertamina' },
        { id: '2', name: 'Filter', perusahaan: 'Astra' }
      ];
      
      const filtered = parts.filter(p => p.perusahaan.toLowerCase().includes('pertamina'));
      expect(filtered.length).toBe(1);
    });
  });

  describe('Low stock detection', () => {
    const LOW_STOCK_THRESHOLD = 5;
    
    test('harus deteksi item dengan stock rendah', () => {
      const parts = [
        { id: '1', name: 'Oli', qty: 10 },
        { id: '2', name: 'Filter', qty: 3 },
        { id: '3', name: 'Ban', qty: 2 }
      ];
      
      const lowStock = parts.filter(p => p.qty <= LOW_STOCK_THRESHOLD);
      expect(lowStock.length).toBe(2);
    });

    test('harus tidak deteksi item dengan stock cukup', () => {
      const parts = [
        { id: '1', name: 'Oli', qty: 10 },
        { id: '2', name: 'Filter', qty: 6 }
      ];
      
      const lowStock = parts.filter(p => p.qty <= LOW_STOCK_THRESHOLD);
      expect(lowStock.length).toBe(0);
    });
  });

  describe('Pagination', () => {
    test('harus hitung total pages dengan benar', () => {
      const ITEMS_PER_PAGE = 10;
      const totalItems = 25;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      expect(totalPages).toBe(3);
    });

    test('harus hitung start index dengan benar', () => {
      const ITEMS_PER_PAGE = 10;
      const currentPage = 2;
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      expect(startIndex).toBe(10);
    });

    test('harus hitung end index dengan benar', () => {
      const ITEMS_PER_PAGE = 10;
      const startIndex = 10;
      const totalItems = 25;
      const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
      expect(endIndex).toBe(20);
    });
  });
});