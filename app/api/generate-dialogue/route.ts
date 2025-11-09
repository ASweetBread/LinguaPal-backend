import { NextResponse } from 'next/server'
import { apiRequest } from '../apiWrapper'

// 定义请求参数接口
interface DialogueRequest {
  prompt: string
  language: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

// 定义响应数据接口
interface DialogueResponse {
  dialogue: string
  translation?: string
  vocabulary?: Array<{
    word: string
    meaning: string
    usage?: string
  }>
}

// 定义ZhipuAI API响应接口
interface ZhipuAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const { prompt, language, difficulty = 'beginner' } = body as DialogueRequest
    
    if (!prompt || !language) {
      return NextResponse.json(
        { error: '提示词和语言类型不能为空' },
        { status: 400 }
      )
    }
    
    // 准备发送给ZhipuAI的消息内容
    const messages = [
      {
        role: 'system',
        content: `你是一个语言学习助手。请根据用户提供的提示，生成一段${difficulty}级别的${language}对话。`
      },
      {
        role: 'user',
        content: `请生成一段关于"${prompt}"的${difficulty}级别的${language}对话。`
      }
    ]
    
    // 获取API密钥
    const apiKey = process.env.ZHIPUAI_API_KEY
    if (!apiKey) {
      throw new Error('未配置ZhipuAI API密钥')
    }
    
    // 使用apiRequest替换fetch调用
    const data = await apiRequest<ZhipuAIResponse>(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: messages,
          temperature: 0.7
        })
      },
      'ZhipuAI-Chat' // API名称标识
    )
    
    // 解析响应
    const generatedContent = data.choices[0]?.message?.content
    
    if (!generatedContent) {
      throw new Error('未从AI模型获取到有效的响应')
    }
    
    // 构建响应对象
    const responseData: DialogueResponse = {
      dialogue: generatedContent,
      // 这里可以根据需要添加翻译和词汇表信息
    }
    
    return NextResponse.json<DialogueResponse>(responseData)
  } catch (error) {
    console.error('生成对话时出错:', error)
    return NextResponse.json(
      { error: '生成对话失败，请稍后重试' },
      { status: 500 }
    )
  }
}