import {useQuery, useInfiniteQuery} from '@tanstack/react-query';
import * as feedApi from './api';

// Query keys
export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  list: (cursor?: string) => [...feedKeys.lists(), cursor] as const,
  quizzes: () => [...feedKeys.all, 'quizzes'] as const,
  quiz: (id: string) => [...feedKeys.quizzes(), id] as const,
} as const;

// Hooks
export function useFeed() {
  return useInfiniteQuery({
    queryKey: feedKeys.lists(),
    queryFn: ({pageParam}) => feedApi.fetchFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: feedKeys.quiz(quizId),
    queryFn: () => feedApi.fetchQuizById(quizId),
    enabled: !!quizId,
  });
}
