# 深圳区划热力分布图 设计文档

日期：2026-07-04

## 背景

首页态势总览目前用 `district-heat-grid.tsx`（11 宫格卡片，颜色深浅表达密度）展示各区报料密度。需求：把这块格子替换成真实的深圳区划地图热力分布（数据全 mock），与「来源渠道占比」饼图并列作为首屏两张概览图保留；移动端优先，需完美显示。

这与 PRD 中「区划热区要求：不引入真实地图」的旧约束相反，PRD 需同步更新。

## 范围

- 新增：深圳行政区划几何数据（预投影 SVG path，纯本地静态数据，无第三方地图库依赖）
- 新增：`DistrictHeatMap` 组件（choropleth 填色地图），替换 `Cockpit` 中的 `DistrictHeatGrid`
- 删除：`district-heat-grid.tsx`（不再被引用）
- 更新：`docs/prd.md` 中相关条目（IA 描述、约束、设计原则、可视化清单）
- 数据层不变：继续复用现有 `DistrictStat`（count / pendingCount / adoptionRate / share）与 `ShenzhenDistrict` 类型

不在范围内：真实地理数据接入、地图库引入（如 d3-geo/topojson/react-simple-maps）、除首页概览图以外的下钻页面改动。

## 几何数据

`src/features/news-tips/lib/shenzhen-geo.ts`：

```ts
export interface DistrictGeoShape {
  d: string; // SVG path data
  labelX: number;
  labelY: number;
}
export const SHENZHEN_DISTRICT_GEO: Record<ShenzhenDistrict, DistrictGeoShape>
export const SHENZHEN_MAP_VIEWBOX = '0 0 W H';
```

- 覆盖 9 行政区 + 大鹏新区，共用一个 viewBox，坐标已一次性投影完成（构建时无需运行时几何计算）。
- **深汕特别合作区**为飞地，不放入主图路径集合；在地图角落/下方渲染为独立统计 chip（沿用 PRD 既定处理方式），点击同样触发下钻。
- 路径几何为示意性简化轮廓（非精确测绘级别），满足「一眼认出深圳区划形状」即可，重点是密度可视化的正确性而非地图精度。

## 组件设计

### `DistrictHeatMap`（新建，替代 `DistrictHeatGrid`）

Props（与旧组件保持一致签名，便于 `cockpit.tsx` 平替）：

```ts
interface DistrictHeatMapProps {
  data: DistrictStat[];
  activeDistricts: ShenzhenDistrict[];
  onSelect: (district: ShenzhenDistrict) => void;
}
```

渲染：
- 一个响应式 `<svg viewBox={SHENZHEN_MAP_VIEWBOX} className="w-full h-auto">`，`aspect-ratio` 通过外层容器锁定，避免不同宽度下变形或溢出。
- 每个区一个 `<path>`：
  - 填色：`count / maxCount` 映射到 `--primary` 的 `color-mix` 深浅（复用旧组件的强度算法：`8 + intensity * 26`）。
  - 高待审（`pendingCount >= 2`）：描边使用 warning 色（如 `stroke-red-500`），克制不刺眼。
  - `active`（在 `activeDistricts` 中）：描边加粗 + primary 高亮，与旧组件的选中态视觉语言一致。
  - 点击 → `onSelect(district)`；`role="button"` + `aria-label` 标注区名，保证可访问性与移动端可点性。极小面积的区块通过透明 padding path 或增大描边热区，确保指尖可点。
- 标签：≥`sm` 断点显示区名文字（定位在 `labelX/labelY`）；小屏隐藏文字标签，仅保留填色 + 可点，避免拥挤重叠。
- 图例：地图下方一条颜色深浅图例条（低→高密度），窄屏下允许换行，不撑破容器。
- 深汕 chip：地图下方单独一行的小卡片，展示其 count/pendingCount/adoptionRate，点击同样 `onSelect('深汕特别合作区')`。

### 交互差异：桌面 vs 移动

- 桌面（有 hover）：鼠标悬停时用现有 `ChartTooltip`/原生 `title` 或轻量浮层展示区名/线索数/待审/采用率/占比。
- 移动端（无 hover）：改为**点选驱动**。点击一个区块：
  1. 该区进入 `selected` 高亮状态（组件内部 local state，独立于父级 `activeDistricts` 筛选态）
  2. 地图下方渲染一条固定的「当前区详情」读出条：区名 + count + 待审 + 采用率 + 占比 + 一个「进明细」按钮（复用父级 `onSelect` 触发的下钻跳转）
  3. 详情条在桌面端同样存在（点击后作为点选态的补充说明），保证两端交互一致，只是桌面额外多了 hover 预览

