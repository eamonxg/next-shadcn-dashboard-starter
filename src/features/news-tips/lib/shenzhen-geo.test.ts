import { describe, expect, test } from 'bun:test';

import { NEWS_TIP_DISTRICTS } from '../constants/options';
import { SHENZHEN_DISTRICT_GEO } from './shenzhen-geo';

describe('SHENZHEN_DISTRICT_GEO', () => {
  const mappedDistricts = NEWS_TIP_DISTRICTS.filter((district) => district !== '深汕特别合作区');

  test('覆盖除深汕特别合作区外的全部行政区', () => {
    expect(Object.keys(SHENZHEN_DISTRICT_GEO).toSorted()).toEqual(mappedDistricts.toSorted());
  });

  test('每个区都有非空 path 与合法坐标', () => {
    for (const shape of Object.values(SHENZHEN_DISTRICT_GEO)) {
      expect(shape.d.length).toBeGreaterThan(0);
      expect(shape.d.startsWith('M')).toBe(true);
      expect(Number.isFinite(shape.labelX)).toBe(true);
      expect(Number.isFinite(shape.labelY)).toBe(true);
    }
  });
});
