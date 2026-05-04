import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ChuckNorrisWidget } from '@/components/ChuckNorrisWidget'
import { useChuckNorrisCategories } from '@/hooks/useChuckNorrisCategories'
import { useChuckNorrisJoke } from '@/hooks/useChuckNorrisJoke'

function App() {
  const [category, setCategory] = useState<string | null>(null)
  const [count, setCount] = useState(1)

  const { data: categories } = useChuckNorrisCategories()
  const { data: joke, isPending, isRefetching, isError, error, refetch } =
    useChuckNorrisJoke(category)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 6 }}>
      <Container maxWidth="sm">
        <ChuckNorrisWidget
          joke={joke}
          categories={categories ?? []}
          selectedCategory={category}
          isPending={isPending}
          isRefetching={isRefetching}
          isError={isError}
          errorMessage={error?.message}
          count={count}
          onRefetch={() => { setCount((c) => c + 1); void refetch() }}
          onCategoryChange={(cat) => { setCategory(cat); setCount(1) }}
        />
      </Container>
    </Box>
  )
}

export default App
