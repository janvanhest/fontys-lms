import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { fetchConversations, type ConversationSummary, updateConversationTitle } from '@/api/chat';
import { useLayout } from '@/context/useLayout';
import { formatConversationTitle, normalizeConversationTitleInput } from './sidebarTitle';

const sidebarWidth = 190;

export function Sidebar() {
  const { sidebarOpen, selectedConversationId, setSelectedConversationId, selectTab } = useLayout();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [savingConversationId, setSavingConversationId] = useState<string | null>(null);

  const refreshConversations = useCallback((showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }
    fetchConversations()
      .then(setConversations)
      .catch(() => {
        setConversations([]);
      })
      .finally(() => {
        if (showLoader) {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    refreshConversations(true);

    const intervalId = window.setInterval(() => {
      refreshConversations(false);
    }, 5000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [sidebarOpen, selectedConversationId, refreshConversations]);

  const startEditing = useCallback((conversation: ConversationSummary) => {
    setEditingConversationId(conversation.id);
    setEditingTitle(conversation.title ?? '');
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingConversationId(null);
    setEditingTitle('');
  }, []);

  const saveTitle = useCallback(
    async (conversation: ConversationSummary) => {
      const normalizedTitle = normalizeConversationTitleInput(editingTitle);
      if (!normalizedTitle) {
        cancelEditing();
        return;
      }

      const previousTitle = conversation.title;
      setSavingConversationId(conversation.id);
      setConversations((prev) =>
        prev.map((item) =>
          item.id === conversation.id ? { ...item, title: normalizedTitle } : item,
        ),
      );

      try {
        await updateConversationTitle(conversation.id, normalizedTitle);
        cancelEditing();
      } catch {
        setConversations((prev) =>
          prev.map((item) =>
            item.id === conversation.id ? { ...item, title: previousTitle } : item,
          ),
        );
      } finally {
        setSavingConversationId(null);
      }
    },
    [cancelEditing, editingTitle],
  );

  const handleEditKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, conversation: ConversationSummary) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void saveTitle(conversation);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelEditing();
      }
    },
    [cancelEditing, saveTitle],
  );

  return (
    <Box
      sx={{
        width: sidebarOpen ? sidebarWidth : 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        borderRight: sidebarOpen ? '1px solid' : '0 solid transparent',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: sidebarWidth,
          height: '100%',
          p: 2,
        }}
      >
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedConversationId(null);
              selectTab('chat');
            }}
          >
            Nieuw gesprek
          </Button>

          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}>
            Gesprekken
          </Typography>

          {loading ? (
            <CircularProgress size={20} sx={{ alignSelf: 'center' }} />
          ) : (
            <List disablePadding sx={{ display: 'grid', gap: 1 }}>
              {conversations.map((conversation) => (
                <ListItemButton
                  key={conversation.id}
                  selected={conversation.id === selectedConversationId}
                  onClick={() => {
                    setSelectedConversationId(conversation.id);
                    selectTab('chat');
                  }}
                  sx={{
                    display: 'block',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor:
                      conversation.id === selectedConversationId
                        ? 'action.selected'
                        : 'transparent',
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
                        setEditingTitle(event.target.value);
                      }}
                      onBlur={() => void saveTitle(conversation)}
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
                        startEditing(conversation);
                      }}
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        startEditing(conversation);
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
              {conversations.length === 0 && !loading && (
                <Typography variant="caption" color="text.secondary">
                  Nog geen gesprekken
                </Typography>
              )}
            </List>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
