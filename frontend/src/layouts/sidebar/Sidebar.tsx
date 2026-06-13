import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  conversationSummariesQueryOptions,
  deleteConversation,
  type ConversationSummary,
  updateConversationTitle,
} from '@/api/chat';
import { useLayout } from '@/context/useLayout';
import { normalizeConversationTitleInput } from '@/utils/sidebarTitle';
import { SidebarConversationList } from './SidebarConversationList';
import { SidebarEdgeTab } from './SidebarEdgeTab';

const sidebarWidth = 'clamp(260px, 18vw, 380px)';

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    selectedConversationId,
    setSelectedConversationId,
    setChatMountKey,
    selectTab,
  } = useLayout();
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading } = useQuery({
    ...conversationSummariesQueryOptions,
    enabled: sidebarOpen,
    refetchInterval: sidebarOpen ? 5000 : false,
  });
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [savingConversationId, setSavingConversationId] = useState<string | null>(null);

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

      const queryKey = conversationSummariesQueryOptions.queryKey;
      const previousConversations = queryClient.getQueryData<ConversationSummary[]>(queryKey) ?? [];
      const previousTitle = conversation.title;
      setSavingConversationId(conversation.id);
      queryClient.setQueryData<ConversationSummary[]>(
        queryKey,
        previousConversations.map((item) =>
          item.id === conversation.id ? { ...item, title: normalizedTitle } : item,
        ),
      );

      try {
        await updateConversationTitle(conversation.id, normalizedTitle);
        cancelEditing();
      } catch {
        queryClient.setQueryData<ConversationSummary[]>(
          queryKey,
          previousConversations.map((item) =>
            item.id === conversation.id ? { ...item, title: previousTitle } : item,
          ),
        );
      } finally {
        setSavingConversationId(null);
      }
    },
    [cancelEditing, editingTitle, queryClient],
  );

  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      const queryKey = conversationSummariesQueryOptions.queryKey;
      const previousConversations = queryClient.getQueryData<ConversationSummary[]>(queryKey) ?? [];

      queryClient.setQueryData<ConversationSummary[]>(
        queryKey,
        previousConversations.filter((item) => item.id !== conversationId),
      );

      try {
        await deleteConversation(conversationId);
      } catch {
        queryClient.setQueryData<ConversationSummary[]>(queryKey, previousConversations);
      }
    },
    [queryClient],
  );

  return (
    <Box sx={{ display: 'flex', flexShrink: 0 }}>
      <Box
        sx={{
          width: sidebarOpen ? sidebarWidth : 0,
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedConversationId(null);
                  setChatMountKey(`new-${String(Date.now())}`);
                  selectTab('chat');
                }}
                sx={{ flex: 1 }}
              >
                Nieuw gesprek
              </Button>
              <Tooltip title="Gesprekken verbergen" arrow>
                <IconButton
                  onClick={() => {
                    setSidebarOpen(false);
                  }}
                  aria-label="Zijbalk inklappen"
                  size="small"
                >
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em', display: 'block' }}
            >
              Gesprekken
            </Typography>

            {isLoading ? (
              <CircularProgress size={20} sx={{ alignSelf: 'center' }} />
            ) : (
              <SidebarConversationList
                conversations={conversations}
                editingConversationId={editingConversationId}
                editingTitle={editingTitle}
                savingConversationId={savingConversationId}
                selectedConversationId={selectedConversationId}
                onCancelEditing={cancelEditing}
                onDeleteConversation={handleDeleteConversation}
                onEditTitleChange={setEditingTitle}
                onSaveTitle={saveTitle}
                onSelectConversation={(conversationId) => {
                  setSelectedConversationId(conversationId);
                  setChatMountKey(conversationId);
                  selectTab('chat');
                }}
                onStartEditing={startEditing}
              />
            )}
          </Stack>
        </Box>
      </Box>

      {!sidebarOpen && (
        <SidebarEdgeTab
          onClick={() => {
            setSidebarOpen(true);
          }}
        />
      )}
    </Box>
  );
}
