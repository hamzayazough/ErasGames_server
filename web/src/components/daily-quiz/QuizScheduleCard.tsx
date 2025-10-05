// components/daily-quiz/QuizScheduleCard.tsx
'use client';

import { useState } from 'react';
import { DailyQuiz } from '@/lib/types/api.types';

interface QuizScheduleCardProps {
  day: number;
  label: string;
  date: Date;
  quiz: DailyQuiz | null;
  loading: boolean;
  onViewDetails: (quiz: DailyQuiz) => void;
  onEdit: (quiz: DailyQuiz) => void;
  onCreate: (targetDate: Date) => void;
}

export default function QuizScheduleCard({
  day,
  label,
  date,
  quiz,
  loading,
  onViewDetails,
  onEdit,
  onCreate,
}: QuizScheduleCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getQuizStatusColor = (quiz: DailyQuiz | null) => {
    if (!quiz) return 'bg-gray-100 text-gray-600';
    if (quiz.status === 'ready') return 'bg-green-100 text-green-800';
    if (quiz.status === 'dropped') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getQuizStatusText = (quiz: DailyQuiz | null) => {
    if (!quiz) return 'Not Created';
    if (quiz.status === 'ready') return 'Ready';
    if (quiz.status === 'dropped') return 'Dropped';
    return 'Pending Template';
  };

  const formatDropTime = (dropAtUTC: string) => {
    return new Date(dropAtUTC).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  const isDropped = quiz?.status === 'dropped';
  const canEdit = quiz && !isDropped;

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="text-center min-w-[80px]">
          <div className="text-lg font-semibold text-gray-900">{label}</div>
          <div className="text-sm text-gray-500">{formatDate(date)}</div>
        </div>
        
        <div className="h-8 w-px bg-gray-200"></div>
        
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQuizStatusColor(quiz)}`}>
                  {getQuizStatusText(quiz)}
                </span>
                {quiz && (
                  <>
                    <span className="text-sm text-gray-600">
                      {quiz.questionCount || 5} questions
                    </span>
                    <span className="text-xs text-gray-500">
                      Mode: {quiz.mode}
                    </span>
                  </>
                )}
              </div>
              
              {quiz && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">
                    ID: {quiz.id}
                  </div>
                  {quiz.dropAtUTC && (
                    <div className="text-xs text-gray-500">
                      Drop Time: {formatDropTime(quiz.dropAtUTC)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2">
        {quiz ? (
          <>
            <button
              onClick={() => onViewDetails(quiz)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              View Details
            </button>
            {canEdit && (
              <button
                onClick={() => onEdit(quiz)}
                className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
              >
                Edit
              </button>
            )}
            {isDropped && (
              <span className="px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded cursor-not-allowed">
                Already Dropped
              </span>
            )}
          </>
        ) : (
          <button
            onClick={() => onCreate(date)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Create Quiz
          </button>
        )}
      </div>
    </div>
  );
}