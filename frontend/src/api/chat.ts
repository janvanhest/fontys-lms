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

function parseSseEventBlock(block: string): ChatSseEvent | null {
  const lines = block.split(/\r?\n/)
  let eventType: ChatSseEvent['event'] | null = null
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      const value = line.slice(6).trim()
      if (
        value === 'status' ||
        value === 'tool_call' ||
        value === 'tool_result' ||
        value === 'final' ||
        value === 'error'
      ) {
        eventType = value
      }
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }

  const data = dataLines.join('\n')
  if (!data) return null

  if (eventType) {
    return { event: eventType, data }
  }

  try {
    return JSON.parse(data) as ChatSseEvent
  } catch {
    return null
  }
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
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      const event = parseSseEventBlock(block)
      if (event) {
        yield event
      }
    }
  }

  if (buffer.trim()) {
    const event = parseSseEventBlock(buffer)
    if (event) {
      yield event
    }
  }
}
