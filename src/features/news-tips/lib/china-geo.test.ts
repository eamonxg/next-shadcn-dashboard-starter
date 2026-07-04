import { describe, expect, test } from 'bun:test';

import { CHINA_PROVINCE_GEO } from './china-geo';

describe('CHINA_PROVINCE_GEO', () => {
  test('覆盖广东（用于下钻至深圳）', () => {
    expect(CHINA_PROVINCE_GEO['广东']).toBeDefined();
  });

  test('覆盖全部省级行政区（含港澳台与南海诸岛）', () => {
    expect(Object.keys(CHINA_PROVINCE_GEO).length).toBeGreaterThanOrEqual(34);
  });

  test('每个省份都有非空 path 与合法坐标', () => {
    for (const shape of Object.values(CHINA_PROVINCE_GEO)) {
      expect(shape.d.length).toBeGreaterThan(0);
      expect(shape.d.startsWith('M')).toBe(true);
      expect(Number.isFinite(shape.labelX)).toBe(true);
      expect(Number.isFinite(shape.labelY)).toBe(true);
    }
  });
});
