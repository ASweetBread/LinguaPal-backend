import { NextResponse } from 'next/server'
import { withApi } from '../apiWrapper'
import SYSTEM_PROMPT from '../../lib/prompts/generateDialoguePrompt'
import type { GenerateDialogueResponse } from '../../types/dialogue'

// 定义请求体类型
interface GenerateDialogueRequest {
  scene: string
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

  // 构建调用ZhipuAI API的请求体，使用外部 prompt 常量
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
          content: SYSTEM_PROMPT
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
  // 解析 AI 返回，期望其为 GenerateDialogueResponse
  const dialogue: GenerateDialogueResponse = JSON.parse(data.choices[0].message.content)

  return NextResponse.json(dialogue)
}, { name: 'generate-dialogue' })