import {api} from '../../core/api/client';
import {z} from 'zod';

// Feed types
const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  duration: z.number(),
  questionsCount: z.number(),
  category: z.string(),
  imageUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  authorName: z.string(),
});

export type Quiz = z.infer<typeof QuizSchema>;

const FeedResponseSchema = z.object({
  quizzes: z.array(QuizSchema),
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
});

export type FeedResponse = z.infer<typeof FeedResponseSchema>;

// API functions
export async function fetchFeed(cursor?: string): Promise<FeedResponse> {
  const response = await api.get('/feed', {
    params: cursor ? {cursor} : undefined,
  });
  return FeedResponseSchema.parse(response.data);
}

export async function fetchQuizById(quizId: string): Promise<Quiz> {
  const response = await api.get(`/quizzes/${quizId}`);
  return QuizSchema.parse(response.data);
}
