# Techno MVP 执行计划

## 当前执行依据

本文档是 techno 组当前阶段的执行 source of truth。

本阶段只建设核心 MVP Golden Path。更大的 full-platform 方案作为未来架构参考，不作为当前 sprint 范围。

## MVP 目标

做出一个完成度足够高的 Web 原型，用来证明 H2A2H 闭环：

> 学生进入网络 -> 选择 protocol/plugin -> 打开学术节点 -> 阅读高质量帖子 -> 召唤 Oracle -> 看到 AI 回答以普通评论身份出现 -> 人类评论/投票仍然是信任核心。

## 当前不做

本轮 sprint 不做：

- Supabase Auth。
- 用户注册/登录。
- RLS-heavy 权限模型。
- FastAPI 匹配微服务。
- 完整资源中心。
- 全校所有节点。
- 复杂审核/后台管理系统。
- 真实支付或 billing。

## 技术栈

- Next.js App Router。
- TypeScript。
- Tailwind CSS。
- shadcn/ui components。
- React Flow 用于赛博节点地图。
- Supabase 只作为可选 `posts` 和 `comments` 数据源。
- Next.js API route 负责 Oracle 回答。

## 目录规划

```text
apps/web/
  src/app/
    page.tsx                    入口页 / protocol 选择
    matrix/page.tsx             赛博学术地图
    node/[slug]/page.tsx        节点论坛列表
    post/[id]/page.tsx          帖子详情与 Oracle 评论
    api/oracle/route.ts         LLM 接口
  src/components/
    matrix/                     React Flow 节点与边
    forum/                      帖子卡片、评论列表、Oracle 按钮
    layout/                     页面外壳与导航
    ui/                         shadcn 组件
  src/data/
    mock.ts                     Demo 内容
  src/lib/
    supabase.ts                 可选 Supabase client
    oracle.ts                   Prompt builder
    types.ts                    共享领域类型
```

## 工作包

### CS：视觉与交互

验收标准：

- protocol/plugin 入口页能用本地状态跑通。
- 赛博地图展示 4-6 个节点，但只有 1-2 个节点需要真实点击进入。
- hover/click 状态有明确反馈，适合路演展示。
- 论坛列表和帖子详情页具备响应式表现。

### EEE：数据与集成

验收标准：

- 第一天就有 mock data loader。
- Supabase 开关由 `NEXT_PUBLIC_USE_MOCK_DATA` 控制。
- `getPosts`、`getPost`、`createComment`、`appendOracleComment` 的函数签名稳定。
- loading 和 error 状态不会导致白屏。

### Math：内容与 Oracle

验收标准：

- 准备 20-30 条种子学术帖子/评论。
- Oracle system prompt 能产出简洁、有用、有本地语境的回答。
- `api/oracle/route.ts` 在没有 LLM key 时有 mock fallback。
- demo script 中包含一条强 Oracle 回答和一条人类纠错。

## Demo Script

目标：3 分钟内讲完。

1. 打开 NeTrix，选择 `Seeker` protocol 和一个 quantitative plugin。
2. 进入 Matrix，点击 Quant / Math Modeling 节点。
3. 打开一条带有真实学术痛点的种子帖子。
4. 点击 Summon Oracle。
5. 展示 AI 回答进入和人类同一条 comment stream。
6. 展示人类纠错/upvote 是建立信任的关键机制。
7. 用 “private AI chats become reusable campus knowledge” 收束叙事。

## 质量标准

- 不能白屏。
- 所有可见按钮要么可用，要么以清晰状态 disabled。
- 文本在 laptop 和 mobile 宽度下不能溢出。
- 即使 Supabase 或 LLM 不可用，mock 数据也能撑完整个 demo。
- demo freeze 前必须通过 `corepack pnpm lint` 和 `corepack pnpm typecheck`。

## Sprint 顺序

### Day 1

- 创建 Next.js app。
- 加入 Tailwind/shadcn。
- 加入 mock 领域类型和种子内容。
- 完成入口页和 matrix 页。

### Day 2

- 完成论坛列表和帖子详情。
- 加入 comment stream 和 Oracle 按钮。
- 加入带 mock fallback 的 API route。

### Day 3

- 加入 Supabase schema 和可选 client。
- 如果稳定，把选定路径从 mock 替换成真实 posts/comments。
- 打磨 loading 状态。

### Day 4

- 锁定 demo 数据。
- 排练路演路径。
- 只修视觉 bug 和流程阻塞问题。
