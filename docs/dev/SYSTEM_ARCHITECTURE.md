# 系统架构规划

## 1. 架构原则

NeTrix 第一版采用单应用、清边界的架构。它不需要微服务，也不能把全部业务逻辑塞进页面组件。合适的架构应让三人团队快速开发，同时在认证、权限、AI 调用、推荐记录和未来扩展上保持可解释。

运行边界如下：

```text
浏览器界面
  -> Next.js App Router 页面与布局
    -> server actions / route handlers
      -> 功能模块服务与权限辅助函数
        -> Drizzle 查询层
          -> 启用 RLS 的 Supabase Postgres
        -> 服务端 AI 封装层
```

客户端只负责呈现、收集用户意图和触发受控操作。AI 密钥、Supabase service role key、推荐评分、权限判断、提示词输入摘要和涉及 RLS 的敏感操作，都必须留在服务端。

## 2. 仓库形态

第一版代码目录固定为：

```text
apps/web/
  src/app/                  App Router 路由、布局、加载与错误边界
  src/components/           共享基础组件和布局组件
  src/features/             含界面、结构和服务端逻辑的产品功能模块
  src/server/               跨模块服务端代码，包括数据库、认证、AI 和权限
  src/lib/                  共享工具、常量和窄范围辅助类型
  src/styles/               全局样式和设计变量
  drizzle/                  Drizzle 配置和结构迁移输出
  public/                   静态资源
supabase/
  migrations/               RLS 策略和 Drizzle 不负责的 Supabase 专属 SQL
  seed/                     演示种子数据和种子脚本
docs/
  dev/                      开发操作手册
```

`apps/web` 是唯一产品应用入口。不要在根目录同时创建另一个 Next.js 应用，不要把数据库结构散落到多个位置，也不要把一次性种子脚本混进页面目录。

## 3. 功能模块

业务代码按功能领域组织，而不是按“所有组件一个文件夹、所有接口一个文件夹”的机械分层。推荐模块如下：

```text
auth
profile
posts
library
recommendations
connections
messages
events
ai
```

每个模块可以包含 `components/`、`server/`、`schemas.ts`、`types.ts`。页面可以组合多个模块的组件，但数据库读写和状态转换应通过模块内的服务端函数完成。组件不直接拼接数据库字段，不直接调用 LLM，也不绕过权限辅助函数。

推荐依赖方向是：

```text
page -> feature component -> feature action/service -> server/db or server/ai
```

跨模块访问必须通过明确的服务契约。例如推荐模块可以读取档案和帖子信号，但不应在界面组件中同时查询档案、帖子和连接三套表并自行拼接。

## 4. 接口边界

默认使用 Server Components 读取页面所需数据，使用 server actions 处理表单类写入操作，例如更新档案、创建帖子、发起连接请求、接受或拒绝请求。Route handlers 只用于更接近 API 端点的场景，例如触发 AI 任务、webhook、端到端测试辅助接口，或需要由客户端显式请求的异步状态查询。

基本规则如下：

- 写入操作必须在服务端重新校验会话、输入结构和权限，不信任前端隐藏字段。
- route handler 不返回数据库原始对象，只返回前端需要的 DTO。
- server action 不直接承载复杂业务逻辑，应调用功能模块中的服务函数。
- 自由文本进入 AI 之前，必须先检查长度、可见性和使用边界。

## 5. 数据与持久化

数据库使用 Supabase Postgres，数据结构和查询使用 Drizzle。Drizzle 结构是 TypeScript 层面的数据源头，并负责常规结构迁移；Supabase SQL 文件负责 RLS 策略、存储策略、数据库函数或其他 Supabase 专属 SQL。两者必须保持一致，不能出现“应用层认为可读、数据库层却无法阻止越权”的权限空洞。

第一版必须从一开始就实现 RLS，尤其是 `messages`、`connection_requests`、`recommendations`、`ai_jobs` 和私密档案字段。前端隐藏按钮不是权限控制。任何敏感读写都必须同时有服务端权限辅助函数和数据库层策略。

数据迁移、种子数据和类型变更应以小 PR 进入。涉及数据结构的 PR 必须说明：

- 新增或修改的实体。
- 对 RLS 的影响。
- 需要同步更新的 TypeScript 结构或 DTO。
- 是否影响种子数据或端到端核心路径。

## 6. AI 服务边界

AI 只能通过 `src/server/ai` 访问。第一版 AI 服务需要支持提示词版本、结构化输入构建、输出结构校验、AI 任务记录和失败回退。

推荐目录如下：

```text
src/server/ai/
  client.ts
  jobs.ts
  prompts/
    nickname.v1.ts
    profile-portrait.v1.ts
    recommendation-explanation.v1.ts
  schemas/
    nickname.ts
    profile-portrait.ts
    recommendation-explanation.ts
```

LLM 不负责直接决定推荐对象。推荐对象先由规则化候选生成和透明评分产生；LLM 只负责把已经存在的结构化信号转化为用户能理解的解释。

## 7. 环境与部署

环境变量分为公开变量和服务端变量。`NEXT_PUBLIC_*` 只放可以暴露给浏览器的配置，例如 Supabase URL 和 anon key。数据库连接串、service role key、OpenAI/API key 必须留在服务端。

第一版 `.env.example` 应包含占位符：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
APP_BASE_URL=
```

部署目标默认为 Vercel + Supabase。预览部署可以在后续配置，但本地脚手架阶段就应避免把环境变量、API key、真实学生数据、原始问卷或私有日志提交进仓库。

## 8. 架构验收标准

合格的第一版架构应满足以下条件：认证用户与学术档案关系清楚；帖子、档案、推荐、连接和消息的权限边界可解释；AI 调用全部经过服务端封装层；推荐记录可以回溯；核心路径可以通过种子数据重复运行；未来扩展到更多专业或更复杂推荐逻辑时，不需要推翻当前数据模型。
