/**
 * 简单的客户端请求封装：打印请求前、响应体预览与请求后（含耗时/状态），并在发生错误时打印错误。
 */
type ClientFetchOptions = RequestInit & { name?: string }

const MAX_PREVIEW = 2000

function truncate(s: string | undefined) {
  if (!s) return ''
  return s.length > MAX_PREVIEW ? s.slice(0, MAX_PREVIEW) + '...(truncated)' : s
}

async function previewRequestBody(init?: RequestInit) {
  try {
    if (!init || !init.body) return ''
    if (typeof init.body === 'string') return truncate(init.body)
    // body could be FormData, URLSearchParams, Blob, etc. Try to handle common cases
    if (init.body instanceof URLSearchParams) return truncate(init.body.toString())
    if (init.body instanceof FormData) {
      const entries: string[] = []
      // FormData doesn't serialize easily in all runtimes, iterate entries
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const pair of (init.body as any).entries()) {
        entries.push(`${pair[0]}=${pair[1]}`)
        if (entries.join('&').length > MAX_PREVIEW) break
      }
      return truncate(entries.join('&'))
    }
    // last resort try to JSON.stringify
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return truncate(JSON.stringify(init.body))
    } catch {
      return '[unserializable request body]'
    }
  } catch (e) {
    return '[error previewing request body]'
  }
}

export async function clientFetch(input: RequestInfo, init?: ClientFetchOptions) {
  const name = init?.name ?? 'client'
  const method = (init?.method ?? 'GET').toUpperCase()
  const url = typeof input === 'string' ? input : input.toString()

  const start = Date.now()
  const reqPreview = await previewRequestBody(init)
  console.log(`[${new Date().toISOString()}] [${name}] <- ${method} ${url}`, reqPreview ? `requestBody: ${reqPreview}` : '')

  try {
    const res = await fetch(input, init)
    const duration = Date.now() - start

    // clone and read text for preview
    let text
    try {
      const clone = res.clone()
      text = await clone.json()
    } catch (e) {
      text = '[unreadable response body]'
    }

    // try parse JSON for nicer preview
    let parsedPreview = text

    parsedPreview = truncate(parsedPreview)

    console.log(
      `[${new Date().toISOString()}] [${name}] -> ${method} ${url} ${res.status} (${duration}ms)`,
      `responsePreview: ${parsedPreview}`
    )

    if (!res.ok) {
      // Include body in the thrown error for easier debugging
      const err: any = new Error(`HTTP ${res.status}`)
      err.status = res.status
      err.body = text
      throw err
    }

    // Try returning parsed JSON, otherwise return raw text
    return text
  } catch (error) {
    const duration = Date.now() - start
    console.error(`[${new Date().toISOString()}] [${name}] !!! ERROR ${method} ${url} (${duration}ms)`, error)
    throw error
  }
}

export default clientFetch
