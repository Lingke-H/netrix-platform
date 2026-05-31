# API 合约

## 领域类型

```ts
export type Protocol = "seeker" | "oracle" | "builder" | "stealth";

export interface Post {
  id: string;
  hubSlug: string;
  authorName: string;
  authorPlugin: string;
  title: string;
  content: string;
  createdAt: string;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  isAiGenerated: boolean;
  createdAt: string;
}
```

## 数据函数

```ts
getPosts(hubSlug?: string): Promise<Post[]>
getPost(postId: string): Promise<Post | null>
getComments(postId: string): Promise<Comment[]>
createComment(input: {
  postId: string;
  authorName: string;
  content: string;
}): Promise<Comment>
```

## Oracle Route

`POST /api/oracle`

请求：

```json
{
  "postId": "post-calculus-001",
  "postTitle": "How should I start a sensitivity analysis section?",
  "postContent": "I have built the model but do not know how to justify robustness...",
  "existingComments": [
    {
      "authorName": "Y2 Quant Mentor",
      "content": "Start by perturbing the key assumptions."
    }
  ],
  "protocol": "seeker",
  "plugins": ["Advanced Calculus Engine v2.0"]
}
```

响应：

```json
{
  "comment": {
    "id": "oracle-local-001",
    "postId": "post-calculus-001",
    "authorName": "Oracle",
    "content": "A concise answer...",
    "isAiGenerated": true,
    "createdAt": "2026-05-31T00:00:00.000Z"
  }
}
```

## Fallback 规则

如果缺少 `LLM_API_KEY`，该 route 必须返回一条确定性的 mock Oracle 回答。Demo 不能因为外部模型不可用而失败。
