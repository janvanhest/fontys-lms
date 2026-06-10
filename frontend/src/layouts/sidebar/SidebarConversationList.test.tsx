import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SidebarConversationList } from './SidebarConversationList';

const baseProps = {
  editingConversationId: null,
  editingTitle: '',
  savingConversationId: null,
  selectedConversationId: null,
  onCancelEditing: () => {},
  onDeleteConversation: vi.fn(),
  onEditTitleChange: () => {},
  onSaveTitle: vi.fn(),
  onSelectConversation: () => {},
  onStartEditing: () => {},
};

describe('SidebarConversationList', () => {
  it('shows a skeleton when conversation has no title', () => {
    const html = renderToStaticMarkup(
      <SidebarConversationList
        {...baseProps}
        conversations={[{ id: '1', studentId: 's1', createdAt: '2026-06-10T12:00:00Z' }]}
      />,
    );

    expect(html).toContain('MuiSkeleton-root');
  });

  it('shows the title when conversation has a title', () => {
    const html = renderToStaticMarkup(
      <SidebarConversationList
        {...baseProps}
        conversations={[{ id: '1', studentId: 's1', createdAt: '2026-06-10T12:00:00Z', title: 'Mijn gesprek' }]}
      />,
    );

    expect(html).toContain('Mijn gesprek');
    expect(html).not.toContain('MuiSkeleton-root');
  });
});
