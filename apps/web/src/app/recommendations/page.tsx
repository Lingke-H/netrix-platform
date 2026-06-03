import { ScaffoldPage } from "@/components/scaffold-page";

export default function RecommendationsPage() {
  return (
    <ScaffoldPage
      route="/recommendations"
      title="推荐档案列表"
      summary="推荐页是 AI 与产品价值最直接的交汇处。第一轮需要先把推荐卡片、解释区和请求操作的容器做稳。"
      owner="AI"
      focus={["推荐卡片布局", "解释摘要与对话开场建议", "请求连接与忽略操作状态"]}
      sharedContracts={["Recommendation DTO", "LLM explanation output schema", "dismiss/request 状态流转"]}
    />
  );
}
