import { queryOptions } from '@tanstack/react-query'

export interface ChuckNorrisJoke {
  id: string
  value: string
  icon_url: string
  url: string
}

async function fetchJoke(category: string | null): Promise<ChuckNorrisJoke> {
  const url = category
    ? `https://api.chucknorris.io/jokes/random?category=${encodeURIComponent(category)}`
    : 'https://api.chucknorris.io/jokes/random'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Kon geen grap ophalen')
  return res.json() as Promise<ChuckNorrisJoke>
}

async function fetchCategories(): Promise<string[]> {
  const res = await fetch('https://api.chucknorris.io/jokes/categories')
  if (!res.ok) throw new Error('Kon categorieën niet ophalen')
  return res.json() as Promise<string[]>
}

export const chuckNorrisCategoriesOptions = queryOptions({
  queryKey: ['chuck-norris-categories'],
  queryFn: fetchCategories,
  staleTime: 1000 * 60 * 60,
  refetchOnWindowFocus: true,
})

export function chuckNorrisJokeOptions(category: string | null) {
  return queryOptions({
    queryKey: ['chuck-norris-joke', category],
    queryFn: () => fetchJoke(category),
    staleTime: 0,
  })
}
