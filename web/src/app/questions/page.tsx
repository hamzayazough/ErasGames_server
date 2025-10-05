'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth.context';
import { questionService } from '@/lib/services/question.service';
import { AnyQuestion } from '@/lib/types/interfaces/questions/any-question.type';
import { QuestionDifficulty, QuestionType } from '@/lib/types/enums/question.enums';

interface QuestionStats {
  total: number;
  approved: number;
  pending: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
}

export default function QuestionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<AnyQuestion[]>([]);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // All available question types
  const focusedQuestionTypes = [
    'album-year-guess',
    'song-album-match', 
    'fill-blank',
    'guess-by-lyric',
    'odd-one-out',
    'ai-visual',
    'sound-alike-snippet',
    'mood-match',
    'inspiration-map',
    'life-trivia',
    'timeline-order',
    'popularity-match',
    'longest-song',
    'tracklist-order',
    'outfit-era',
    'lyric-mashup',
    'speed-tap',
    'reverse-audio',
    'one-second'
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch stats and questions in parallel
      const [statsResponse, questionsResponse] = await Promise.all([
        questionService.getQuestionStats(),
        questionService.getAllQuestions()
      ]);

      console.log('Stats response:', statsResponse);
      console.log('Questions response:', questionsResponse);

      // Handle response - server returns data directly, not wrapped
      setStats(statsResponse.data || statsResponse || null);
      const questionsData = questionsResponse.data || questionsResponse;
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions data');
      console.error('Error fetching questions data:', err);
      // Set safe defaults on error
      setStats(null);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredQuestions = async () => {
    try {
      setIsLoading(true);
      let response;

      if (selectedFilter === 'approved') {
        response = await questionService.getApprovedQuestions();
      } else if (selectedFilter === 'pending') {
        response = await questionService.getPendingQuestions();
      } else if (selectedType !== 'all') {
        response = await questionService.getQuestionsByType(selectedType);
      } else if (selectedDifficulty !== 'all') {
        response = await questionService.getQuestionsByDifficulty(selectedDifficulty);
      } else {
        response = await questionService.getAllQuestions();
      }

      // Handle response - server returns data directly, not wrapped
      const questionsData = response.data || response;
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch filtered questions');
      console.error('Error fetching filtered questions:', err);
      // Set safe default on error
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFilteredQuestions();
    }
  }, [selectedFilter, selectedType, selectedDifficulty, user]);

  const handleApproveQuestion = async (questionId: string) => {
    try {
      await questionService.approveQuestion(questionId);
      // Refresh the data
      await fetchFilteredQuestions();
      await fetchData(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve question');
    }
  };

  const handleDisableQuestion = async (questionId: string) => {
    try {
      await questionService.disableQuestion(questionId);
      // Refresh the data
      await fetchFilteredQuestions();
      await fetchData(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable question');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Questions Management</h1>
              <p className="mt-2 text-gray-600">Manage and monitor quiz questions</p>
            </div>
            <button
              onClick={() => router.push('/questions/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create New Question
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Questions</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Approved</h3>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Approval Rate</h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        )}

        {/* Question Type Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Questions by Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {focusedQuestionTypes.map((type) => (
                <div key={type} className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-800 text-sm">
                    {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {stats.byType[type] || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'approved' | 'pending')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Questions</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {focusedQuestionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Questions ({questions?.length || 0})
            </h3>
          </div>
          
          {!questions || questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions found with the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Themes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {question.promptJSON?.task || 'No task description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.questionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          question.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {question.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {question.themesJSON?.slice(0, 3).map((theme, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
                            >
                              {theme}
                            </span>
                          ))}
                          {question.themesJSON && question.themesJSON.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{question.themesJSON.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            // Store the question data in sessionStorage and navigate
                            console.log('Storing question in sessionStorage:', question);
                            console.log('Storage key:', `question-${question.id}`);
                            sessionStorage.setItem(`question-${question.id}`, JSON.stringify(question));
                            console.log('Stored successfully, navigating to:', `/questions/${question.id}`);
                            router.push(`/questions/${question.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {!question.approved && (
                          <button
                            onClick={() => handleApproveQuestion(question.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                        )}
                        {question.approved && (
                          <button
                            onClick={() => handleDisableQuestion(question.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Disable
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}