import { useCallback, useState } from 'react'
import { streamChatMessage } from '@/api/chat'

export type Message = {
  id: string
  role: 'student' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function useChatStream(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming) return

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'student',
        content: text,
      }
      const streamingId = `assistant-${Date.now()}`
      const streamingMsg: Message = {
        id: streamingId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, streamingMsg])
      setIsStreaming(true)
      setStatusText(null)

      try {
        for await (const sseEvent of streamChatMessage(text, conversationId)) {
          if (sseEvent.event === 'status') {
            setStatusText(sseEvent.data)
          } else if (sseEvent.event === 'final') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingId
                  ? { ...m, content: sseEvent.data, isStreaming: false }
                  : m,
              ),
            )
            setStatusText(null)
          } else if (sseEvent.event === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingId
                  ? { ...m, content: `Error: ${sseEvent.data}`, isStreaming: false }
                  : m,
              ),
            )
            setStatusText(null)
          }
        }
      } finally {
        setIsStreaming(false)
        setStatusText(null)
      }
    },
    [isStreaming, conversationId],
  )

  return { messages, isStreaming, statusText, sendMessage }
}
