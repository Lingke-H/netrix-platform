import { ScaffoldPage } from "@/components/scaffold-page";

export default function MessageThreadPage() {
  return (
    <ScaffoldPage
      route="/messages/[threadId]"
      title="消息线程"
      summary="消息线程只对已接受连接的双方开放。第一轮先保留线程结构和权限提示，第二轮再接实际消息收发。"
      owner="Backend"
      focus={["线程头部信息", "已接受连接提示", "权限不足与空线程状态"]}
      sharedContracts={["MessageThread DTO", "accepted-only permission rule", "message create action"]}
    />
  );
}
