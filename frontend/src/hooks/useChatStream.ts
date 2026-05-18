import { useCallback, useState } from 'react'
import { streamChatMessage } from '@/api/chat'

export type Message = {
  id: string
  role: 'student' | 'assistent'
  content: string
  isStreaming?: boolean
}

export function useChatStream(gesprekId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (vraag: string) => {
      if (isStreaming) return

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'student',
        content: vraag,
      }
      const streamingId = `assistant-${Date.now()}`
      const streamingMsg: Message = {
        id: streamingId,
        role: 'assistent',
        content: '',
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, streamingMsg])
      setIsStreaming(true)
      setStatusText(null)

      try {
        for await (const sseEvent of streamChatMessage(vraag, gesprekId)) {
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
                  ? { ...m, content: `Fout: ${sseEvent.data}`, isStreaming: false }
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
    [isStreaming, gesprekId],
  )

  return { messages, isStreaming, statusText, sendMessage }
}
