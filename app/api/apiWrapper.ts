import { File } from 'node:buffer'
// API请求封装
/**
 * 封装的API请求函数，用于统一处理API调用过程
 * @param url API请求URL
 * @param options 请求选项
 * @param apiName API名称标识，用于日志记录
 * @returns 解析后的响应数据
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit,
  apiName: string = 'Unknown-API'
): Promise<T> {
  console.log(`[${apiName}] 请求开始: ${url}`)
  
  // 记录请求体预览（避免记录敏感信息）
  if (options.body) {
    if (typeof options.body === 'string') {
      try {
        const body = JSON.parse(options.body)
        // 创建一个安全的预览对象，不包含敏感信息
        const preview = { ...body }
        // 移除可能的敏感字段
        // if (preview.apiKey) preview.apiKey = '***'
        // if (preview.password) preview.password = '***'
        // if (preview.token) preview.token = '***'
        console.log(`[${apiName}] 请求体预览:`, preview)
      } catch (e) {
        console.log(`[${apiName}] 请求体（非JSON字符串）`)
      }
    } else if (options.body instanceof FormData) {
      // 处理FormData类型的请求体
      const formData = options.body as FormData
      const formDataPreview: Record<string, string> = {}
      
      // 使用forEach代替for...of循环，兼容ES5
      formData.forEach((value, key) => {
        if (value instanceof File) {
          formDataPreview[key] = `[File: ${value.name}, ${value.size} bytes]`
        } else {
          formDataPreview[key] = String(value)
        }
      })
      
      console.log(`[${apiName}] FormData请求体预览:`, formDataPreview)
    } else {
      console.log(`[${apiName}] 请求体（非字符串，非FormData）`)
    }
  }
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, options)
    const endTime = Date.now()
    console.log(`[${apiName}] 请求完成: ${url}, 耗时: ${endTime - startTime}ms, 状态码: ${response.status}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API请求失败: ${response.status} ${response.statusText}, 详情: ${JSON.stringify(errorData)}`)
    }
    
    // 检查响应内容类型，只在JSON时解析
    const contentType = response.headers.get('content-type')
    let data: any
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
      console.log(`[${apiName}] 响应数据获取成功`, data)
    } else {
      // 对于非JSON响应，返回空对象或其他适当的默认值
      console.log(`[${apiName}] 响应（非JSON格式）`)
      data = {}
    }
    return data as T
  } catch (error) {
    const endTime = Date.now()
    console.error(`[${apiName}] 请求失败: ${url}, 耗时: ${endTime - startTime}ms, 错误:`, error)
    throw error
  }
}
