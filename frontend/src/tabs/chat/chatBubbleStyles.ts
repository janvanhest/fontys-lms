export const streamingAvatarSx = {
  animation: 'rainbow 2s linear infinite, pulse 1.2s ease-in-out infinite',
  '@keyframes rainbow': {
    '0%': { backgroundColor: 'hsl(0,   90%, 52%)' },
    '14%': { backgroundColor: 'hsl(30,  95%, 50%)' },
    '28%': { backgroundColor: 'hsl(55,  90%, 45%)' },
    '42%': { backgroundColor: 'hsl(130, 70%, 40%)' },
    '57%': { backgroundColor: 'hsl(190, 85%, 42%)' },
    '71%': { backgroundColor: 'hsl(240, 80%, 58%)' },
    '85%': { backgroundColor: 'hsl(290, 75%, 52%)' },
    '100%': { backgroundColor: 'hsl(0,   90%, 52%)' },
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
  },
} as const;
