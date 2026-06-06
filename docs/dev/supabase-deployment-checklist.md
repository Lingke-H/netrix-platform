# Supabase Deployment Checklist

本文档用于 NeTrix 上线或演示环境切换前的认证与数据库配置检查。它覆盖 Supabase Auth、回调 URL、邮件模板、公开 anon key、服务端 service role key、Postgres 连接串，以及运行时健康检查。

`/api/health` 可以检查应用实际读取到的环境变量、数据库连通性和 Supabase service role 是否可用；Supabase 控制台中的邮件模板和 Redirect URL allowlist 仍需要人工确认。

## 1. 必填环境变量

在部署平台和 `apps/web/.env.local` 中确认以下变量已配置。不得把真实值提交到仓库。

| 变量 | 位置 | 用途 | 验收标准 |
| --- | --- | --- | --- |
| `APP_BASE_URL` | Server | 生成 Supabase email link 回调地址。 | 使用真实站点 origin，例如 `https://netrix.example`，不得使用本地地址作为生产值。 |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase Auth 和客户端会话配置。 | 指向当前项目 URL，通常形如 `https://<project-ref>.supabase.co`。 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | 浏览器可见 Supabase anon key。 | 使用 Supabase anon/public key，不得填 service role key。 |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | 服务端诊断和后续 privileged backend work。 | 只存在服务端环境变量中，不得暴露给浏览器或日志。 |
| `DATABASE_URL` | Server | Drizzle 和 Supabase Postgres 连接。 | 指向同一个 Supabase Postgres 项目，并能执行简单查询。 |
| `OPENAI_API_KEY` | Server | 服务端 LLM 能力。 | AI 功能启用前必须配置；认证和数据库健康检查不依赖它。 |

## 2. Supabase Auth 控制台检查

在 Supabase Dashboard 中检查以下项目。

| 项目 | 位置 | 验收标准 |
| --- | --- | --- |
| Site URL | Authentication -> URL Configuration | 与 `APP_BASE_URL` 一致。 |
| Redirect URLs | Authentication -> URL Configuration | 必须包含 `/api/health` 返回的 `expectedAuthCallbackUrl`，即 `<APP_BASE_URL>/auth/callback`。 |
| Email provider | Authentication -> Providers -> Email | Email provider 已启用，允许 email link 或 OTP 登录。 |
| Email template | Authentication -> Email Templates | Magic link 模板包含 Supabase 提供的确认链接变量，并说明用户将返回 NeTrix。 |
| Campus domain policy | NeTrix app config | 应用层只接受 `@nottingham.edu.cn`；如需扩大域名，必须先更新 `SPEC.md`。 |
| SMTP / rate limits | Authentication -> SMTP Settings / Rate Limits | 演示或用户测试前确认发送额度足够，避免 magic link 无法送达。 |

邮件模板建议包含以下信息：

- 产品名：NeTrix。
- 行为说明：使用 UNNC campus email 登录或验证。
- 安全提示：如果用户没有发起登录，可以忽略邮件。
- 回跳说明：验证后会回到 NeTrix。

## 3. 运行时健康检查

部署后访问：

```bash
curl https://<deployment-host>/api/health
```

返回结构包含：

| 字段 | 含义 |
| --- | --- |
| `status` | `ok` 表示全部通过；`degraded` 表示存在人工确认项或跳过项；`error` 表示必要配置或探测失败。 |
| `expectedAuthCallbackUrl` | 应填入 Supabase Redirect URLs 的回调地址。 |
| `checks` | 环境变量和配置一致性检查，不包含任何 secret 原文。 |
| `probes` | 运行时探测，包括数据库 `select 1` 和 Supabase admin API service role 验证。 |

HTTP 状态码规则：

- `200`：`status` 为 `ok` 或 `degraded`。
- `503`：`status` 为 `error`，说明部署不能视为可用。

`AUTH_CALLBACK_URL` 目前会返回 `warn`，因为应用只能推导期望值，不能读取 Supabase Dashboard 的 Redirect URL allowlist。上线前必须人工核对。

## 4. 上线前验收顺序

1. 在 Supabase 创建或确认目标项目。
2. 配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`、`DATABASE_URL` 和 `APP_BASE_URL`。
3. 执行数据库迁移或 push，并运行 seed 或必要的演示数据准备。
4. 在 Supabase Auth 中配置 Site URL 和 Redirect URLs。
5. 检查 Email provider、邮件模板、SMTP 或发送额度。
6. 访问 `/api/health`，确认没有 `fail` 项。
7. 访问 `/auth`，使用 `@nottingham.edu.cn` 邮箱请求 magic link。
8. 点击邮件链接，确认回到 `<APP_BASE_URL>/auth/callback` 后进入 NeTrix。
9. 完成 academic profile，确认可进入 feed、recommendations、connections 和 messages。

## 5. 失败处理

| 现象 | 优先检查 |
| --- | --- |
| `/api/health` 返回 `DATABASE_URL fail` | 部署环境是否配置了数据库连接串，连接串是否指向当前 Supabase 项目。 |
| `/api/health` 返回 `supabase_service_role fail` | `SUPABASE_SERVICE_ROLE_KEY` 是否来自同一 Supabase 项目，是否误填 anon key。 |
| `/auth` 显示 Supabase env missing | `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否存在。 |
| 邮件发送失败 | Supabase Email provider、SMTP、发送额度、模板变量是否配置正确。 |
| 点击邮件后不能回到应用 | Supabase Redirect URLs 是否包含 `/api/health` 中的 `expectedAuthCallbackUrl`。 |
| 非校园邮箱进入系统 | 检查 `src/server/auth/config.ts` 中的 allowed email suffix，变更前必须更新 `SPEC.md`。 |
