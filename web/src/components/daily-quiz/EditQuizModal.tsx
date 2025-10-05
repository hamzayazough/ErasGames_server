// components/daily-quiz/EditQuizModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, RefreshCw } from 'lucide-react';
import { DailyQuiz } from '@/lib/types/api.types';
import { adminDailyQuizService } from '@/lib/services/admin-daily-quiz.service';

interface EditQuizModalProps {
  quiz: DailyQuiz | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditQuizModal({
  quiz,
  isOpen,
  onClose,
  onSuccess,
}: EditQuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dropTime' | 'questions' | 'actions'>('dropTime');
  
  // Drop time editing
  const [newDropDate, setNewDropDate] = useState('');
  const [newDropTime, setNewDropTime] = useState('');
  
  // Questions editing
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && quiz) {
      resetForm();
      loadQuizDetails();
      if (quiz.dropAtUTC) {
        const dropDate = new Date(quiz.dropAtUTC);
        const localDate = new Date(dropDate.getTime() - dropDate.getTimezoneOffset() * 60000);
        setNewDropDate(localDate.toISOString().split('T')[0]);
        setNewDropTime(localDate.toTimeString().slice(0, 5));
      }
    }
  }, [isOpen, quiz]);

  const resetForm = () => {
    setActiveTab('dropTime');
    setNewDropDate('');
    setNewDropTime('');
    setCurrentQuestions([]);
    setSelectedQuestions([]);
  };

  const loadQuizDetails = async () => {
    if (!quiz?.id) return;
    
    setLoadingDetails(true);
    try {
      const response = await adminDailyQuizService.getQuizDetails(quiz.id);
      if (response.data.questions) {
        setCurrentQuestions(response.data.questions);
        setSelectedQuestions(response.data.questions.map((q: any) => q.id));
      }
    } catch (error) {
      console.error('Failed to load quiz details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateDropTime = async () => {
    if (!quiz?.id || !newDropDate || !newDropTime) return;

    setLoading(true);
    try {
      const newDropAtUTC = new Date(`${newDropDate}T${newDropTime}:00`).toISOString();
      
      await adminDailyQuizService.updateQuizDropTime({
        quizId: quiz.id,
        newDropAtUTC,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update drop time:', error);
      alert('Failed to update drop time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestions = async () => {
    if (!quiz?.id || selectedQuestions.length !== 5) return;

    setLoading(true);
    try {
      await adminDailyQuizService.updateQuizQuestions({
        quizId: quiz.id,
        questionIds: selectedQuestions,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update questions:', error);
      alert('Failed to update questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTemplate = async () => {
    if (!quiz?.id) return;

    setLoading(true);
    try {
      await adminDailyQuizService.regenerateTemplate({
        quizId: quiz.id,
      });

      alert('Template regeneration started successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to regenerate template:', error);
      alert('Failed to regenerate template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quiz?.id) return;

    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await adminDailyQuizService.deleteQuiz({
        quizId: quiz.id,
      });

      alert('Quiz deleted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  if (!isOpen || !quiz) return null;

  const isDropped = quiz.status === 'dropped';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Edit Quiz</h2>
            <span className="text-sm text-gray-500 font-mono">{quiz.id}</span>
            {isDropped && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                ALREADY DROPPED
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isDropped ? (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Already Dropped</h3>
              <p className="text-gray-600">
                This quiz has already been released and cannot be edited.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Dropped at: {quiz.dropAtUTC ? formatDateTime(quiz.dropAtUTC) : 'Unknown'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="px-6 pt-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('dropTime')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'dropTime'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Clock className="inline h-4 w-4 mr-1" />
                    Drop Time
                  </button>
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'questions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="inline h-4 w-4 mr-1" />
                    Questions
                  </button>
                  <button
                    onClick={() => setActiveTab('actions')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'actions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <RefreshCw className="inline h-4 w-4 mr-1" />
                    Actions
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'dropTime' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Update Drop Time</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Change when this quiz will be released to users. This will also update notification scheduling.
                    </p>
                  </div>

                  {quiz.dropAtUTC && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Current Drop Time:</strong> {formatDateTime(quiz.dropAtUTC)}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Drop Date
                      </label>
                      <input
                        type="date"
                        value={newDropDate}
                        onChange={(e) => setNewDropDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Drop Time (Local)
                      </label>
                      <input
                        type="time"
                        value={newDropTime}
                        onChange={(e) => setNewDropTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Update Questions</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Change the questions in this quiz. This will also regenerate the CDN template.
                    </p>
                  </div>

                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading current questions...</span>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Current Questions ({currentQuestions.length})</h4>
                      <div className="space-y-3">
                        {currentQuestions.map((question: any, index: number) => (
                          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                  Q{index + 1}
                                </span>
                                <span className="text-sm text-gray-600 capitalize">
                                  {question.difficulty}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 font-mono">
                                {question.id}
                              </span>
                            </div>
                            <div className="text-sm text-gray-800">
                              {question.promptJSON?.task || 'Question content not available'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Actions</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Perform advanced actions on this quiz.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Regenerate Template</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Rebuild and re-upload the CDN template for this quiz. Useful if questions were updated externally.
                      </p>
                      <button
                        onClick={handleRegenerateTemplate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Regenerating...' : 'Regenerate Template'}
                      </button>
                    </div>

                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h4 className="font-medium text-red-900 mb-2">Delete Quiz</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Permanently delete this quiz. This action cannot be undone and will remove all associated data.
                      </p>
                      <button
                        onClick={handleDeleteQuiz}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Deleting...' : 'Delete Quiz'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                {quiz.updatedAt && (
                  <>Last updated: {formatDateTime(quiz.updatedAt)}</>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                {activeTab === 'dropTime' && (
                  <button
                    onClick={handleUpdateDropTime}
                    disabled={loading || !newDropDate || !newDropTime}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Drop Time'}
                  </button>
                )}
                {activeTab === 'questions' && (
                  <button
                    onClick={handleUpdateQuestions}
                    disabled={loading || selectedQuestions.length !== 5}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Questions'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}