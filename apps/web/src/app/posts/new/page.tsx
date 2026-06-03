import { ScaffoldPage } from "@/components/scaffold-page";

export default function NewPostPage() {
  return (
    <ScaffoldPage
      route="/posts/new"
      title="新建帖子"
      summary="这里会统一承接问答帖、资源帖和经验分享帖的创建流程。第一轮重点是把帖子类型切换、基础字段和提交状态做出来。"
      owner="Frontend"
      focus={["帖子类型切换", "标题、正文、标签、模块字段", "创建成功与失败状态"]}
      sharedContracts={["Post.type 枚举", "post create action 输入结构", "帖子可见性默认值"]}
    />
  );
}
