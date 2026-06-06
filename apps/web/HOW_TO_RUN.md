# NeTrix 网站本地启动指南

这个文件教你如何在本地把我们正在做的 NeTrix 网站跑起来。它只覆盖**启动和基础检查**，不讲产品设计。

## 1. 你需要先准备什么

- 已安装 `Node.js`
- 已安装 `pnpm`（或者能使用 `corepack`）
- 可以访问本仓库代码
- 如果要真正登录、连数据库、接 AI，需要准备环境变量

## 2. 进入项目根目录

先打开仓库根目录，也就是：

```text
c:\Users\xiayh\Desktop\file\NeTrix\NeTrix-Platform
```

如果你在其他目录，先切换进去。

## 3. 安装依赖

在仓库根目录执行：

```bash
corepack pnpm install
```

这一步会安装整个工作区的依赖。

## 4. 配置环境变量

把根目录的 `.env.example` 复制到 `apps/web/.env.local`：

```bash
copy .env.example apps/web\.env.local
```

然后打开 `apps/web/.env.local`，按需填写这些值：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `APP_BASE_URL`

如果你只是本地看页面骨架，很多值可以先留空；但如果要真正跑认证、数据库和 AI，就要填真实值。

## 5. 启动网站

在仓库根目录执行：

```bash
corepack pnpm dev
```

如果你已经进入了 `apps/web` 目录，也可以直接执行：

```bash
corepack pnpm dev
```

启动后，默认会在本地开发服务器地址打开。

## 6. 打开网站

浏览器访问：

```text
http://127.0.0.1:3000
```

或者终端里提示的本地地址。

## 7. 常见检查命令

如果你想确认项目有没有基本问题，可以在仓库根目录执行：

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
```

如果想做构建检查，再执行：

```bash
corepack pnpm build
```

## 8. 如果启动失败，先看什么

### 依赖没装好
重新执行：

```bash
corepack pnpm install
```

### 环境变量缺失
检查 `apps/web/.env.local` 是否存在，以及里面是否有关键字段。

### 数据库或 AI 报错
说明你填的后端服务信息还不完整，先确认：
- Supabase
- PostgreSQL
- OpenAI / 兼容模型服务

## 9. 这个网站现在能看到什么

当前应用主要还是 MVP scaffold，所以你会看到：
- 路由骨架
- 基础布局
- 页面占位
- 业务领域结构
- AI / 推荐相关的基础模块

它还不是完整上线版本，但可以作为开发基线运行。

## 10. 给新手的一句话

如果你只是想把网站跑起来，最少只要记住这三步：

```bash
corepack pnpm install
copy .env.example apps/web\.env.local
corepack pnpm dev
```
