// Shared types for dialogue feature (used by server and client)
export interface DialogueItem {
  // 角色标识，例如 'A' 或 'B'
  role: string
  // 文本包含英文和中文，用换行符分隔：第一行英文，第二行中文
  text: string
}

export interface GenerateDialogueResponse {
  dialogue: DialogueItem[]
}

// 说明：服务端应该返回一个符合 GenerateDialogueResponse 的 JSON 对象。
// 示例：
// {
//   "dialogue": [
//     { "role": "A", "text": "Hello.\n你好。" },
//     { "role": "B", "text": "Hi!\n嗨！" }
//   ]
// }
