# NeTrix Platform

NeTrix 是一个面向 UNNC 学生的 AI 辅助学术连接网络。它希望让学术问题、学习资源、学习经验、个人学术身份和同伴连接在校园内更高效地流动。

本仓库目前是一个以方向确认为核心的项目工作区。在新的技术脚手架重新引入之前，仓库只保留用于对齐产品战略、商业规划和 MVP 实施的必要文档。早期原型中的旧假设已经移除，后续工作应从当前产品主线出发，而不是沿用已经过时的界面或架构实验。

## 战略基线

当前战略方向由 [docs/strategy/DIRECTION_MEMO.md](docs/strategy/DIRECTION_MEMO.md) 定义。简而言之，NeTrix 将从 UNNC 的 Math、Computer Science 和 EEE 学生切入，并验证以下产品循环：

```text
学术帖子 -> 学术档案 -> AI 辅助推荐 -> 学术连接
```

第一版 MVP 不是校园超级应用、通用 AI 聊天机器人，也不是静态资源目录。它的目标是验证学生是否愿意通过帖子分享学术信号，是否能将这些信号转化为可信的学术档案，并进一步通过 AI 辅助推荐发现相关同伴。

## 仓库规范源

本仓库围绕少量核心文档组织。每个文件都有明确作用，确保后续商业和技术工作可以引用同一套基线。

| 文件 | 作用 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Codex 和其他 AI 辅助贡献者的协作协议。 |
| [SPEC.md](SPEC.md) | 产品与工程的权威规范。产品方向发生变化时，必须先更新该文件，再开始实施。 |
| [STATUS.md](STATUS.md) | 当前项目状态、开放工作流和近期执行顺序。 |
| [docs/strategy/DIRECTION_MEMO.md](docs/strategy/DIRECTION_MEMO.md) | 用于商业计划撰写和 MVP 规划的战略方向备忘录。 |
| [docs/business/](docs/business) | 商业规划指导，覆盖商业计划结构、CVP、USP、收入逻辑、问卷分析、验证计划和路演叙事。 |
| [docs/dev/](docs/dev) | 中文开发操作手册，覆盖已锁定的 MVP 技术栈、架构、契约、协作流程、数据、AI、安全和交付质量。 |

## 工作协议

所有贡献者在修改产品范围、技术范围或文档结构之前，都应先阅读 `SPEC.md` 和 `STATUS.md`。方向备忘录是战略叙事基线，`SPEC.md` 是产品和工程决策的操作性约束。

当产品方向发生变化时，必须先更新 `SPEC.md`。当当前项目状态发生变化时，必须更新 `STATUS.md`。新的商业计划文档或 MVP 实施文档应在这些文件基础上延展，不应重复或违背其中内容。

## 当前范围

第一版 MVP 应聚焦一个基于网页的学术社区体验，并包含三类帖子：问答帖、资源帖和经验分享帖。核心 AI 功能是学术档案生成或优化，以及学术连接推荐。连接机制应保持明确意图：用户发起连接请求，接收方接受或拒绝，私信功能仅在接受之后开放。

初始用户切入点是 Math、Computer Science 和 EEE 学生。FAM、IBE 以及更广泛的 UNNC 学生群体，是第一轮切入点获得更强验证之后的扩展机会。

## 下一步工作流

`docs/business/` 已经提供第一套商业计划写作体系，`docs/dev/` 则将同一产品主线转化为实施操作手册。第一版 MVP 的技术基线已锁定为：`apps/web`、Next.js App Router、TypeScript、Tailwind CSS、Supabase Auth/Postgres、Drizzle、服务端 LLM 调用，以及 `corepack pnpm`。

仓库的下一个主要增量应是实际的网页 MVP 脚手架。该脚手架应基于开发手册构建，而不是重新展开架构讨论。
