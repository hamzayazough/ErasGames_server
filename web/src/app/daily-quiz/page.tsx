'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth.context';

export default function DailyQuizPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading daily quiz management...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily Quiz Management</h1>
              <p className="mt-2 text-gray-600">Create, preview, and manage daily quizzes</p>
            </div>
            <button
              onClick={() => {
                // TODO: Implement create daily quiz
                alert('Create daily quiz functionality coming soon!');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Daily Quiz
            </button>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Quiz Management</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            This section will allow you to create, schedule, and manage daily quizzes for your users. 
            You'll be able to select questions, set difficulty progression, and monitor engagement metrics.
          </p>
          
          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Quiz Creation</h3>
              <p className="text-sm text-gray-600">
                Build daily quizzes by selecting questions from your question pool
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">
                Track participation rates and question performance
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Scheduling</h3>
              <p className="text-sm text-gray-600">
                Schedule quizzes in advance and manage release timing
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => router.push('/questions')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors mr-4"
            >
              Manage Questions
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}