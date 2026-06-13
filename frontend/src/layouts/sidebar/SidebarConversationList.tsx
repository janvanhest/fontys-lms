import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Skeleton from '@mui/material/Skeleton';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { formatConversationDateLabel } from '@/utils/sidebarTitle';
import type { ConversationSummary } from '@/api/chat';

type SidebarConversationListProps = {
  conversations: ConversationSummary[];
  editingConversationId: string | null;
  editingTitle: string;
  savingConversationId: string | null;
  selectedConversationId: string | null;
  onCancelEditing: () => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
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
  onDeleteConversation,
  onEditTitleChange,
  onSaveTitle,
  onSelectConversation,
  onStartEditing,
}: SidebarConversationListProps) {
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);

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
    <>
      <List disablePadding sx={{ display: 'grid', gap: 1 }}>
        {conversations.map((conversation) => (
          <ListItemButton
            key={conversation.id}
            selected={conversation.id === selectedConversationId}
            onClick={() => {
              onSelectConversation(conversation.id);
            }}
            onMouseEnter={() => { setHoveredConversationId(conversation.id); }}
            onMouseLeave={() => { setHoveredConversationId(null); }}
            sx={(theme) => ({
              display: 'block',
              position: 'relative',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'transparent',
              transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                borderColor: alpha(theme.palette.primary.main, 0.3),
                boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
              },
              '&.Mui-selected:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            })}
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
              <Box sx={{ pr: 7 }}>
                {conversation.title ? (
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
                    {conversation.title}
                  </Typography>
                ) : (
                  <Skeleton variant="text" width="70%" sx={{ fontSize: 14 }} />
                )}
              </Box>
            )}
            <Chip
              size="small"
              label={formatConversationDateLabel(conversation.createdAt)}
              variant="outlined"
              color="default"
              sx={{ mt: 1 }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                display: 'flex',
                visibility:
                  hoveredConversationId === conversation.id &&
                  editingConversationId !== conversation.id
                    ? 'visible'
                    : 'hidden',
              }}
              onClick={(event) => { event.stopPropagation(); }}
            >
              <IconButton
                size="small"
                aria-label="Gesprek bewerken"
                onClick={(event) => {
                  event.stopPropagation();
                  onStartEditing(conversation);
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Gesprek verwijderen"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeletingConversationId(conversation.id);
                }}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Box>
          </ListItemButton>
        ))}
        {conversations.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            Nog geen gesprekken
          </Typography>
        )}
      </List>

      <Dialog
        open={deletingConversationId !== null}
        onClose={() => { setDeletingConversationId(null); }}
      >
        <DialogTitle>Gesprek verwijderen?</DialogTitle>
        <DialogContent>
          <DialogContentText>Dit kan niet ongedaan worden gemaakt.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeletingConversationId(null); }}>Annuleren</Button>
          <Button
            color="error"
            onClick={() => {
              if (deletingConversationId) {
                void onDeleteConversation(deletingConversationId);
              }
              setDeletingConversationId(null);
            }}
          >
            Verwijderen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
