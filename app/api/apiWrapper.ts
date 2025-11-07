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

      // 如果 handler 已经返回 NextResponse 或原生 Response，直接返回
      if (result instanceof NextResponse || result instanceof Response) {
        // 尝试读取 status，如果没有则视为 200
        const status = (result as Response).status ?? 200
        console.log(
          `[${new Date().toISOString()}] [${name}] -> ${method} ${url} ${status} (${duration}ms)`
        )
        return result
      }

      // 否则把返回值序列化为 JSON
      console.log(
        `[${new Date().toISOString()}] [${name}] -> ${method} ${url} 200 (${duration}ms)`
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
