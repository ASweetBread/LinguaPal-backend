import { NextResponse } from 'next/server'
import { withApi } from '../apiWrapper'

// 定义请求体类型
interface GenerateDialogueRequest {
  scene: string
}

// 定义对话项类型
export interface DialogueItem {
  role: string
  text: string // 包含英文和中文，用\n分隔
}

// 定义响应类型
export interface GenerateDialogueResponse {
  dialogue: DialogueItem[]
}

export const POST = withApi(async (request: Request) => {
  // 解析请求体
  const { scene }: GenerateDialogueRequest = await request.json()

  if (!scene || scene.trim() === '') {
    return NextResponse.json(
      { error: '请提供有效的场景描述' },
      { status: 400 }
    )
  }

  // 构建调用ZhipuAI API的请求体
  const apiKey = process.env.ZHIPUAI_API_KEY
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'glm-4.6',
      messages: [
        {
          role: 'system',
          content: '你是一个英语学习助手，擅长创建场景对话。请根据用户提供的场景，创建一个包含4-8个对话回合的英文对话。对话应在两个角色之间进行，使用角色名称A和B。输出格式必须是纯JSON。对话应该是自然、真实的，适合英语学习者练习。'
        },
        {
          role: 'user',
          content: '场景：' + scene
        }
      ],
      response_format: { type: 'json_object' }
    })
  })

  const data = await response.json()
  const dialogue = JSON.parse(data.choices[0].message.content)

  return NextResponse.json(dialogue)
}, { name: 'generate-dialogue' })