import { NextResponse } from 'next/server'

type ApiHandler = (request: Request) => Promise<Response | NextResponse | unknown>

/**
 * Wrap an API handler to provide consistent logging (before, after) and error handling.
 * 返回的函数与 Next.js App Router 的 `GET/POST` 等导出签名兼容。
 */
export function withApi(handler: ApiHandler, options?: { name?: string }) {
  const name = options?.name || 'api'

  return async function (request: Request) {
    const start = Date.now()
    const method = request.method
    const url = request.url

    console.log(`[${new Date().toISOString()}] [${name}] <- ${method} ${url}`)

    try {
      const result = await handler(request)

      const duration = Date.now() - start

      // helper: read/preview response body safely (with truncation)
      const preview = async (resOrObj: any) => {
        const MAX = 2000
        try {
          // If it's a Response-like, clone and read text
          if (resOrObj instanceof Response) {
            const clone = resOrObj.clone()
            const txt = await clone.text()
            // try parse JSON for nicer output
            try {
              const parsed = JSON.parse(txt)
              const s = JSON.stringify(parsed)
              return s.length > MAX ? s.slice(0, MAX) + '...(truncated)' : s
            } catch {
              return txt.length > MAX ? txt.slice(0, MAX) + '...(truncated)' : txt
            }
          }

          // Otherwise try to stringify an object
          const s = typeof resOrObj === 'string' ? resOrObj : JSON.stringify(resOrObj)
          return s.length > MAX ? s.slice(0, MAX) + '...(truncated)' : s
        } catch (e) {
          return '[unreadable response body]'
        }
      }

      // 如果 handler 已经返回 NextResponse 或原生 Response，尝试读取并打印 body，再返回
      if (result instanceof NextResponse || result instanceof Response) {
        // 尝试读取 status，如果没有则视为 200
        const status = (result as Response).status ?? 200
        const bodyPreview = await preview(result)
        console.log(
          `[${new Date().toISOString()}] [${name}] -> ${method} ${url} ${status} (${duration}ms)`,
          `responsePreview: ${bodyPreview}`
        )
        return result
      }

      // 否则把返回值序列化为 JSON 并打印预览
      const bodyPreview = await preview(result)
      console.log(
        `[${new Date().toISOString()}] [${name}] -> ${method} ${url} 200 (${duration}ms)`,
        `responsePreview: ${bodyPreview}`
      )
      return NextResponse.json(result)
    } catch (error) {
      const duration = Date.now() - start
      console.error(
        `[${new Date().toISOString()}] [${name}] !!! ERROR ${method} ${url} (${duration}ms)`,
        error
      )

      // 标准化错误响应
      return NextResponse.json(
        { error: '服务器内部错误' },
        { status: 500 }
      )
    }
  }
}

export default withApi
