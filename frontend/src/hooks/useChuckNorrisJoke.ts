import { useQuery } from '@tanstack/react-query'
import { chuckNorrisJokeOptions } from '@/api/chuckNorris'

export function useChuckNorrisJoke(category: string | null) {
  return useQuery(chuckNorrisJokeOptions(category))
}
