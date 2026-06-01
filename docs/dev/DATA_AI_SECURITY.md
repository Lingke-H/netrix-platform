# 数据、AI 与安全设计

## 1. 数据原则

NeTrix 的数据模型围绕学术信号的流动设计。帖子是公开学术信号，学术档案是用户确认的身份结构，学术画像是 AI 对用户学术身份的辅助整理，推荐是系统基于信号生成的连接建议，连接和消息是双方同意后的私域沟通。

第一版数据库必须从一开始处理三件事：用户身份可信，推荐理由可回溯，消息权限不可绕过。若这些基础设计错误，后续即使界面完成，也无法成为可信平台。

## 2. 最小数据契约

以下实体构成第一版最小数据契约。字段名称可以在 Drizzle 结构中进一步细化，但实体责任不得改变。

| 实体 | 责任 | MVP 必要字段 |
| --- | --- | --- |
| `User` | 映射 Supabase 认证用户与应用内身份。 | `id`、`authUserId`、`email`、`emailDomain`、`verifiedAt`、`role`、`createdAt` |
| `AcademicProfile` | 保存用户确认的基础学术资料。 | `userId`、`nickname`、`major`、`year`、`modules`、`interests`、`skills`、`helpOffered`、`helpNeeded`、`collaborationPreference`、`visibility`、`completionStatus` |
| `AcademicPortrait` | 保存 AI 生成并等待用户确认的档案草稿或优化建议。 | `userId`、`sourceSnapshot`、`summary`、`suggestedTags`、`strengthsDraft`、`collaborationDraft`、`status`、`confirmedAt` |
| `Post` | 保存问答、资源和经验分享内容。 | `authorId`、`type`、`title`、`body`、`tags`、`modules`、`visibility`、`status`、`createdAt` |
| `ResourceItem` | 保存资源库中被精选或提升展示的资源。 | `sourcePostId`、`title`、`description`、`url`、`tags`、`modules`、`curationStatus` |
| `Recommendation` | 保存推荐结果、信号快照和解释。 | `recipientUserId`、`recommendedUserId`、`signalSnapshot`、`scoreSummary`、`explanation`、`status`、`generatedByJobId` |
| `ConnectionRequest` | 保存请求、接受、拒绝或取消状态。 | `requesterId`、`recipientId`、`status`、`message`、`createdAt`、`respondedAt` |
| `Connection` | 保存已接受的连接关系。 | `userAId`、`userBId`、`requestId`、`createdAt` |
| `Message` | 保存已接受连接中的消息。 | `connectionId`、`senderId`、`body`、`createdAt`、`readAt` |
| `AIJob` | 保存 AI 调用记录与调试信息。 | `type`、`promptVersion`、`inputSummary`、`output`、`status`、`errorCode`、`createdBy` |
| `EventLog` | 保存产品验证所需行为事件。 | `actorId`、`eventType`、`objectType`、`objectId`、`metadata`、`createdAt` |

`AcademicProfile` 与 `AcademicPortrait` 必须分离。前者代表用户确认的事实，后者代表 AI 草稿。AI 生成内容只有在用户确认后，才可以成为公开档案的一部分。

## 3. 状态契约

核心状态应使用有限枚举，避免自由文本状态在前后端漂移。

```text
Post.type:                  question | resource | experience
Post.status:                draft | published | archived
Visibility:                 private | campus | public
Profile.completionStatus:   incomplete | basic_complete | recommendation_ready
Portrait.status:            draft | confirmed | dismissed | failed
Recommendation.status:      active | dismissed | requested | expired
ConnectionRequest.status:   pending | accepted | rejected | cancelled
AIJob.status:               queued | running | succeeded | failed
```

这些枚举应同时出现在 Drizzle 结构、校验结构和前端 DTO 中。不要在页面中手写新的状态字符串。

## 4. 权限矩阵

权限模型采用默认最小可见性。已验证校园用户可以查看校园可见的帖子和基础档案，但不能查看他人的推荐记录、AI 任务、私密档案字段或消息。

