import { ScaffoldPage } from "@/components/scaffold-page";

export default function AuthPage() {
  return (
    <ScaffoldPage
      route="/auth"
      title="认证与校园邮箱入口"
      summary="这个路由将承接 Supabase Auth、邮箱验证和会话恢复逻辑。第一轮只需要把页面骨架、状态槽位和后端接入边界留好。"
      owner="Backend"
      focus={["登录与注册 UI 容器", "邮箱验证状态反馈", "会话恢复与错误态占位"]}
      sharedContracts={["Supabase Auth 流程", "校园邮箱域名规则", "认证失败与过期状态文案"]}
    />
  );
}
