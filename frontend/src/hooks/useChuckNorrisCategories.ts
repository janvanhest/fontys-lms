import { useQuery } from '@tanstack/react-query'
import { chuckNorrisCategoriesOptions } from '@/api/chuckNorris'

export function useChuckNorrisCategories() {
  return useQuery(chuckNorrisCategoriesOptions)
}
