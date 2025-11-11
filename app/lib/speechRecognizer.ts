import fs from 'fs'
import path from 'path'
import { apiRequest } from '../api/apiWrapper'

// 导出类型，供 route 或其他模块使用
export interface SpeechRecognitionResponse {
  recognizedText: string
  confidence?: number
}

interface ZhipuAIResponse {
  text: string
  confidence?: number
}

/**
 * 将Base64编码的音频数据保存为音频文件（可选）
 */
export const saveAudioToFile = async (audioData: string): Promise<string> => {
  try {
    const audioBuffer = Buffer.from(audioData, 'base64')
    const audioDir = path.join(process.cwd(), 'audio_files')
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true })

    const timestamp = Date.now()
    const fileName = `audio_${timestamp}.wav`
    const filePath = path.join(audioDir, fileName)
    fs.writeFileSync(filePath, audioBuffer)
    return filePath
  } catch (err) {
    console.error('saveAudioToFile error:', err)
    throw err
  }
}

/**
 * 使用配置的第三方ASR服务将Base64音频转文本。
 * 当前实现使用智谱AI（ZhipuAI）的 GLM-ASR 接口。
 * 统一封装，便于未来替换为其他供应商。
 */
export const recognizeFromBase64 = async (audioData: string): Promise<SpeechRecognitionResponse> => {
  // apiKey 由环境变量提供
  const apiKey = process.env.ZHIPUAI_API_KEY

  // 构建FormData并上传
  const formData = new FormData()
  formData.append('model', 'glm-asr')

  const audioBuffer = Buffer.from(audioData, 'base64')
  const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })
  formData.append('file', audioBlob as Blob)

  const data = await apiRequest<ZhipuAIResponse>(
    'https://open.bigmodel.cn/api/paas/v4/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: formData
    },
    'ZhipuAI-ASR'
  )

  return {
    recognizedText: data.text,
    confidence: data.confidence
  }
}

/**
 * 识别上传的文件（Blob或Buffer），适配 route 中处理 multipart/form-data 的场景
 */
export const recognizeFromFile = async (file: Blob | Buffer): Promise<SpeechRecognitionResponse> => {
  // 如果是 Buffer，包装成 Blob
  const fileBlob = (file instanceof Buffer) ? new Blob([new Uint8Array(file)], { type: 'audio/wav' }) : file as Blob

  // 目前没有真实第三方调用逻辑，作为占位可直接返回模拟结果或调用 recognizeFromBase64
  // Here we simply return a mock (route will call real implementation when needed)
  const mockTexts = [
    'Hello how are you today',
    'I would like to order a coffee please',
    'What time is it now',
    'Thank you very much',
    'Have a nice day'
  ]
  const randomIndex = Math.floor(Math.random() * mockTexts.length)

  return {
    recognizedText: mockTexts[randomIndex],
    confidence: 0.9
  }
}

export default {
  saveAudioToFile,
  recognizeFromBase64,
  recognizeFromFile
}
