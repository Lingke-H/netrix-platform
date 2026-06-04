# 开发契约与约定

## 1. 目的

本文件集中定义 NeTrix MVP 的开发契约与实现范式。它的作用是减少三人开发中的隐性分歧：文件如何命名，数据结构如何组织，server action 和 route handler 如何选择，AI 提示词如何版本化，环境变量如何管理，前端 DTO 与数据库对象如何分离。

若实现中出现本文件未覆盖、但会反复影响团队协作的问题，应补充本文件，而不是让每个 PR 各自采用不同风格。

## 2. 命名约定

TypeScript 变量、字段和函数使用 `camelCase`，React 组件使用 `PascalCase`，文件名默认使用 `kebab-case`。数据库表和 SQL 字段使用 `snake_case`，Drizzle 结构可以将 SQL 字段映射到 TypeScript 中的 `camelCase` 字段。

推荐约定：

```text
React component:        RecommendationCard
Component file:         recommendation-card.tsx
Server service file:    recommendation-service.ts
Schema file:            schemas.ts
Type file:              types.ts
Database table:         connection_requests
Database column:        requester_id
TypeScript field:       requesterId
```

枚举值使用稳定的小写字符串，例如 `question`、`resource`、`experience`、`pending`、`accepted`。不要在界面中手写与数据结构不一致的新状态文本。

## 3. 目录约定

`apps/web` 内部按功能领域组织：

```text
src/features/<domain>/
  components/
  server/
  schemas.ts
  types.ts
```

`src/components/` 只放真正跨功能模块复用的基础界面组件，例如按钮、输入框、徽标、弹窗和外壳布局。业务对象组件留在对应功能模块中，例如 `src/features/recommendations/components/recommendation-card.tsx`。

`src/server/` 放跨模块的服务端基础设施：

```text
src/server/auth/
src/server/db/
src/server/permissions/
src/server/ai/
src/server/events/
```

客户端组件不得直接引入 `src/server/*`。任何需要数据库、AI 密钥、service role key 或权限辅助函数的逻辑，都必须留在服务端边界内。

## 4. 数据结构与校验

Drizzle 结构是数据库结构的 TypeScript 源头。输入校验、server action 校验、DTO 校验和 AI 输出校验使用 Zod，避免不同功能模块各自选择结构校验工具。

每个功能模块的 `schemas.ts` 至少应覆盖：

- 表单输入结构；
- server action 输入结构；
- DTO 结构；
- 与 AI 输出相关的校验结构。

前端组件接收 DTO，不接收数据库原始对象。DTO 应只包含页面需要展示或操作需要提交的字段，避免把私密字段、服务端专用字段或 AI 任务内部信息暴露给组件。

可见性字段统一使用 `private`、`campus`、`public`。第一版 MVP 的界面不开放 `public` 选项；前端表单默认提交 `campus`，私密草稿或不应被发现的内容提交 `private`。后端和 RLS 仍应识别 `public`，但在正式开放前不得把 `public` 当作默认值或通过界面暴露给用户。

`profile.visibility` 与 `post.visibility` 独立生效。已完成基础档案但选择 `private` 的用户仍可创建 `campus` 帖子；帖子内容按帖子自身可见性展示，但 feed、详情页和后续推荐入口中的 `PostAuthorSummary` 不得暴露该用户的 `userId`、`major`、`year` 或真实 `nickname`。此时作者摘要统一显示为 `Private profile`，并保留 `profileVisibility: "private"` 作为界面提示和后续权限判断线索。只有 `campus` 或未来明确开放的 `public` profile 可以在帖子作者摘要中展示学术昵称、专业和年级。

`/profiles/[id]` 必须通过服务端可见性 gate 读取档案。已验证校园用户可以读取 `campus` profile；`private` profile 只能由档案本人或明确的服务端平台权限流程读取，对其他用户应返回不可见状态，不得在页面层绕过服务端判断。第一版 MVP 不在 UI 中开放 `public`，但后端 gate 应保留识别能力。

## 5. Server Actions 与 Route Handlers

默认规则如下：

- 表单类写入操作使用 server action，例如更新档案、创建帖子、请求连接、接受请求。
- 页面初始读取优先使用 Server Component 或服务端数据读取函数。
- route handler 用于触发 AI 任务、异步状态查询、webhook、端到端测试辅助接口或未来外部集成。
- 所有写入操作都要在服务端重新获取会话，不相信前端传入的 `userId`。
- 所有输入都要先校验，再检查权限，最后执行业务操作。

server action 不应包含复杂业务逻辑。它应解析输入、校验会话，然后调用功能模块服务。功能模块服务再调用查询层、权限辅助函数或 AI 封装层。

## 6. 数据访问契约

推荐服务端调用结构如下：

