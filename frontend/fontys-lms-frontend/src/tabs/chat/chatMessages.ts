export type ChatMessage = {
  id: string
  role: 'assistant' | 'student'
  title: string
  content: string
}

export const defaultMessages: ChatMessage[] = [
  {
    id: 'assistant-1',
    role: 'assistant',
    title: 'LMS-assistent',
    content:
      'Ik heb de laatste activiteit en challenge-context geladen. Waar wil je vandaag op sturen?',
  },
  {
    id: 'student-1',
    role: 'student',
    title: 'Student',
    content:
      'Ik wil mijn stappenplan aanscherpen en checken of mijn competenties goed aansluiten op de challenge.',
  },
  {
    id: 'assistant-2',
    role: 'assistant',
    title: 'LMS-assistent',
    content:
      'Prima. Open desgewenst de activiteitenkolom om het recente logboek mee te nemen in dit gesprek.',
  },
]
