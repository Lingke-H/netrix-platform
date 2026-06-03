import { ScaffoldPage } from "@/components/scaffold-page";

export default function ConnectionsPage() {
  return (
    <ScaffoldPage
      route="/connections"
      title="连接管理"
      summary="这里承接待处理请求、已接受连接和已拒绝记录。它是从推荐进入私域沟通前的状态汇总页。"
      owner="Backend"
      focus={["待处理列表", "接受与拒绝操作占位", "已接受连接摘要"]}
      sharedContracts={["ConnectionRequest status", "Connection DTO", "accept/reject action 输入输出"]}
    />
  );
}