这样单一份 state 逻辑覆盖两端，不需要区分 UA。

## `Cockpit` 集成

`cockpit.tsx` 中：

```diff
- <DistrictHeatGrid
+ <DistrictHeatMap
    data={dashboard.districts}
    activeDistricts={[]}
    onSelect={(district) => drill({ district })}
  />
```

`ChannelPie`、`CategoryBar` 等其余卡片不变。

## PRD 更新点（`docs/prd.md`）

- L52 IA 描述：「深圳区划热区」→「深圳区划热力分布图」
- L123：表格行「深圳区划热区」的形态列由「热力格 / 紧凑榜单」改为「填色地图（choropleth）」
- L127：约束段落改写，移除「不引入真实地图」，改为明确「引入深圳行政区划简化几何，颜色深浅表达密度，移动端点选/桌面 hover 显示详情，点击下钻」
- L180：下钻触发描述保持「点击区划热区 → 下钻明细并筛该区」，措辞可保留
- L207：「热区默认展示前 10」相关表述保持（地图上默认全部区块可见，无需分页/Top10 截断，此条可标注为地图形态下自然满足）
- L267：可视化清单「区划热区」→「深圳区划热力分布图」
- L294：设计原则行「热区不像地图被误解」→ 改为强调「地图色阶清晰可辨、非真实测绘级别，标题标注『示意』」等新原则

## 测试

- `shenzhen-geo.test.ts`：断言 `SHENZHEN_DISTRICT_GEO` 覆盖全部 10 个非深汕区、每个 path `d` 非空字符串、key 与 `ShenzhenDistrict`（除深汕）类型对齐。
- 组件层面：若仓库对图表类组件有既定测试范式则跟随；否则以类型检查 + 手动移动端视口验证（375px）为主，不强行补渲染测试。

## 移动端验证清单（实现后自测）

- 375px 视口下地图不横向溢出、不撑破卡片
- 点击任意区块能正确高亮 + 弹出详情条 + 下钻跳转有效
- 极小面积区块（如盐田/大鹏）仍可点中
- 图例、深汕 chip 在窄屏下正常换行，不与地图重叠

## 附录：全国级视图（2026-07-04 追加）

用户追加需求：地图默认展示**全国**热力分布，点击广东省下钻进入原有的深圳区划热力分布图；同一张卡片内切换（非并列双卡片），显式「返回全国」按钮回退（非双击/点击空白区域，移动端更可靠）。

**技术方案（与原方案一致的零运行时依赖哲学，非引入 ECharts）：**

- 参考图是基于 ECharts 的中国地理地图，但本项目未使用 echarts；为保持与深圳区划图一致的架构（纯 SVG、Tailwind 主题色、无新增运行时依赖），改为：一次性使用开源 `china-geojson`（MIT，antvis）数据源，离线跑一次投影脚本（等距圆柱投影，经纬度 → SVG 坐标），把全国 35 个省级单位（含港澳台、南海诸岛）的路径数据固化为 `src/features/news-tips/lib/china-geo.ts`，与 `shenzhen-geo.ts` 同构。生成脚本本身不进入代码库，只有产物文件入库。
- mock 数据口径：仅广东（代表深圳）按 `dashboard.districts` 汇总的 `totalCount` 着色（蓝→红 diverging，使用 `--chart-2`/`--destructive` 主题色 mix），其余省份统一 `var(--muted)` 灰底、不可点击。
- 交互：点击广东 → 卡片内部 `level` 状态切换到 `'district'`，渲染原深圳区划图内容；`CardHeader` 右侧出现「← 返回全国」按钮，点击切回 `'national'`。两级视图共享同一张 `Card` 外壳，标题/说明文字随 level 变化。

**组件结构调整：**

- `district-heat-map.tsx`：导出改名为 `DistrictHeatMapView`，去掉自带的 `Card`/`CardHeader`，只保留内容（原逻辑不变）。
- 新增 `national-heat-map.tsx`：`NationalHeatMap` 组件，渲染中国省级 choropleth，仅广东可点击下钻。
- 新增 `region-heat-map.tsx`：`RegionHeatMap` 组件，管理 `level` 状态，包一层 `Card`，按 level 渲染 `NationalHeatMap` 或 `DistrictHeatMapView`；这是 `Cockpit` 实际引用的组件（替代原 `DistrictHeatMap`）。

**PRD 同步点：** IA 描述、可视化清单、交互表新增「全国 → 深圳」两级下钻说明；标注 mock 数据仅覆盖广东/深圳，其余省份为占位灰底，非真实统计。
