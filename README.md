<h1 align="center">深圳报料数据驾驶舱</h1>

<div align="center">面向新闻媒体报料线索运营的数据驾驶舱 · 基于 Next.js 16 + shadcn/ui 构建</div>

<br />

## 项目简介

本项目是「8 小时单人全栈 AI 挑战赛 · 报料数据驾驶舱 H5」题目的实现：将分散的深圳本地报料记录整合为**一张驾驶舱仪表盘**，帮助新闻媒体运营人员**一眼掌握全局态势**——今日新增、处理进度、热点分布、趋势走向，并支持多维度下钻与数据导出。

完整产品需求见 [docs/prd.md](./docs/prd.md)。

### 产品原则

1. **先判断，再解释，最后下钻**：首页给判断（现在什么情况、该先看什么），工作台给操作（逐条处理、流转、导出）。
2. **观察与操作分离**：只「看」的内容留在驾驶舱首页；需要「动手」的内容（分诊、状态流转、筛选导出）放进工作台。
3. **深圳本地真实感**：区划、街道、来源平台、报道题材均取材于深圳本地公开信息抽象而成，不使用其他城市数据，不做随机假数据。
4. **不做装饰性大屏**：面向新闻编辑室的真实线索分诊台，信息密度优先，不堆砌营销式 Hero。

## 信息架构

系统由两个一级导航组成：一个驾驶舱首页 + 一个工作台目录（下挂两个模块）。

```
【驾驶舱】首页（/dashboard/news-tips）
  ├ 态势总览      今天该先看什么，可点击联动到工作台
  ├ 今日新增 KPI  今日报料 / 平均处理时长 / 处理完成率 / 采用率 + 迷你趋势
  ├ 处理进度概览  待审核 / 跟进中 / 已采用 / 不予采用 的流转
  ├ 热点分布      全国报料热力分布图（点击广东下钻深圳区划）+ 类型分布 + 来源渠道占比
  ├ 趋势走向      报料量 + 处理完成率双轴，日 / 周 / 月粒度
  └ 待办预览      Top N 高优先级线索，「查看全部」进工作台

【工作台】
  ├ 线索明细（/dashboard/news-tips/records）
  │   全量筛选 / 排序 / 行展开 / 逐条分诊指派 / CSV 导出，含「今日待办」快捷筛选
  └ 处理流转（/dashboard/news-tips/flow）
      按状态组织的看板：待审核 → 跟进中 → 已采用 / 不予采用
```

驾驶舱首页只回答「现在什么情况」，需要深入操作一律引导进工作台；首页图表点击「下钻」即跳转到「线索明细」并自动带上对应筛选。

移动端（< md 断点）首页热点分布区块改为排行榜形式，底部新增 Tab 栏用于在驾驶舱 / 线索明细 / 处理流转之间快速切换。

## 技术栈

- 框架 —— [Next.js 16](https://nextjs.org/16)（App Router）
- 语言 —— [TypeScript](https://www.typescriptlang.org)
- 样式 —— [Tailwind CSS v4](https://tailwindcss.com)
- 组件库 —— [shadcn/ui](https://ui.shadcn.com)
- 图表 —— [Recharts](https://recharts.org)
- 数据请求 —— [TanStack React Query](https://tanstack.com/query)（`prefetchQuery` + `useSuspenseQuery` + `HydrationBoundary`）
- URL 状态 —— [nuqs](https://nuqs.47ng.com/)
- 表格 —— [TanStack Data Table](https://ui.shadcn.com/docs/components/data-table)
- 表单 —— [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev)
- 代码检查 / 格式化 —— [OxLint](https://oxc.rs/docs/guide/usage/linter) · [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- 提交钩子 —— [Husky](https://typicode.github.io/husky/)

## 目录结构

```plaintext
src/
├── app/
│   └── dashboard/
│       └── news-tips/              # 报料驾驶舱路由
│           ├── page.tsx            # 驾驶舱首页
│           ├── layout.tsx          # 移动端底部 Tab 栏布局
│           ├── records/            # 线索明细
│           └── flow/               # 处理流转看板
│
├── features/
│   └── news-tips/                  # 报料驾驶舱功能模块
│       ├── api/                    # 类型 / mock service / React Query
│       ├── components/             # KPI 卡片、热力图、趋势图、看板、表格等
│       ├── hooks/                  # 筛选、下钻等业务 hook
│       ├── constants/              # 深圳区划、来源平台等本地化常量
│       ├── lib/                    # 优先级规则、导出等纯函数
│       └── utils/                  # 工具函数
│
├── components/                     # 通用布局与 UI（header、sidebar、主题等）
├── lib/                             # 核心工具（query-client、searchparams 等）
├── hooks/                           # 通用 hook
├── config/                          # 导航、数据表配置
└── types/                           # 全局类型定义
```

## 本地开发

```bash
# 安装依赖
bun install   # 或 npm install / pnpm install

# 启动开发服务器
bun run dev
```

访问 http://localhost:3000/dashboard/news-tips 查看驾驶舱首页。

### 常用脚本

- `bun run dev` —— 本地开发
- `bun run build` —— 生产构建
- `bun run lint` / `bun run lint:fix` —— 代码检查
- `bun run format` —— 代码格式化

## 数据说明

所有数据均为**本地化 mock 数据**，覆盖约 180 天、600 条以上报料记录：

- 区划覆盖深圳 9 个行政区 + 大鹏新区，深汕特别合作区作为应急补充；不出现其他城市区划。
- 来源平台涵盖深圳新闻网、问政深圳、读特客户端、深圳特区报等 8 个本地媒体 / 渠道。
- 报道题材抽象自深圳本地公开报道（如排水设施投诉、暴雨应急、交通占道等），不复制原文、不伪造具体新闻结论。

详见 [PRD 第 6 章「深圳本地化事实源」](./docs/prd.md#6-深圳本地化事实源)。

## 相关文档

- [docs/prd.md](./docs/prd.md) —— 产品需求文档
- [docs/superpowers/specs/](./docs/superpowers/specs/) —— 各阶段设计方案
- [AGENTS.md](./AGENTS.md) —— 项目整体约定与技术规范
- [docs/forms.md](./docs/forms.md) —— 表单系统说明
- [docs/themes.md](./docs/themes.md) —— 主题系统说明
