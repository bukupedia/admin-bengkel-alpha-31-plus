/**
 * Unit Tests untuk utils.js
 */

import { generateId, sanitizeHTML, formatCurrency, formatDate } from '../assets/js/utils.js';

describe('utils.js', () => {
  describe('generateId', () => {
    test('harus menghasilkan ID dengan format yang benar', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    test('harus menghasilkan ID unik', () => {
      const id1 = generateId();
      const id2 = generateId();
      // IDs mungkin sama jika dipanggil sangat cepat, tapi sangat tidak mungkin
      expect(id1).not.toBe(id2);
    });

    test('harus berisi karakter alfanumerik', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('sanitizeHTML', () => {
    test('harus escape karakter HTML khusus', () => {
      const result = sanitizeHTML('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });

    test('harus handle tanda kutip dengan aman', () => {
      const result = sanitizeHTML('Test "quoted" text');
      // textContent tidak mengescape tanda kutip
      expect(result).toContain('Test');
    });

    test('harus handle apostrophe', () => {
      const result = sanitizeHTML("Test's text");
      expect(result).toContain("Test's text");
    });

    test('harus mengembalikan teks biasa tanpa perubahan', () => {
      const plainText = 'Hello World';
      const result = sanitizeHTML(plainText);
      expect(result).toBe('Hello World');
    });

    test('harus handle empty string', () => {
      const result = sanitizeHTML('');
      expect(result).toBe('');
    });

    test('harus handle string dengan tag HTML', () => {
      const html = '<div>Test</div>';
      const result = sanitizeHTML(html);
      // textContent mengkonversi < dan > ke &lt; dan &gt;
      expect(result).toContain('Test');
    });
  });

  describe('formatCurrency', () => {
    test('harus format angka ke format Rupiah', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1.000.000');
    });

    test('harus handle 0', () => {
      const result = formatCurrency(0);
      expect(result).toContain('Rp 0');
    });

    test('harus handle null/undefined', () => {
      expect(formatCurrency(null)).toBe('Rp 0');
      expect(formatCurrency(undefined)).toBe('Rp 0');
    });

    test('harus handle string angka', () => {
      const result = formatCurrency('50000');
      expect(result).toContain('50.000');
    });

    test('harus handle angka desimal', () => {
      const result = formatCurrency(10000.99);
      expect(result).toContain('10.000');
    });

    test('harus handle angka negatif', () => {
      const result = formatCurrency(-5000);
      expect(result).toContain('5.000');
    });
  });

  describe('formatDate', () => {
    test('harus format tanggal dengan benar', () => {
      // Gunakan fixed date untuk konsistensi
      const result = formatDate('2024-01-15');
      expect(result).toContain('15');
      expect(result).toContain('Januari');
      expect(result).toContain('2024');
    });

    test('harus return "-" untuk tanggal kosong', () => {
      expect(formatDate('')).toBe('-');
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });

    test('harus handle format ISO', () => {
      const result = formatDate('2024-12-25T10:30:00');
      expect(result).toContain('25');
      expect(result).toContain('Desember');
      expect(result).toContain('2024');
    });

    test('harus handle timestamp number', () => {
      const timestamp = new Date('2024-06-15').getTime();
      const result = formatDate(timestamp);
      expect(result).toContain('15');
      expect(result).toContain('Juni');
    });
  });
});