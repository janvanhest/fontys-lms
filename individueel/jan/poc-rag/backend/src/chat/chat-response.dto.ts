export interface ChatSourceDto {
  title: string;
  source: string;
  score: number;
}

export interface ChatResponseDto {
  answer: string;
  sources: ChatSourceDto[];
}
