import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ReplayIcon from '@mui/icons-material/Replay'
import type { ChuckNorrisJoke } from '@/api/chuckNorris'

export interface ChuckNorrisWidgetProps {
  joke: ChuckNorrisJoke | undefined
  categories: string[]
  selectedCategory: string | null
  isPending: boolean
  isRefetching: boolean
  isError: boolean
  errorMessage?: string
  count: number
  onRefetch: () => void
  onCategoryChange: (category: string | null) => void
}

export function ChuckNorrisWidget({
  joke,
  categories,
  selectedCategory,
  isPending,
  isRefetching,
  isError,
  errorMessage,
  count,
  onRefetch,
  onCategoryChange,
}: ChuckNorrisWidgetProps) {
  return (
    <Card elevation={3}>
      <CardHeader
        avatar={
          <Avatar
            src="https://api.chucknorris.io/img/avatar/chuck-norris.png"
            alt="Chuck Norris"
          />
        }
        title="Chuck Norris Facts"
        subheader={selectedCategory ?? 'alle categorieën'}
        action={
          <Tooltip title="Nieuwe grap">
            <span>
              <IconButton onClick={onRefetch} disabled={isPending || isRefetching}>
                {isRefetching ? <CircularProgress size={20} /> : <ReplayIcon />}
              </IconButton>
            </span>
          </Tooltip>
        }
      />

      <Divider />

      <CardContent sx={{ minHeight: '7.5rem' }}>
        {isPending && !joke && (
          <>
            <Skeleton width="90%" />
            <Skeleton width="75%" />
            <Skeleton width="60%" />
          </>
        )}
        {isError && (
          <Typography sx={{ color: 'error.main' }}>
            {errorMessage ?? 'Er is iets misgegaan bij het ophalen van de grap.'}
          </Typography>
        )}
        {joke && (
          <Fade in key={joke.id}>
            <Typography
              variant="body1"
              sx={{
                opacity: isRefetching ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {joke.value}
            </Typography>
          </Fade>
        )}
      </CardContent>

      {categories.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                onClick={() => { onCategoryChange(selectedCategory === cat ? null : cat) }}
                color={selectedCategory === cat ? 'primary' : 'default'}
                variant={selectedCategory === cat ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </>
      )}

      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          #{count}
        </Typography>
      </CardActions>
    </Card>
  )
}