```text
action/route
  -> validate input
  -> require current user/session
  -> permission helper
  -> domain service
  -> Drizzle query
```

不要在页面、组件或 action 中重复拼接复杂查询。若多个地方需要相同数据，应通过功能模块服务或查询辅助函数复用。

涉及连接和消息的逻辑必须以连接状态为准。只要连接尚未接受，就不可创建或写入消息线程。

消息功能保留 `MessageThread` 实体，并使用 `/messages/[threadId]` 作为页面入口。`MessageThread.permissionStatus` 只能作为界面和缓存状态提示，不能替代权限判断。读取线程、创建消息和更新已读状态时，服务端必须通过线程对应的 `Connection` 验证当前用户是已接受连接的一方。

## 7. 环境变量契约

`.env.example` 只能包含占位符，不包含真实密钥。环境变量分为公开变量和服务端变量：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
APP_BASE_URL=
```

`NEXT_PUBLIC_*` 只能用于浏览器可见配置。`SUPABASE_SERVICE_ROLE_KEY`、`DATABASE_URL`、`OPENAI_API_KEY` 不得进入客户端组件，不得写入日志，也不得出现在种子数据或文档示例中。

## 8. AI 提示词契约

所有提示词必须集中在 `src/server/ai/prompts/`，文件名包含任务和版本，例如：

```text
nickname.v1.ts
profile-portrait.v1.ts
recommendation-explanation.v1.ts
```

AI 任务必须记录 `type`、`promptVersion`、`inputSummary`、`output`、`status` 和错误元数据。提示词输入应由结构化构建函数生成，不在界面组件或 route handler 中临时拼接字符串。

输出必须经过结构校验。AI 失败时的回退行为必须明确：昵称和档案可以提示用户手动继续；推荐解释失败时可以展示基于规则的解释或重试入口；任何失败都不能泄露原始提示词或服务端错误。

## 9. 推荐契约

推荐服务输出的 DTO 至少包含：

```text
recommendationId
recommendedUserId
nickname
major
year
profileVisibility
canRequestConnect
profileSummary
sharedSignals
complementarySignals
explanationSummary
conversationStarter
status
```

推荐卡的 profile 字段必须遵守 `profile.visibility`。`campus` 或未来明确开放的 `public` profile 可以展示 `recommendedUserId`、`nickname`、`major`、`year` 和 `profileSummary`，并可设置 `canRequestConnect: true`。`private` profile 不得形成可操作的真实推荐卡；如果系统需要保留一条脱敏 DTO 作为占位或审计提示，必须使用 `recommendedUserId: null`、`nickname: "Private profile"`、`major: null`、`year: null`、`profileSummary: null`、`canRequestConnect: false`、`sharedSignals: []`、`complementarySignals: []`、`conversationStarter: null`，并使用固定隐藏说明，不得泄露可识别档案字段、推荐信号或连接入口。

前端不展示精确分数。后端保存 `scoreSummary` 和 `signalSnapshot`，用于调试和审计。用户操作只能是忽略或请求连接；请求连接成功后，推荐状态更新为 `requested`。

## 10. 界面与文案契约

界面文案应使用稳定术语：

```text
Academic profile
Academic portrait
Recommendation
Connection request
Accepted connection
Q&A post
Resource post
Experience Sharing post
```

同一个概念不要在不同页面使用不同名称。AI 输出在用户确认前必须标记为建议、草稿或优化内容，不得写成系统已经确认的事实。推荐解释应表达相关性，不评价个人能力，也不制造被算法审判的感觉。

设计变量应集中定义，不在每个页面单独发明颜色、间距、圆角和状态样式。帖子类型、请求状态、AI 状态和可见性状态都应使用统一徽标或标签表达。MVP 界面若展示可见性，只展示 `Private` 和 `Campus`，不要展示或引导选择 `Public`。

## 11. 事件契约

事件名称使用过去式或明确动作名，并保持小写 `snake_case`：

```text
profile_completed
post_created
ai_portrait_generated
recommendation_generated
recommendation_clicked
connection_requested
connection_accepted
message_sent
```

事件元数据只保存验证需要的信息，不保存消息正文、完整 AI 提示词、真实联系方式、原始问卷个人信息或敏感档案自由文本。

## 12. 文档契约

若实现改变了以下内容，必须同步更新文档：

- MVP 范围、首批用户切入点、帖子分类、AI 角色、连接模型：更新 `SPEC.md`。
- 技术栈、目录、数据契约、接口约定、AI 提示词契约：更新 `docs/dev`。
- 当前项目状态、已完成里程碑、下一步执行顺序：更新 `STATUS.md`。

文档不是交付后补写的总结。对于会影响多人协作的契约，应先写清楚，再实现。
