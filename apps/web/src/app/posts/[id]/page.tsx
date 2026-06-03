import { ScaffoldPage } from "@/components/scaffold-page";

export default function PostDetailPage() {
  return (
    <ScaffoldPage
      route="/posts/[id]"
      title="帖子详情"
      summary="这里负责展示单条帖子、作者学术身份摘要和后续互动入口。当前阶段先预留出内容容器和详情页状态即可。"
      owner="Frontend"
      focus={["帖子详情布局", "作者信息区块", "空状态与未找到页面表现"]}
      sharedContracts={["Post detail DTO", "作者公开档案字段", "帖子类型视觉标签"]}
    />
  );
}
