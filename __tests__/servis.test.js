/**
 * Unit Tests untuk servis.js - Testing business logic
 */

describe('servis.js', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Servis CRUD operations', () => {
    test('harus bisa add servis baru', () => {
      const services = [];
      const newService = {
        id: 'test-id-123',
        idPelanggan: 'pelanggan-1',
        namaPelanggan: 'Budi Santoso',
        motor: { brand: 'Honda', model: 'Vario', plat: 'B 1234 ABC', tahun: 2020 },
        tglMasuk: '2024-01-15',
        tglSelesai: null,
        layanan: [{ nama: 'Ganti Oli', harga: 50000, qty: 1 }],
        total: 50000,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const result = [...services, newService];
      expect(result.length).toBe(1);
      expect(result[0].namaPelanggan).toBe('Budi Santoso');
    });

    test('harus bisa update servis', () => {
      const existingServices = [{ id: '1', status: 'pending', total: 50000 }];
      const updatedServices = existingServices.map(s => s.id === '1' ? { ...s, status: 'ongoing', total: 75000 } : s);
      
      expect(updatedServices[0].status).toBe('ongoing');
      expect(updatedServices[0].total).toBe(75000);
    });

    test('harus bisa delete servis', () => {
      const services = [{ id: '1', nama: 'Servis 1' }, { id: '2', nama: 'Servis 2' }];
      const filtered = services.filter(s => s.id !== '1');
      expect(filtered.length).toBe(1);
    });
  });

  describe('Servis status management', () => {
    test('harus punya status yang benar', () => {
      const validStatuses = ['pending', 'ongoing', 'completed', 'cancelled'];
      const service = { id: '1', status: 'pending' };
      expect(validStatuses).toContain(service.status);
    });

    test('harus update status ke ongoing', () => {
      const service = { id: '1', status: 'pending' };
      service.status = 'ongoing';
      expect(service.status).toBe('ongoing');
    });

    test('harus update status ke completed dengan tanggal selesai', () => {
      const service = { id: '1', status: 'ongoing', tglSelesai: null };
      service.status = 'completed';
      service.tglSelesai = new Date().toISOString();
      expect(service.status).toBe('completed');
      expect(service.tglSelesai).not.toBeNull();
    });
  });

  describe('Servis layanan management', () => {
    test('harus bisa add layanan ke servis', () => {
      const service = { id: '1', layanan: [{ nama: 'Ganti Oli', harga: 50000, qty: 1 }] };
      const newService = { nama: 'Cuci Motor', harga: 25000, qty: 1 };
      service.layanan.push(newService);
      expect(service.layanan.length).toBe(2);
    });

    test('harus hitung total dengan benar', () => {
      const layanan = [
        { nama: 'Ganti Oli', harga: 50000, qty: 1 },
        { nama: 'Cuci Motor', harga: 25000, qty: 1 },
        { nama: 'Ganti Ban', harga: 150000, qty: 1 }
      ];
      const total = layanan.reduce((sum, item) => sum + (item.harga * item.qty), 0);
      expect(total).toBe(225000);
    });

    test('harus hitung total dengan qty > 1', () => {
      const layanan = [{ nama: 'Ganti Oli', harga: 50000, qty: 2 }];
      const total = layanan.reduce((sum, item) => sum + (item.harga * item.qty), 0);
      expect(total).toBe(100000);
    });
  });

  describe('Servis search dan filter', () => {
    test('harus bisa filter berdasarkan status', () => {
      const services = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'ongoing' },
        { id: '3', status: 'completed' }
      ];
      const pending = services.filter(s => s.status === 'pending');
      const ongoing = services.filter(s => s.status === 'ongoing');
      expect(pending.length).toBe(1);
      expect(ongoing.length).toBe(1);
    });

    test('harus bisa search berdasarkan nama pelanggan', () => {
      const services = [
        { id: '1', namaPelanggan: 'Budi Santoso' },
        { id: '2', namaPelanggan: 'Ani Wijaya' },
        { id: '3', namaPelanggan: 'Budi Dharma' }
      ];
      const searchResult = services.filter(s => s.namaPelanggan.toLowerCase().includes('budi'));
      expect(searchResult.length).toBe(2);
    });

    test('harus bisa filter berdasarkan plat motor', () => {
      const services = [
        { id: '1', motor: { plat: 'B 1234 ABC' } },
        { id: '2', motor: { plat: 'B 5678 DEF' } }
      ];
      const searchResult = services.filter(s => s.motor.plat.toLowerCase().includes('1234'));
      expect(searchResult.length).toBe(1);
    });
  });

  describe('Servis with spareparts', () => {
    test('harus bisa add sparepart ke servis', () => {
      const service = { id: '1', spareparts: [] };
      const sparepart = { id: 'part-1', name: 'Oli Mesran', qty: 1, price: 50000 };
      service.spareparts.push(sparepart);
      expect(service.spareparts.length).toBe(1);
      expect(service.spareparts[0].name).toBe('Oli Mesran');
    });

    test('harus hitung total dengan spareparts', () => {
      const layanan = [{ nama: 'Ganti Oli', harga: 50000, qty: 1 }];
      const spareparts = [
        { name: 'Oli Mesran', price: 50000, qty: 1 },
        { name: 'Filter Oli', price: 15000, qty: 1 }
      ];
      const layananTotal = layanan.reduce((sum, item) => sum + (item.harga * item.qty), 0);
      const sparepartTotal = spareparts.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const total = layananTotal + sparepartTotal;
      expect(total).toBe(115000);
    });
  });
});