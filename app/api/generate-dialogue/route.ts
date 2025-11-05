import { NextResponse } from 'next/server'

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

export async function POST(request: Request) {
  try {
    // 解析请求体
    const { scene }: GenerateDialogueRequest = await request.json()
    
    if (!scene || scene.trim() === '') {
      return NextResponse.json(
        { error: '请提供有效的场景描述' },
        { status: 400 }
      )
    }

    // 构建调用ZhipuAI API的请求体
    // 注意：这里使用模拟数据，实际使用时需要替换为真实的API调用
    // const apiKey = process.env.ZHIPUAI_API_KEY
    // const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKey}`
    //   },
    //   body: JSON.stringify({
    //     model: 'glm-4.6',
    //     messages: [
    //       {
    //         role: 'system',
    //         content: '你是一个英语学习助手，擅长创建场景对话。请根据用户提供的场景，创建一个包含4-8个对话回合的英文对话。对话应在两个角色之间进行，使用角色名称A和B。输出格式必须是纯JSON。对话应该是自然、真实的，适合英语学习者练习。'
    //       },
    //       {
    //         role: 'user',
    //         content: '场景：' + scene
    //       }
    //     ],
    //     response_format: { type: 'json_object' }
    //   })
    // })
    
    // const data = await response.json()
    // const dialogue = JSON.parse(data.choices[0].message.content)

    // 模拟数据，实际使用时应替换为真实API返回的数据
    const mockDialogue: GenerateDialogueResponse = {
      dialogue: [
        { 
          role: 'A', 
          text: `Hello! Welcome to the ${scene}. How can I help you today?\n你好！欢迎来到${scene}。今天我能帮你什么？` 
        },
        { 
          role: 'B', 
          text: 'Hi there! I would like some assistance with ordering.\n你好！我需要点餐帮助。' 
        },
        { 
          role: 'A', 
          text: 'Of course! What would you like to order?\n当然！你想点什么？' 
        },
        { 
          role: 'B', 
          text: 'I would like a coffee and a sandwich, please.\n我想要一杯咖啡和一个三明治。' 
        },
        { 
          role: 'A', 
          text: 'Great choice! What kind of coffee would you prefer?\n很好的选择！你想要哪种咖啡？' 
        },
        { 
          role: 'B', 
          text: 'I would like a cappuccino, please.\n我想要一杯卡布奇诺。' 
        },
        { 
          role: 'A', 
          text: 'Got it. That will be $12.50. Please wait a moment.\n明白了。总共12.50美元。请稍等。' 
        },
        { 
          role: 'B', 
          text: 'Thank you very much!\n非常感谢！' 
        }
      ]
    }
    
    return NextResponse.json(mockDialogue)
  } catch (error) {
    console.error('生成对话时出错:', error)
    return NextResponse.json(
      { error: '生成对话失败，请稍后重试' },
      { status: 500 }
    )
  }
}