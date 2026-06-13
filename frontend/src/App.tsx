import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient();
import { AppLayout } from '@/layouts/AppLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppThemeProvider } from '@/themes/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';

const StorybookDemoPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/StorybookDemoPage').then((module) => ({
        default: module.StorybookDemoPage,
      })),
    )
  : () => null;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
      <AppThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />} />
            <Route
              path="/storybook-demo"
              element={
                <Suspense fallback={null}>
                  <StorybookDemoPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AppThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
