import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import { ChuckNorrisWidget } from '@/components/ChuckNorrisWidget'
import { useChuckNorrisCategories } from '@/hooks/useChuckNorrisCategories'
import { useChuckNorrisJoke } from '@/hooks/useChuckNorrisJoke'

export function StorybookDemoPage() {
  const [category, setCategory] = useState<string | null>(null)
  const [count, setCount] = useState(1)

  const { data: categories } = useChuckNorrisCategories()
  const { data: joke, isPending, isRefetching, isError, error, refetch } =
    useChuckNorrisJoke(category)

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Stack spacing={2}>
          <Box>
            <Button component={Link} to="/" color="inherit">
              Back To Home
            </Button>
          </Box>
          <Typography variant="h2" component="h1">
            Storybook Demo
          </Typography>
          <Typography variant="body1">
            Interactieve demo van de Chuck Norris widget binnen de app.
          </Typography>
        </Stack>

        <Box>
          <ChuckNorrisWidget
            joke={joke}
            categories={categories ?? []}
            selectedCategory={category}
            isPending={isPending}
            isRefetching={isRefetching}
            isError={isError}
            errorMessage={error?.message}
            count={count}
            onRefetch={() => {
              setCount((currentCount) => currentCount + 1)
              void refetch()
            }}
            onCategoryChange={(nextCategory) => {
              setCategory(nextCategory)
              setCount(1)
            }}
          />
        </Box>
      </Stack>
    </Container>
  )
}
