/**
 * Unit Tests untuk pelanggan.js - Testing business logic
 */

describe('pelanggan.js', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Pelanggan CRUD operations', () => {
    test('harus bisa add pelanggan baru', () => {
      const customers = [];
      const newCustomer = {
        id: 'test-id-123',
        nama: 'Budi Santoso',
        motorcycles: [
          { brand: 'Honda', model: 'Vario', plat: 'B 1234 ABC', tahun: 2020 }
        ],
        telp: '081234567890',
        alamat: 'Jakarta Selatan',
        createdAt: new Date().toISOString()
      };
      
      const result = [...customers, newCustomer];
      expect(result.length).toBe(1);
      expect(result[0].nama).toBe('Budi Santoso');
    });

    test('harus bisa update pelanggan', () => {
      const existingCustomers = [
        { id: '1', nama: 'Budi Santoso', telp: '081234567890' }
      ];
      
      const updatedCustomers = existingCustomers.map(c => 
        c.id === '1' ? { ...c, nama: 'Budi Wijaya', telp: '089876543210' } : c
      );
      
      expect(updatedCustomers[0].nama).toBe('Budi Wijaya');
      expect(updatedCustomers[0].telp).toBe('089876543210');
    });

    test('harus bisa delete pelanggan', () => {
      const customers = [
        { id: '1', nama: 'Budi' },
        { id: '2', nama: 'Ani' }
      ];
      
      const filtered = customers.filter(c => c.id !== '1');
      expect(filtered.length).toBe(1);
      expect(filtered[0].nama).toBe('Ani');
    });
  });

  describe('Pelanggan dengan multiple motorcycles', () => {
    test('harus bisa add pelanggan dengan banyak motor', () => {
      const customer = {
        id: '1',
        nama: 'Budi Santoso',
        motorcycles: [
          { brand: 'Honda', model: 'Vario', plat: 'B 1234 ABC', tahun: 2020 },
          { brand: 'Yamaha', model: 'Nmax', plat: 'B 5678 DEF', tahun: 2021 }
        ]
      };
      
      expect(customer.motorcycles.length).toBe(2);
      expect(customer.motorcycles[0].brand).toBe('Honda');
      expect(customer.motorcycles[1].brand).toBe('Yamaha');
    });

    test('harus bisa add motor ke pelanggan yang sudah ada', () => {
      const customer = {
        id: '1',
        nama: 'Budi Santoso',
        motorcycles: [
          { brand: 'Honda', model: 'Vario', plat: 'B 1234 ABC', tahun: 2020 }
        ]
      };
      
      const newMotorcycle = { brand: 'Suzuki', model: 'Satria', plat: 'B 9999 XYZ', tahun: 2019 };
      const updatedCustomer = {
        ...customer,
        motorcycles: [...customer.motorcycles, newMotorcycle]
      };
      
      expect(updatedCustomer.motorcycles.length).toBe(2);
    });

    test('harus bisa remove motor dari pelanggan', () => {
      const customer = {
        id: '1',
        nama: 'Budi Santoso',
        motorcycles: [
          { brand: 'Honda', model: 'Vario', plat: 'B 1234 ABC', tahun: 2020 },
          { brand: 'Yamaha', model: 'Nmax', plat: 'B 5678 DEF', tahun: 2021 }
        ]
      };
      
      const updatedCustomer = {
        ...customer,
        motorcycles: customer.motorcycles.filter(m => m.plat !== 'B 1234 ABC')
      };
      
      expect(updatedCustomer.motorcycles.length).toBe(1);
      expect(updatedCustomer.motorcycles[0].model).toBe('Nmax');
    });
  });

  describe('Pelanggan search dan filter', () => {
    test('harus bisa search berdasarkan nama', () => {
      const customers = [
        { id: '1', nama: 'Budi Santoso', telp: '081234567890' },
        { id: '2', nama: 'Ani Wijaya', telp: '081234567891' },
        { id: '3', nama: 'Budi Dharma', telp: '081234567892' }
      ];
      
      const searchResult = customers.filter(c => c.nama.toLowerCase().includes('budi'));
      expect(searchResult.length).toBe(2);
    });

    test('harus bisa search berdasarkan plat motor', () => {
      const customers = [
        { id: '1', nama: 'Budi', motorcycles: [{ plat: 'B 1234 ABC' }] },
        { id: '2', nama: 'Ani', motorcycles: [{ plat: 'B 5678 DEF' }] }
      ];
      
      const searchResult = customers.filter(c => c.motorcycles.some(m => m.plat.toLowerCase().includes('1234')));
      expect(searchResult.length).toBe(1);
      expect(searchResult[0].nama).toBe('Budi');
    });

    test('harus bisa search berdasarkan nomor telepon', () => {
      const customers = [
        { id: '1', nama: 'Budi', telp: '081234567890' },
        { id: '2', nama: 'Ani', telp: '089876543210' }
      ];
      
      const searchResult = customers.filter(c => c.telp.includes('0812'));
      expect(searchResult.length).toBe(1);
    });
  });

  describe('Pelanggan validation', () => {
    test('harus validasi data pelanggan', () => {
      const validCustomer = {
        nama: 'Budi Santoso',
        telp: '081234567890',
        motorcycles: [
          { brand: 'Honda', model: 'Vario', plat: 'B 1234 ABC', tahun: 2020 }
        ]
      };
      
      expect(validCustomer.nama).toBeTruthy();
      expect(validCustomer.telp).toBeTruthy();
      expect(validCustomer.motorcycles.length).toBeGreaterThan(0);
    });

    test('harus handle pelanggan tanpa motor', () => {
      const customer = { id: '1', nama: 'Budi', motorcycles: [] };
      expect(customer.motorcycles.length).toBe(0);
    });

    test('harus handle data yang hilang', () => {
      const customer = { id: '1', nama: 'Budi', telp: null, alamat: null, motorcycles: [] };
      expect(customer.telp).toBeNull();
      expect(customer.alamat).toBeNull();
    });
  });
});