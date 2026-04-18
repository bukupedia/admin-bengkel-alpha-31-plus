/**
 * Unit Tests untuk storage.js
 */

import { getData, saveData } from '../assets/js/storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getData', () => {
    test('harus mengembalikan array kosong ketika key tidak ada', () => {
      const result = getData('nonexistent_key');
      expect(result).toEqual([]);
    });

    test('harus mengembalikan array kosong ketika data corrupt', () => {
      localStorage.setItem('corrupt_key', 'not valid json');
      const result = getData('corrupt_key');
      expect(result).toEqual([]);
    });

    test('harus berhasil parse JSON yang valid', () => {
      const testData = [{ id: '1', name: 'Test' }];
      localStorage.setItem('valid_key', JSON.stringify(testData));
      const result = getData('valid_key');
      expect(result).toEqual(testData);
    });

    test('harus mengembalikan array kosong untuk data string biasa', () => {
      localStorage.setItem('string_key', 'just a string');
      const result = getData('string_key');
      expect(result).toEqual([]);
    });

    test('harus handle null dengan aman', () => {
      // localStorage returns null for non-existent keys, not the string "null"
      const result = getData('null_key');
      expect(result).toEqual([]);
    });
  });

  describe('saveData', () => {
    test('harus berhasil menyimpan data ke localStorage', () => {
      const testData = [{ id: '1', name: 'Spare Part' }];
      saveData('parts', testData);
      
      const stored = localStorage.getItem('parts');
      expect(JSON.parse(stored)).toEqual(testData);
    });

    test('harus berhasil menyimpan data object', () => {
      const testData = { id: '1', name: 'Test', qty: 10 };
      saveData('single_item', testData);
      
      const stored = localStorage.getItem('single_item');
      expect(JSON.parse(stored)).toEqual(testData);
    });

    test('harus berhasil menyimpan array kosong', () => {
      const testData = [];
      saveData('empty_array', testData);
      
      const stored = localStorage.getItem('empty_array');
      expect(JSON.parse(stored)).toEqual([]);
    });

    test('harus berhasil menyimpan string', () => {
      const testData = 'simple string';
      saveData('string_data', testData);
      
      const stored = localStorage.getItem('string_data');
      expect(JSON.parse(stored)).toEqual('simple string');
    });
  });
});