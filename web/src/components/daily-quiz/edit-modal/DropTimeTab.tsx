'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { DailyQuiz } from '@/lib/types/api.types';

interface DropTimeTabProps {
  quiz: DailyQuiz;
  newDropTime: string;
  setNewDropTime: (time: string) => void;
  loading: boolean;
  onUpdateDropTime: () => void;
  formatDropTime: (dropAtUTC: string) => string;
}

export default function DropTimeTab({
  quiz,
  newDropTime,
  setNewDropTime,
  loading,
  onUpdateDropTime,
  formatDropTime
}: DropTimeTabProps) {
  const isDropped = quiz.status === 'dropped';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Drop Time</h3>
        <p className="text-sm text-gray-600">
          Change the time when this quiz will be released. The date will remain the same. This will also update notification scheduling.
        </p>
      </div>

      {/* Current Drop Time Display */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">
            Current Drop Time: {formatDropTime(quiz.dropAtUTC)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="dropTime" className="block text-sm font-medium text-gray-700 mb-2">
            New Drop Time (Local)
          </label>
          <input
            id="dropTime"
            type="time"
            value={newDropTime}
            onChange={(e) => setNewDropTime(e.target.value)}
            disabled={isDropped || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onUpdateDropTime}
            disabled={loading || !newDropTime || isDropped}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Drop Time'}
          </button>
        </div>
      </div>
    </div>
  );
}