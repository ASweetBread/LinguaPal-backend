import { NextResponse } from 'next/server'
import { apiRequest } from '../apiWrapper'
import { File } from 'node:buffer'
import fs from 'fs'
import path from 'path'

// 定义语音识别请求类型
interface SpeechRecognitionRequest {
  audioData: string // Base64编码的音频数据
}

// 定义语音识别响应类型
export interface SpeechRecognitionResponse {
  recognizedText: string
  confidence?: number
}

// 定义ZhipuAI ASR API响应类型
interface ZhipuAIResponse {
  text: string
  confidence?: number
}

/**
 * 将Base64编码的音频数据保存为音频文件
 * @param audioData Base64编码的音频数据
 * @returns 保存的文件路径
 */
const saveAudioToFile = async (audioData: string): Promise<string> => {
  try {
    // 创建音频缓冲区
    const audioBuffer = Buffer.from(audioData, 'base64')
    
    // 创建保存目录（确保目录存在）
    const audioDir = path.join(process.cwd(), 'audio_files')
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
    }
    
    // 生成唯一文件名（使用时间戳防止覆盖）
    const timestamp = Date.now()
    const fileName = `audio_${timestamp}.wav`
    const filePath = path.join(audioDir, fileName)
    
    // 写入文件
    fs.writeFileSync(filePath, audioBuffer)
    
    console.log(`音频文件已保存至: ${filePath}`)
    return filePath
  } catch (error) {
    console.error('保存音频文件失败:', error)
    throw new Error('保存音频文件失败')
  }
}

export const POST = async (request: Request) => {
  try {
    const contentType = request.headers.get('content-type')
    
    // 处理语音识别请求
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      
      // 语音识别请求
      const { audioData } = body as SpeechRecognitionRequest
      
      if (!audioData) {
        return NextResponse.json(
          { error: '音频数据不能为空' },
          { status: 400 }
        )
      }
      
      // 保存音频文件
      // await saveAudioToFile(audioData)

      // 调用ZhipuAI的GLM-ASR模型，使用apiRequest封装
      const apiKey = process.env.ZHIPUAI_API_KEY
      
      // 对于multipart/form-data，创建FormData对象
      const formData = new FormData()
      formData.append('model', 'glm-asr')
      
      // 解码Base64音频数据并创建Blob
      const audioBuffer = Buffer.from(audioData, 'base64');
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      // const audioFile = new File([audioBuffer], 'audio.wav', { 
      //   type: 'audio/wav' 
      // });
      formData.append('file', audioBlob as Blob);
      
      // 使用apiRequest替换fetch，不设置Content-Type让浏览器自动处理
      const data = await apiRequest<ZhipuAIResponse>(
        'https://open.bigmodel.cn/api/paas/v4/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
            // 不设置Content-Type，让浏览器自动处理并添加boundary
          },
          body: formData
        },
        'ZhipuAI-ASR' // API名称标识
      )
      
      const recognizedText = data.text
      
      return NextResponse.json<SpeechRecognitionResponse>({
        recognizedText,
        confidence: data.confidence
      })
    }
    
    // 处理FormData格式的请求（用于直接上传音频文件）
    else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const audioFile = formData.get('audio')
      
      if (!audioFile || !(audioFile instanceof Blob)) {
        return NextResponse.json(
          { error: '请上传有效的音频文件' },
          { status: 400 }
        )
      }
      
      // 这里应该处理音频文件并调用ASR API
      // 由于是模拟，返回相同的模拟数据
      const mockTexts = [
        "Hello how are you today",
        "I would like to order a coffee please",
        "What time is it now",
        "Thank you very much",
        "Have a nice day"
      ]
      const randomIndex = Math.floor(Math.random() * mockTexts.length)
      const recognizedText = mockTexts[randomIndex]
      
      return NextResponse.json<SpeechRecognitionResponse>({
        recognizedText,
        confidence: 0.92
      })
    }
    
    return NextResponse.json(
      { error: '不支持的Content-Type' },
      { status: 415 }
    )
  } catch (error) {
    console.error('语音识别时出错:', error)
    return NextResponse.json(
      { error: '语音识别失败，请稍后重试' },
      { status: 500 }
    )
  }
}