import { ScaffoldPage } from "@/components/scaffold-page";

export default function LibraryPage() {
  return (
    <ScaffoldPage
      route="/library"
      title="资源中心"
      summary="资源中心是辅助入口，用来承接种子资源和被提升展示的资源帖。它需要与主信息流风格一致，但不应该变成一个独立产品。"
      owner="Frontend"
      focus={["资源列表布局", "资源标签与模块筛选", "资源帖与静态资源的统一卡片结构"]}
      sharedContracts={["ResourceItem DTO", "promoted resource rule", "与 Resource post 的映射方式"]}
    />
  );
}
