import type { ShenzhenDistrict } from '../api/types';

export interface DistrictGeoShape {
  d: string;
  labelX: number;
  labelY: number;
}

export const SHENZHEN_MAP_VIEWBOX = '0 0 785 368';

// 深汕特别合作区地理上为飞地，不参与主图拼接，单独渲染为角落 chip。
export type MappedDistrict = Exclude<ShenzhenDistrict, '深汕特别合作区'>;

export const SHENZHEN_DISTRICT_GEO: Record<MappedDistrict, DistrictGeoShape> = {
  光明区: {
    d: 'M 261.1,49 L 261.1,111 L 207.4,142 L 153.7,111 L 153.7,49 L 207.4,18 Z',
    labelX: 207.4,
    labelY: 80
  },
  龙华区: {
    d: 'M 368.5,49 L 368.5,111 L 314.8,142 L 261.1,111 L 261.1,49 L 314.8,18 Z',
    labelX: 314.8,
    labelY: 80
  },
  龙岗区: {
    d: 'M 583.2,49 L 583.2,111 L 529.5,142 L 475.9,111 L 475.9,49 L 529.5,18 Z',
    labelX: 529.5,
    labelY: 80
  },
  坪山区: {
    d: 'M 690.6,49 L 690.6,111 L 636.9,142 L 583.2,111 L 583.2,49 L 636.9,18 Z',
    labelX: 636.9,
    labelY: 80
  },
  宝安区: {
    d: 'M 207.4,142 L 207.4,204 L 153.7,235 L 100,204 L 100,142 L 153.7,111 Z',
    labelX: 153.7,
    labelY: 173
  },
  福田区: {
    d: 'M 422.2,142 L 422.2,204 L 368.5,235 L 314.8,204 L 314.8,142 L 368.5,111 Z',
    labelX: 368.5,
    labelY: 173
  },
  罗湖区: {
    d: 'M 529.5,142 L 529.5,204 L 475.9,235 L 422.2,204 L 422.2,142 L 475.9,111 Z',
    labelX: 475.9,
    labelY: 173
  },
  盐田区: {
    d: 'M 636.9,142 L 636.9,204 L 583.2,235 L 529.5,204 L 529.5,142 L 583.2,111 Z',
    labelX: 583.2,
    labelY: 173
  },
  南山区: {
    d: 'M 261.1,235 L 261.1,297 L 207.4,328 L 153.7,297 L 153.7,235 L 207.4,204 Z',
    labelX: 207.4,
    labelY: 266
  },
  大鹏新区: {
    d: 'M 744.3,142 L 744.3,204 L 690.6,235 L 636.9,204 L 636.9,142 L 690.6,111 Z',
    labelX: 690.6,
    labelY: 173
  }
};
