# @netrix/web

这是 NeTrix MVP 的 Next.js Web 应用目录。

如果需要重新创建完整 app，可使用：

```bash
pnpm create next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

然后安装 UI 和功能依赖：

```bash
cd apps/web
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card badge input textarea dialog skeleton
pnpm add @xyflow/react @supabase/supabase-js react-markdown lucide-react
```

当前实现已经包含一个可运行的最小骨架：入口页、Matrix 页、节点帖子列表、帖子详情页、Oracle mock API 和 demo 数据。

请以 `docs/tech/TECHNO_MVP_EXECUTION_PLAN.md` 作为实现 checklist。
