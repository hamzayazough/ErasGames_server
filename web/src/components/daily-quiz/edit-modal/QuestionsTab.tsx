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
  onAddQuestion: () => void;
}

export default function QuestionsTab({
  quiz,
  currentQuestions,
  selectedQuestions,
  setSelectedQuestions,
  loading,
  loadingDetails,
  onUpdateQuestions,
  onSwapQuestion,
  onAddQuestion
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
        {/* Warning for incomplete quiz */}
        {currentQuestions.length < 6 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Incomplete Quiz
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  This quiz has only {currentQuestions.length} question{currentQuestions.length !== 1 ? 's' : ''} but requires 6. Please add {6 - currentQuestions.length} more question{6 - currentQuestions.length !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </div>
        )}
        
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
                        {!isDropped && (
                          <button
                            onClick={() => onSwapQuestion(question, index)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded"
                          >
                            Swap
                          </button>
                        )}
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

        {/* Action Buttons */}
        {!isDropped && (
          <div className="flex justify-between items-center">
            {/* Add Question Button - only show if less than 6 questions */}
            {currentQuestions.length < 6 && (
              <button
                onClick={onAddQuestion}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Question ({currentQuestions.length}/6)
              </button>
            )}
            
            {/* Update Questions Button */}
            <div className={currentQuestions.length < 6 ? 'ml-auto' : 'w-full flex justify-end'}>
              <button
                onClick={onUpdateQuestions}
                disabled={loading || selectedQuestions.length === 0 || selectedQuestions.length > 6}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Questions'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}