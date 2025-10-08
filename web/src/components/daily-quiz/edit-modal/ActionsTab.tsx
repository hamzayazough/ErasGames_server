'use client';

import React from 'react';
import { Settings, Trash2 } from 'lucide-react';
import type { DailyQuiz } from '@/lib/types/api.types';

interface ActionsTabProps {
  quiz: DailyQuiz;
  loading: boolean;
  onRegenerateTemplate: () => void;
  onDeleteQuiz: () => void;
}

export default function ActionsTab({
  quiz,
  loading,
  onRegenerateTemplate,
  onDeleteQuiz
}: ActionsTabProps) {
  const isDropped = quiz.status === 'dropped';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Actions</h3>
        <p className="text-sm text-gray-600">
          Advanced actions for managing this quiz.
        </p>
      </div>

      <div className="space-y-6">
        {/* Regenerate Template */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Regenerate CDN Template</h4>
              <p className="text-sm text-gray-600 mt-1">
                Recreate the CDN template for this quiz. This will update the template version and may affect cached content.
              </p>
              <button
                onClick={onRegenerateTemplate}
                disabled={loading || isDropped}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Regenerating...' : 'Regenerate Template'}
              </button>
            </div>
          </div>
        </div>

        {/* Delete Quiz */}
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start space-x-3">
            <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Delete Quiz</h4>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete this quiz. This action cannot be undone. Only quizzes that haven't been dropped can be deleted.
              </p>
              <button
                onClick={onDeleteQuiz}
                disabled={loading || isDropped}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}