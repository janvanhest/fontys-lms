import { lazy, Suspense } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { NotFoundPage } from '@/pages/NotFoundPage'
import muiTheme from '@/themes/muiTheme'

const StorybookDemoPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/StorybookDemoPage').then((module) => ({
        default: module.StorybookDemoPage,
      })),
    )
  : () => null

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
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
    </ThemeProvider>
  )
}

export default App
