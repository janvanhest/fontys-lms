const backendUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000'

export type GesprekSummary = {
  id: string
  studentId: string
  aangemaaktOp: string
}

export type ChatSseEvent = {
  event: 'status' | 'tool_call' | 'tool_result' | 'final' | 'error'
  data: string
}

export async function fetchGesprekken(): Promise<GesprekSummary[]> {
  const res = await fetch(`${backendUrl}/chat/gesprekken`)
  if (!res.ok) throw new Error(`Gesprekken ophalen mislukt: ${res.status}`)
  return res.json() as Promise<GesprekSummary[]>
}

export async function* streamChatMessage(
  vraag: string,
  gesprekId?: string,
): AsyncGenerator<ChatSseEvent> {
  const res = await fetch(`${backendUrl}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vraag, gesprekId }),
  })

  if (!res.ok || !res.body) {
    yield { event: 'error', data: `HTTP ${res.status}` }
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const jsonStr = line.slice(5).trim()
      if (!jsonStr) continue
      try {
        yield JSON.parse(jsonStr) as ChatSseEvent
      } catch {
        // ongeldige SSE lijn overslaan
      }
    }
  }
}
