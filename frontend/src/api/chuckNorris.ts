import { queryOptions } from "@tanstack/react-query";

export interface ChuckNorrisJoke {
  id: string;
  value: string;
  icon_url: string;
  url: string;
  categories?: string[];
}

interface MockCategory {
  name: string;
}

type MockJoke = ChuckNorrisJoke;

const isMockApi = import.meta.env.VITE_CHUCK_API_MODE === "mock";
const mockApiBaseUrl =
  typeof import.meta.env.VITE_CHUCK_API_BASE_URL === "string"
    ? import.meta.env.VITE_CHUCK_API_BASE_URL
    : "http://localhost:3002";

function joinMockApiUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBaseUrl}/${normalizedPath}`;
}

const mockJokesUrl = joinMockApiUrl(mockApiBaseUrl, "/jokes");
const mockCategoriesUrl = joinMockApiUrl(mockApiBaseUrl, "/categories");
const chuckNorrisApiUrl = "https://api.chucknorris.io";

export const chuckNorrisApiSource = isMockApi
  ? `mock (${mockApiBaseUrl})`
  : `external (${chuckNorrisApiUrl})`;

function pickRandomJoke(jokes: MockJoke[]): ChuckNorrisJoke {
  if (jokes.length === 0) throw new Error("Kon geen grap ophalen");

  const index = Math.floor(Math.random() * jokes.length);
  return jokes[index];
}

function matchesCategory(joke: MockJoke, category: string | null) {
  if (!category) return true;
  return joke.categories?.includes(category) ?? false;
}

async function fetchJson<T>(
  input: string | URL,
  errorMessage: string,
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(input);
  } catch {
    throw new Error(errorMessage);
  }

  if (!res.ok) throw new Error(errorMessage);

  try {
    return (await res.json()) as T;
  } catch {
    throw new Error(errorMessage);
  }
}

async function fetchJoke(category: string | null): Promise<ChuckNorrisJoke> {
  if (isMockApi) {
    const jokes = await fetchJson<MockJoke[]>(
      mockJokesUrl,
      "Kon geen grap ophalen",
    );
    const filteredJokes = jokes.filter((joke) =>
      matchesCategory(joke, category),
    );

    return pickRandomJoke(filteredJokes);
  }

  const url = category
    ? `${chuckNorrisApiUrl}/jokes/random?category=${encodeURIComponent(category)}`
    : `${chuckNorrisApiUrl}/jokes/random`;

  return fetchJson<ChuckNorrisJoke>(url, "Kon geen grap ophalen");
}

async function fetchCategories(): Promise<string[]> {
  if (isMockApi) {
    const categories = await fetchJson<MockCategory[]>(
      mockCategoriesUrl,
      "Kon categorieën niet ophalen",
    );
    return categories.map((category) => category.name);
  }

  return fetchJson<string[]>(
    `${chuckNorrisApiUrl}/jokes/categories`,
    "Kon categorieën niet ophalen",
  );
}

export const chuckNorrisCategoriesOptions = queryOptions({
  queryKey: ["chuck-norris-categories"],
  queryFn: fetchCategories,
  staleTime: 1000 * 60 * 60,
  refetchOnWindowFocus: true,
});

export function chuckNorrisJokeOptions(category: string | null) {
  return queryOptions({
    queryKey: ["chuck-norris-joke", category],
    queryFn: () => fetchJoke(category),
    staleTime: 0,
  });
}
