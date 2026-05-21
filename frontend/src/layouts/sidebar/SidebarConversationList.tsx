import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { KeyboardEvent } from 'react';
import { formatConversationTitle } from '@/utils/sidebarTitle';
import type { ConversationSummary } from '@/api/chat';

type SidebarConversationListProps = {
  conversations: ConversationSummary[];
  editingConversationId: string | null;
  editingTitle: string;
  savingConversationId: string | null;
  selectedConversationId: string | null;
  onCancelEditing: () => void;
  onEditTitleChange: (value: string) => void;
  onSaveTitle: (conversation: ConversationSummary) => Promise<void>;
  onSelectConversation: (conversationId: string) => void;
  onStartEditing: (conversation: ConversationSummary) => void;
};

export function SidebarConversationList({
  conversations,
  editingConversationId,
  editingTitle,
  savingConversationId,
  selectedConversationId,
  onCancelEditing,
  onEditTitleChange,
  onSaveTitle,
  onSelectConversation,
  onStartEditing,
}: SidebarConversationListProps) {
  const handleEditKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    conversation: ConversationSummary,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void onSaveTitle(conversation);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancelEditing();
    }
  };

  return (
    <List disablePadding sx={{ display: 'grid', gap: 1 }}>
      {conversations.map((conversation) => (
        <ListItemButton
          key={conversation.id}
          selected={conversation.id === selectedConversationId}
          onClick={() => {
            onSelectConversation(conversation.id);
          }}
          sx={{
            display: 'block',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor:
              conversation.id === selectedConversationId ? 'action.selected' : 'transparent',
          }}
        >
          {editingConversationId === conversation.id ? (
            <TextField
              fullWidth
              size="small"
              value={editingTitle}
              autoFocus
              disabled={savingConversationId === conversation.id}
              onClick={(event) => {
                event.stopPropagation();
              }}
              onChange={(event) => {
                onEditTitleChange(event.target.value);
              }}
              onBlur={() => void onSaveTitle(conversation)}
              onKeyDown={(event) => {
                handleEditKeyDown(event, conversation);
              }}
            />
          ) : (
            <Typography
              sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, cursor: 'text' }}
              onClick={(event) => {
                if (conversation.id !== selectedConversationId) return;
                event.stopPropagation();
                onStartEditing(conversation);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onStartEditing(conversation);
              }}
            >
              {formatConversationTitle(conversation)}
            </Typography>
          )}
          <Chip
            size="small"
            label={new Date(conversation.createdAt).toLocaleDateString('nl-NL')}
            variant="outlined"
            color="default"
            sx={{ mt: 1 }}
          />
        </ListItemButton>
      ))}
      {conversations.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          Nog geen gesprekken
        </Typography>
      )}
    </List>
  );
}
