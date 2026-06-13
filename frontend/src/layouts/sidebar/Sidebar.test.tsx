import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LayoutContextValue } from '@/context/layout-context';
import { Sidebar } from './Sidebar';

const useQueryMock = vi.fn();
const useLayoutMock = vi.fn();

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actualModule = await importOriginal();

  return {
    ...(actualModule as Record<string, unknown>),
    useQuery: () =>
      useQueryMock() as {
        data?: Array<{ id: string; title?: string; createdAt: string }>;
        isLoading: boolean;
      },
    useQueryClient: () => ({
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
    }),
  };
});

vi.mock('@/context/useLayout', () => ({
  useLayout: () => useLayoutMock() as LayoutContextValue,
}));

describe('Sidebar', () => {
  it('renders a loading state while conversations are being fetched', () => {
    useLayoutMock.mockReturnValue({
      sidebarOpen: true,
      selectedConversationId: null,
      setSelectedConversationId: vi.fn(),
      selectTab: vi.fn(),
    });
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const html = renderToStaticMarkup(<Sidebar />);

    expect(html).toContain('MuiCircularProgress-root');
    expect(html).toContain('Gesprekken');
  });

  it('toont het randtabje als de sidebar gesloten is', () => {
    useLayoutMock.mockReturnValue({
      sidebarOpen: false,
      setSidebarOpen: vi.fn(),
      selectedConversationId: null,
      setSelectedConversationId: vi.fn(),
      selectTab: vi.fn(),
      setChatMountKey: vi.fn(),
    });
    useQueryMock.mockReturnValue({ data: [], isLoading: false });

    const html = renderToStaticMarkup(<Sidebar />);

    expect(html).toContain('aria-label="Open gesprekken"');
  });

  it('verbergt het randtabje als de sidebar open is', () => {
    useLayoutMock.mockReturnValue({
      sidebarOpen: true,
      setSidebarOpen: vi.fn(),
      selectedConversationId: null,
      setSelectedConversationId: vi.fn(),
      selectTab: vi.fn(),
      setChatMountKey: vi.fn(),
    });
    useQueryMock.mockReturnValue({ data: [], isLoading: false });

    const html = renderToStaticMarkup(<Sidebar />);

    expect(html).not.toContain('aria-label="Open gesprekken"');
  });

  it('renders fetched conversations', () => {
    useLayoutMock.mockReturnValue({
      sidebarOpen: true,
      selectedConversationId: 'conversation-1',
      setSelectedConversationId: vi.fn(),
      selectTab: vi.fn(),
    });
    useQueryMock.mockReturnValue({
      data: [
        {
          id: 'conversation-1',
          title: 'Mijn gesprek',
          createdAt: '2026-05-21T10:00:00.000Z',
        },
      ],
      isLoading: false,
    });

    const html = renderToStaticMarkup(<Sidebar />);

    expect(html).toContain('Mijn gesprek');
    expect(html).not.toContain('Nog geen gesprekken');
  });
});
