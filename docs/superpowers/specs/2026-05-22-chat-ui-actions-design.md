# Chat UI Actions Design

**Branch:** `feat/chat-ui-actions`
**Goal:** Let the chat backend emit structured UI commands; allow the frontend to react to those commands safely.

---

## Scope

### In scope
- Open activities side panel automatically when the student explicitly asks
- Show an action chip below a chat message as a nudge (student clicks to open the panel)

### Out of scope (roadmap)
- Highlight or select a specific activity in the panel (requires lifting `selectedActivityId` to `LayoutContext`)
- Write actions (branch 3)
- Any UI action other than `open_activities_panel`

---

## Architecture

A single `perform_ui_action` tool is registered with Anthropic alongside the existing tools. The model calls it when opening the activities panel is appropriate. The backend emits a `ui_action` SSE event; the frontend either opens the panel immediately (`auto` mode) or attaches a clickable chip to the message (`suggest` mode).

Read-only retrieval (`search_activities`) and UI actions (`perform_ui_action`) remain separate tools. The model decides independently whether to call each one.

---

## Backend

### New file: `backend/src/chat/tools/perform-ui-action.tool.ts`

```ts
export const PERFORM_UI_ACTION_TOOL_DEF = {
  name: 'perform_ui_action',
  description: 'Open or suggest a UI panel to the student.',
  input_schema: {
    type: 'object',
    required: ['action', 'mode', 'label'],
    additionalProperties: false,
    properties: {
      action: {
        type: 'string',
        enum: ['open_activities_panel'],
      },
      mode: {
        type: 'string',
        enum: ['auto', 'suggest'],
        description: 'auto: execute immediately; suggest: show as a chip the student can click',
      },
      label: {
        type: 'string',
        description: 'Button label shown to the student, e.g. "Open activiteiten"',
      },
    },
  },
};

@Injectable()
export class PerformUiActionTool {
  execute(): string {
    return JSON.stringify({ ok: true });
  }
}
```

No service dependency — this tool has no async work. Its only effect is the SSE event emitted by `ChatService`.

### Changes to `chat.service.ts`

`getAvailableTools()` adds `PERFORM_UI_ACTION_TOOL_DEF`.

In `executeToolCalls`, new branch:

```ts
} else if (block.name === 'perform_ui_action') {
  const input = block.input as { action: string; mode: string; label: string };
  events.push({ event: 'ui_action', data: JSON.stringify(input) });
  result = this.performUiActionTool.execute();
}
```

The `ui_action` event is emitted **before** `tool_result` so the frontend can react before the model resumes.

### System prompt addition

```
3. Gebruik perform_ui_action om het activiteitenpaneel te openen:
   - mode 'auto': als de student expliciet vraagt om het paneel te openen of te tonen.
   - mode 'suggest': als het paneel nuttig zou zijn maar de student er niet om heeft gevraagd.
   Gebruik dit nooit automatisch alleen omdat search_activities werd aangeroepen.
```

### Changes to `chat.module.ts`

`PerformUiActionTool` added to `providers`.

---

## Frontend

### `chatStreamHelpers.ts` — Message type

```ts
export type ChatUiAction = {
  action: 'open_activities_panel';
  label: string;
};

// Added to Message:
actions?: ChatUiAction[];
```

### `chatStreamHelpers.ts` — status copy

`perform_ui_action` maps to `'Paneel instellen...'` in `getStatusTextFromToolCall`.

### `useChatStream.ts`

New callback option:

```ts
type UseChatStreamOptions = {
  onConversationEstablished?: (conversationId: string) => void;
  onUiAction?: (action: string) => void;
};
```

New `case` in the SSE switch:

```ts
case 'ui_action': {
  const payload = JSON.parse(sseEvent.data) as { action: string; mode: string; label: string };
  if (payload.mode === 'auto') {
    onUiAction?.(payload.action);
  } else {
    pendingSuggestions.current.push({ action: payload.action as 'open_activities_panel', label: payload.label });
  }
  break;
}
```

`pendingSuggestions` is a `useRef<ChatUiAction[]>` declared at hook level (persists across re-renders during streaming). It is reset to `[]` at the start of each `sendMessage` call.

When `final` arrives, pending suggestions are passed to `applyFinalMessage`:

```ts
setMessages(prev => applyFinalMessage(prev, streamingId, finalPayload, pendingSuggestions.current));
```

`applyFinalMessage` attaches them to the message's `actions` field.

### `ChatTab.tsx`

```ts
const handleUiAction = useCallback((action: string) => {
  if (action === 'open_activities_panel') openSidePanel({ type: 'activities' });
}, [openSidePanel]);

const { messages, ... } = useChatStream(conversationId, {
  onConversationEstablished: handleConversationEstablished,
  onUiAction: handleUiAction,
});
```

An `onAction` prop is threaded from `ChatTab` → `ChatMessageList` → message bubble.

### Message bubble — chip rendering

Rendered below the message text when `message.actions` is non-empty:

```tsx
{message.actions?.map((a) => (
  <Chip
    key={a.action}
    label={a.label}
    onClick={() => {
      onAction?.(a.action);
      // consume: remove action from message
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, actions: [] } : m
      ));
    }}
    size="small"
    sx={{ mt: 1 }}
  />
))}
```

---

## Testing

### Backend
- `perform-ui-action.tool.spec.ts`: `execute()` returns `{ ok: true }` as JSON
- `chat.service.spec.ts`: advertises `perform_ui_action` in tools array; emits `ui_action` SSE event before `tool_result`; `auto` and `suggest` modes both reach the event stream

### Frontend
- `chatStreamHelpers.test.ts`: `perform_ui_action` maps to `'Paneel instellen...'`; `applyFinalMessage` attaches actions when provided
- `useChatStream` integration: `onUiAction` called immediately for `auto`, chip attached to message for `suggest`

---

## Roadmap additions

The following are explicitly out of scope and should be addressed in a future branch:

- **Highlight / select a specific activity** — requires `selectedActivityId` to move from `useActivitiesPanelState` into `LayoutContext` so it can be set from outside the panel
