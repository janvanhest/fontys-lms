const backendUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000'

export type ConversationSummary = {
  id: string
  studentId: string
  createdAt: string
}

export type ChatSseEvent = {
  event: 'status' | 'tool_call' | 'tool_result' | 'final' | 'error'
  data: string
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${backendUrl}/chat/conversations`)
  if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.status}`)
  return res.json() as Promise<ConversationSummary[]>
}

export async function* streamChatMessage(
  message: string,
  conversationId?: string,
): AsyncGenerator<ChatSseEvent> {
  const res = await fetch(`${backendUrl}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId }),
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
        // skip invalid SSE line
      }
    }
  }
}
