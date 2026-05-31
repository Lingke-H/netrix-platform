# NeTrix Platform

NeTrix 是面向 UNNC 学生的 AI 原生学术共创社区 MVP。当前产品方向必须保持克制：先打磨一条高完成度的 Golden Path，证明学生可以进入学术节点、阅读高质量讨论帖，并在以人类为主导的论坛流里主动召唤 AI Oracle 作为“平权回答者”。

## 当前决策

以 **核心 MVP 路线** 为准，不再按早期“大而全平台”路线开工。

- 只在 `apps/web` 中建设一个 Next.js Web 应用。
- 先使用 mock 数据，稳定后再按需接入 Supabase 的 `posts` 和 `comments`。
- 当前阶段不做登录鉴权、复杂 RLS、多表权限体系、FastAPI 匹配微服务，也不做泛校园 super-app。
- 旧规划文档保留为战略演进记录，但不作为 techno 组当前执行依据。

## 仓库结构

```text
apps/
  web/                    Next.js MVP 应用骨架与实现说明
docs/
  biz/                    CVP、USP、验证方法、商业模式建议
  product/                产品定位、项目分析、路线图
  tech/                   技术执行计划、API 合约、验收标准
supabase/
  schema.sql              MVP 阶段最小 posts/comments 表结构
  seed.sql                路演可用种子数据
```

## 快速开始

如果本机没有 pnpm，先启用 corepack：

```bash
corepack enable
corepack prepare pnpm@10.33.2 --activate
```

然后安装依赖并启动：

```bash
corepack pnpm install
corepack pnpm dev
```

## MVP 范围

产品 demo 至少包含：

1. Protocol 与 Plugin 选择入口。
2. 可点击学术节点的赛博神经网络地图。
3. 基于 mock 数据或 Supabase 的论坛列表与帖子详情页。
4. Summon Oracle 流程：包含 loading、类似流式输出的反馈、以及作为普通评论展示的 AI 回答。
5. 一条可以在 3 分钟内完整讲完的路演路径。

## 团队分工

- CS：视觉系统、React Flow 地图、页面切换、论坛 UI。
- EEE：数据加载、Supabase 接入、状态管理、骨架屏与 loading 状态。
- Math：种子内容生成、Oracle prompt/API route、demo 数据质量。
- Biz：niche 验证、CVP/USP、GTM、定价假设、traction 叙事。

## 当前执行依据

- 产品与商业路线：`docs/biz/BIZ_SUGGESTIONS_CVP_USP_MODEL.md`
- 项目进展与路线图：`docs/product/PROJECT_ANALYSIS_AND_ROADMAP.md`
- Techno 执行计划：`docs/tech/TECHNO_MVP_EXECUTION_PLAN.md`
- API 合约：`docs/tech/API_CONTRACTS.md`
