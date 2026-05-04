import { useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ReplayIcon from '@mui/icons-material/Replay'
import { useChuckNorrisCategories } from '@/hooks/useChuckNorrisCategories'
import { useChuckNorrisJoke } from '@/hooks/useChuckNorrisJoke'

function App() {
  const [category, setCategory] = useState<string | null>(null)
  const [count, setCount] = useState(1)

  const { data: categories } = useChuckNorrisCategories()
  const { data: joke, isPending, isRefetching, isError, error, refetch } =
    useChuckNorrisJoke(category)

  function handleRefetch() {
    setCount((c) => c + 1)
    void refetch()
  }

  function handleCategory(value: string) {
    setCategory((prev) => (prev === value ? null : value))
    setCount(1)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
          Chuck Norris Facts
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {categories?.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => { handleCategory(cat) }}
              color={category === cat ? 'primary' : 'default'}
              variant={category === cat ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>

        <Card elevation={3}>
          <CardHeader
            avatar={
              isPending ? (
                <Skeleton variant="circular" width={40} height={40} />
              ) : (
                <Avatar src={joke?.icon_url} alt="Chuck Norris" />
              )
            }
            title="Chuck Norris"
            subheader={category ?? 'alle categorieën'}
            action={
              <Tooltip title="Nieuwe grap">
                <span>
                  <IconButton onClick={handleRefetch} disabled={isPending || isRefetching}>
                    {isRefetching
                      ? <CircularProgress size={20} />
                      : <ReplayIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            }
          />

          <CardContent sx={{ minHeight: 100 }}>
            {isPending && (
              <>
                <Skeleton width="90%" />
                <Skeleton width="75%" />
                <Skeleton width="60%" />
              </>
            )}
            {isError && (
              <Typography sx={{ color: 'error.main' }}>{error.message}</Typography>
            )}
            {joke && (
              <Fade in key={joke.id}>
                <Typography variant="body1">{joke.value}</Typography>
              </Fade>
            )}
          </CardContent>

          <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              #{count}
            </Typography>
          </CardActions>
        </Card>
      </Container>
    </Box>
  )
}

export default App
