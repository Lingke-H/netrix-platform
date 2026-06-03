import { ScaffoldPage } from "@/components/scaffold-page";

export default function OnboardingPage() {
  return (
    <ScaffoldPage
      route="/onboarding"
      title="档案引导与昵称确认"
      summary="这一页会成为用户第一次形成学术身份的地方。前端负责表单体验，后端负责 profile 写入，AI 线后续接昵称建议和画像草稿。"
      owner="Frontend"
      focus={["基础信息表单分步布局", "课程模块、兴趣、帮助需求字段", "昵称建议和预览区块占位"]}
      sharedContracts={["AcademicProfile DTO", "profile completion status", "nickname suggestion output schema"]}
    />
  );
}
