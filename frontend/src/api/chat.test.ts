import { describe, expect, it } from 'vitest'
import { parseFinalChatPayload } from './chat'

describe('parseFinalChatPayload', () => {
  it('returns text plus sources for structured final payloads', () => {
    const result = parseFinalChatPayload(
      JSON.stringify({
        text: 'Gebruik het stappenplan.',
        sources: [
          {
            kind: 'canvas',
            label: 'Canvas: Stappenplan',
            url: 'https://canvas.example/stappenplan',
          },
        ],
      }),
    )

    expect(result).toEqual({
      text: 'Gebruik het stappenplan.',
      conversationId: undefined,
      sources: [
        {
          kind: 'canvas',
          label: 'Canvas: Stappenplan',
          url: 'https://canvas.example/stappenplan',
        },
      ],
    })
  })

  it('falls back to plain text for legacy final payloads', () => {
    expect(parseFinalChatPayload('Oud antwoord.')).toEqual({ text: 'Oud antwoord.' })
  })

  it('parses a conversation id when the final payload provides one', () => {
    expect(
      parseFinalChatPayload(
        JSON.stringify({
          text: 'Antwoord.',
          conversationId: 'conversation-1',
        }),
      ),
    ).toEqual({
      text: 'Antwoord.',
      conversationId: 'conversation-1',
    })
  })
})