| 对象 | 读取权限 | 写入权限 |
| --- | --- | --- |
| 自己的 `AcademicProfile` | 所有者 | 所有者 |
| 校园可见的档案字段 | 已验证校园用户 | 仅所有者 |
| `AcademicPortrait` 草稿 | 所有者 | 所有者通过 AI 或档案服务写入 |
| 已发布的校园可见 `Post` | 已验证校园用户 | 作者创建和编辑自己的帖子 |
| `ResourceItem` | 已验证校园用户 | MVP 中由应用或演示种子流程精选 |
| `Recommendation` | 推荐接收者 | 仅推荐服务 |
| `ConnectionRequest` | 请求方和接收方 | 请求方创建或取消，接收方接受或拒绝 |
| `Connection` | 已连接双方 | 只能由已接受请求创建 |
| `Message` | 已连接双方 | 发送者必须是已接受连接的一方 |
| `AIJob` | 所有者或服务角色 | 仅 AI 服务 |
| `EventLog` | 服务或分析权限 | 仅服务端事件服务 |

RLS 策略和服务端权限辅助函数必须同时存在。前端隐藏按钮不是权限控制；server action 也不能只依赖前端传入的用户编号。

## 5. 推荐流程

第一版推荐采用透明的混合流程：

```text
资格过滤
  -> 候选生成
  -> 透明评分
  -> LLM 解释
  -> 推荐记录
  -> 用户操作：忽略 / 请求连接
```

资格过滤需要排除自己、未完成基础档案的用户、可见性不允许被发现的用户、已经连接的用户、已有待处理请求的用户，以及近期被忽略的用户。候选生成使用专业、课程模块、兴趣、可提供帮助、需要帮助、协作偏好和近期公开帖子。

MVP 默认评分可以采用简单可解释权重，不在前端展示具体分数：

```text
同专业：                         +3
共同课程模块：                   每项 +2，最高 +6
共同学术兴趣：                   每项 +1，最高 +4
可提供帮助与需要帮助相匹配：       +4
协作风格兼容：                   +2
近期相关帖子信号：               每项 +1，最高 +3
跨年级帮助潜力：                 相关时 +2
```

LLM 只接收已经筛选出的结构化信号，并生成自然语言解释。LLM 不得直接选择候选人，不得读取私信内容，不得使用外部 AI 记忆，也不得把缺失信息补成事实。

## 6. AI 契约

第一版 AI 只承担三类任务：学术昵称建议、学术画像优化、推荐解释。

昵称输出应包含 3-5 个候选昵称、每个候选的简短理由，并避免过度夸张或职业化的语气。最终昵称必须经过唯一性检查和用户确认。

学术画像输出应包含简洁的学术摘要、兴趣与标签、可提供帮助和需要帮助的优化表达、协作风格草稿，以及置信度说明。它只能整理用户主动填写或公开确认可用的信号。

推荐解释输出应包含一句摘要、共同信号、互补信号、对话开场建议和置信度说明。解释必须说明“为什么这个人可能相关”，不能评价用户能力高低，也不能暗示系统知道用户未提供的个人信息。

所有 AI 输出必须经过结构校验。失败时应保存 `AIJob.status = failed`，并向前端返回可恢复状态。不要让 AI 失败造成页面空白或阻断非 AI 核心操作。

## 7. 事件记录与隐私

事件记录用于验证产品闭环，不用于收集不必要的个人内容。MVP 应记录行为类型和对象编号，例如：

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

事件元数据不应保存消息正文、完整提示词、原始问卷个人信息、真实学生联系方式或敏感档案自由文本。AIJob 可以保存输入摘要和输出结构，但应避免保存超出调试与审计所需的完整原文。

## 8. 种子数据

第一版需要种子数据来避免空社区问题。种子数据必须明确标记为演示或种子内容，不得伪装成真实用户。建议准备覆盖 Math、CS、EEE 的演示档案、问答帖、资源帖和经验分享帖，并包含足够的重叠课程模块和兴趣，让推荐流程能生成可解释结果。

种子数据不应使用真实学生姓名、邮箱、头像、联系方式或问卷原始记录。若需要展示学生感，应使用明显虚构的学术昵称和通用学习场景。

## 9. 安全验收标准

数据与 AI 层完成时，至少应满足：RLS 覆盖敏感表；服务端权限辅助函数与 RLS 语义一致；AI 密钥和 service role key 不进入前端包；推荐记录可回溯；消息无法被非连接用户读取；演示数据不污染真实用户数据；事件记录不保存不必要的自由文本隐私。
