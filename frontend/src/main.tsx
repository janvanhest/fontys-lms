import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import { LayoutProvider } from '@/context/LayoutProvider';

const queryClient = new QueryClient();

function getRootElement(): HTMLElement {
  const element = document.getElementById('root');

  if (element === null) {
    throw new Error('Root element "#root" not found');
  }

  return element;
}

createRoot(getRootElement()).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LayoutProvider>
        <App />
      </LayoutProvider>
    </QueryClientProvider>
  </StrictMode>,
);
