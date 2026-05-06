import Box from '@mui/material/Box'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { StorybookDemoPage } from '@/pages/StorybookDemoPage'

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/storybook-demo" element={<StorybookDemoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}

export default App
