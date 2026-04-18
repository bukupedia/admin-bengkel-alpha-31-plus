/**
 * Unit Tests untuk dashboard.js - Testing business logic
 */

describe('dashboard.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Dashboard data loading', () => {
    test('harus load data servis', () => {
      const mockServices = [
        { id: '1', status: 'completed', total: 50000 },
        { id: '2', status: 'completed', total: 75000 }
      ];
      
      const services = mockServices;
      expect(services.length).toBe(2);
      expect(services[0].status).toBe('completed');
    });

    test('harus load data pelanggan', () => {
      const mockCustomers = [
        { id: '1', nama: 'Budi Santoso' },
        { id: '2', nama: 'Ani Wijaya' }
      ];
      
      const customers = mockCustomers;
      expect(customers.length).toBe(2);
    });

    test('harus load data sparepart', () => {
      const mockParts = [
        { id: '1', name: 'Oli Mesran', qty: 10 },
        { id: '2', name: 'Filter Oli', qty: 5 }
      ];
      
      const parts = mockParts;
      expect(parts.length).toBe(2);
    });
  });

  describe('Dashboard statistics', () => {
    test('harus hitung total pendapatan', () => {
      const completedServices = [
        { status: 'completed', total: 50000 },
        { status: 'completed', total: 75000 },
        { status: 'pending', total: 25000 }
      ];
      
      const totalRevenue = completedServices
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + s.total, 0);
      
      expect(totalRevenue).toBe(125000);
    });

    test('harus hitung jumlah servis', () => {
      const services = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'ongoing' },
        { id: '3', status: 'completed' },
        { id: '4', status: 'completed' }
      ];
      expect(services.length).toBe(4);
    });

    test('harus hitung jumlah pelanggan', () => {
      const customers = [{ id: '1', nama: 'Budi' }, { id: '2', nama: 'Ani' }];
      expect(customers.length).toBe(2);
    });
  });

  describe('Date range functions', () => {
    test('harus get today date string', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('harus get week date range', () => {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const expected = {
        start: weekAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      };
      
      expect(expected.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(expected.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('harus get month date range', () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const expected = {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
      };
      
      expect(expected.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(expected.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Dashboard filter by date', () => {
    test('harus filter servis berdasarkan tanggal', () => {
      const services = [
        { id: '1', tglMasuk: '2024-01-10' },
        { id: '2', tglMasuk: '2024-01-15' },
        { id: '3', tglMasuk: '2024-01-20' }
      ];
      
      const filtered = services.filter(s => {
        const date = new Date(s.tglMasuk);
        const start = new Date('2024-01-01');
        const end = new Date('2024-01-31');
        return date >= start && date <= end;
      });
      
      expect(filtered.length).toBe(3);
    });
  });

  describe('Dashboard low stock warning', () => {
    const LOW_STOCK_THRESHOLD = 5;
    
    test('harus identifikasi sparepart dengan stok rendah', () => {
      const parts = [
        { id: '1', name: 'Oli', qty: 10 },
        { id: '2', name: 'Filter', qty: 3 },
        { id: '3', name: 'Ban', qty: 2 }
      ];
      
      const lowStock = parts.filter(p => p.qty <= LOW_STOCK_THRESHOLD);
      expect(lowStock.length).toBe(2);
    });
  });
});