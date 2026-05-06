import { useState } from 'react'
import type React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ChuckNorrisWidget } from './ChuckNorrisWidget'

const CATEGORIES = ['animal', 'career', 'celebrity', 'dev', 'fashion', 'food', 'history', 'money', 'movie', 'music', 'sport', 'travel']

const MOCK_JOKE = {
  id: 'abc123',
  value: 'Chuck Norris can divide by zero.',
  icon_url: 'https://api.chucknorris.io/img/avatar/chuck-norris.png',
  url: 'https://api.chucknorris.io/jokes/abc123',
}

const LONG_JOKE = {
  ...MOCK_JOKE,
  id: 'long-joke',
  value:
    'Chuck Norris does not need pagination. When a result list gets too long, the internet quietly reorganizes itself into a single page that fits whatever Chuck Norris wanted to see in the first place.',
}

const MANY_CATEGORIES = [
  'animal',
  'career',
  'celebrity',
  'dev',
  'fashion',
  'food',
  'history',
  'money',
  'movie',
  'music',
  'science',
  'sport',
  'travel',
  'space',
  'technology',
  'university',
]

const meta: Meta<typeof ChuckNorrisWidget> = {
  title: 'Components/ChuckNorrisWidget',
  component: ChuckNorrisWidget,
  args: {
    joke: MOCK_JOKE,
    categories: CATEGORIES,
    selectedCategory: null,
    isPending: false,
    isRefetching: false,
    isError: false,
    count: 1,
    onRefetch: fn(),
    onCategoryChange: fn(),
  },
}

export default meta
type Story = StoryObj<typeof ChuckNorrisWidget>

function InteractiveWidget(args: React.ComponentProps<typeof ChuckNorrisWidget>) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <ChuckNorrisWidget
      {...args}
      selectedCategory={selected}
      onCategoryChange={(cat) => {
        setSelected(cat)
        args.onCategoryChange(cat)
      }}
    />
  )
}

export const Default: Story = {}

export const Interactive: Story = {
  render: (args) => <InteractiveWidget {...args} />,
}

export const Loading: Story = {
  args: { joke: undefined, isPending: true },
}

export const Refetching: Story = {
  args: { isRefetching: true },
}

export const WithCategory: Story = {
  args: { selectedCategory: 'dev', count: 5 },
}

export const Error: Story = {
  args: { joke: undefined, isError: true, errorMessage: 'Kon geen grap ophalen' },
}

export const NoCategories: Story = {
  args: { categories: [] },
}

export const LongJoke: Story = {
  args: { joke: LONG_JOKE },
}

export const ManyCategories: Story = {
  args: { categories: MANY_CATEGORIES },
}
