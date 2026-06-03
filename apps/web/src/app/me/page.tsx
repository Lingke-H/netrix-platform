import { ScaffoldPage } from "@/components/scaffold-page";

export default function MePage() {
  return (
    <ScaffoldPage
      route="/me"
      title="我的学术档案"
      summary="这里负责展示用户已确认的学术档案、AI 画像草稿和可见性设置。第一轮先把展示容器和编辑入口留好。"
      owner="Frontend"
      focus={["档案概览布局", "AI 草稿与已确认内容区分", "可见性与编辑入口占位"]}
      sharedContracts={["AcademicProfile DTO", "AcademicPortrait status", "visibility 枚举与权限文案"]}
    />
  );
}
