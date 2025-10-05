'use client';

import React from 'react';
import { Users } from 'lucide-react';
import type { DailyQuiz, QuizQuestion } from '@/lib/types/api.types';
import QuestionRenderer from './QuestionRenderer';

interface QuestionsTabProps {
  quiz: DailyQuiz;
  currentQuestions: QuizQuestion[];
  selectedQuestions: string[];
  setSelectedQuestions: (questions: string[]) => void;
  loading: boolean;
  loadingDetails: boolean;
  onUpdateQuestions: () => void;
  onSwapQuestion: (question: QuizQuestion, index: number) => void;
}

export default function QuestionsTab({
  quiz,
  currentQuestions,
  selectedQuestions,
  setSelectedQuestions,
  loading,
  loadingDetails,
  onUpdateQuestions,
  onSwapQuestion
}: QuestionsTabProps) {
  const isDropped = quiz.status === 'dropped';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Questions</h3>
        <p className="text-sm text-gray-600">
          Change the questions in this quiz. This will also regenerate the CDN template.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Questions Display */}
        <div>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading current questions...</span>
            </div>
          ) : (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Questions ({currentQuestions.length})</h4>
              <div className="space-y-6">
                {currentQuestions.map((question: QuizQuestion, index: number) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between p-4 pb-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Q{index + 1}
                        </span>
                        <span className="text-sm text-gray-600 capitalize">
                          {question.difficulty}
                        </span>
                        {question.themes && question.themes.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {question.themes.slice(0, 2).map((theme) => (
                              <span key={theme} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                                {theme}
                              </span>
                            ))}
                            {question.themes.length > 2 && (
                              <span className="text-xs text-gray-500">+{question.themes.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSwapQuestion(question, index)}
                          disabled={isDropped}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Swap
                        </button>
                        <span className="text-xs text-gray-500 font-mono">
                          {question.id}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <QuestionRenderer question={question} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Update Questions Button */}
        {!isDropped && (
          <div className="flex justify-end">
            <button
              onClick={onUpdateQuestions}
              disabled={loading || selectedQuestions.length !== 5}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Questions'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}