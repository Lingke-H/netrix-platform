import { ScaffoldPage } from "@/components/scaffold-page";

export default function PublicProfilePage() {
  return (
    <ScaffoldPage
      route="/profiles/[id]"
      title="他人学术档案"
      summary="这个页面负责承接推荐卡片点入后的公开档案展示。它需要严格遵守可见性规则，并与连接操作紧密衔接。"
      owner="Backend"
      focus={["公开字段展示容器", "连接请求按钮位置", "权限不足或不可见状态"]}
      sharedContracts={["公开档案 DTO", "visibility 权限规则", "connection request 状态"]}
    />
  );
}
