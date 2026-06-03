# NeTrix Web App

本文件说明 `apps/web` 的本地启动方式、当前脚手架范围，以及三位开发者在应用目录中应优先关注的位置。

## 1. 当前状态

`apps/web` 是 NeTrix 第一版 MVP 的唯一产品应用入口。当前已经完成的内容包括：

- Next.js App Router、TypeScript、Tailwind CSS、ESLint、Vitest、Playwright 与 Drizzle 的工程基线。
- `src/app` 下的核心路由骨架与通用布局。
- `src/features` 下按功能领域拆分的 DTO、Zod 校验结构与类型文件。
- `src/server` 下的认证、数据库、权限、AI 与事件记录入口。
- `src/lib` 和 `src/components` 下的共享基础工具与界面壳层。

这意味着你不需要从零重新组织应用目录，也不需要再发明数据对象命名。请直接在现有基线之上工作。

## 2. 本地启动

在仓库根目录运行：

```bash
corepack pnpm install
cp .env.example apps/web/.env.local
corepack pnpm dev
```

如果你已经位于 `apps/web` 目录，也可以直接执行：

```bash
corepack pnpm dev
```

真实的 Supabase、数据库和 OpenAI 功能需要在 `apps/web/.env.local` 中填写有效值；仅浏览页面骨架时，可先保留占位值。

## 3. 常用验证

在仓库根目录运行：

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm test:e2e
```

当前 `test:e2e` 仍是占位基线，尚未包含真实场景脚本。后续迭代应补上针对核心闭环的端到端测试。

## 4. 目录地图

```text
apps/web/
  src/app/           路由与页面入口
  src/components/    跨模块复用的基础界面组件
  src/features/      按业务领域拆分的组件、schema 与类型
  src/lib/           路由常量、环境变量读取、通用工具
  src/server/        认证、数据库、权限、AI、事件记录
  src/styles/        设计变量
  tests/e2e/         端到端测试
  drizzle.config.ts  Drizzle 配置
```

## 5. 三位开发者的落点

- 前端与产品流程负责人：优先关注 `src/app`、`src/components`、`src/features/*/components`。
- 后端、数据与认证负责人：优先关注 `src/server/auth`、`src/server/db`、`src/server/permissions`、`supabase/`。
- AI、推荐与质量负责人：优先关注 `src/server/ai`、`src/features/recommendations`、`src/features/ai`、`tests/`。

## 6. 当前第一轮目标

第一轮不是把所有功能做完，而是尽快合并出这条最小路径：

```text
demo user -> profile -> post -> recommendation card -> request connect
```

第二轮再补：

```text
accept/reject -> message thread -> event logging -> seed data -> tests
```
