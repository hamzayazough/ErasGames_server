// components/daily-quiz/CreateQuizModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Settings, Search } from 'lucide-react';
import { DailyQuizMode, Question } from '@/lib/types/api.types';
import { adminDailyQuizService } from '@/lib/services/admin-daily-quiz.service';
import { questionService } from '@/lib/services/question.service';

interface CreateQuizModalProps {
  isOpen: boolean;
  targetDate?: Date;
  onClose: () => void;
  onSuccess: () => void;
}



export default function CreateQuizModal({
  isOpen,
  targetDate,
  onClose,
  onSuccess,
}: CreateQuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Select Questions
  
  // Form data
  const [dropDate, setDropDate] = useState('');
  const [dropTime, setDropTime] = useState('17:00');
  const [mode, setMode] = useState<DailyQuizMode>('STANDARD');
  const [replaceExisting, setReplaceExisting] = useState(false);
  
  // Questions
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (targetDate) {
        const localDate = new Date(targetDate.getTime() - targetDate.getTimezoneOffset() * 60000);
        setDropDate(localDate.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, targetDate]);

  const resetForm = () => {
    setStep(1);
    setDropDate('');
    setDropTime('17:00');
    setMode('STANDARD');
    setReplaceExisting(false);
    setSelectedQuestions([]);
    setSearchQuery('');
    setAvailableQuestions([]);
  };

  const loadAvailableQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await questionService.getApprovedQuestions();
      // Filter out disabled questions
      const enabledQuestions = response.filter(q => !q.disabled);
      setAvailableQuestions(enabledQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setAvailableQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      loadAvailableQuestions();
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (selectedQuestions.length !== 5) {
      alert('Please select exactly 5 questions');
      return;
    }

    setLoading(true);
    try {
      const dropAtUTC = new Date(`${dropDate}T${dropTime}:00`).toISOString();
      
      await adminDailyQuizService.createCustomQuiz({
        dropAtUTC,
        questionIds: selectedQuestions,
        mode,
        replaceExisting,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else if (prev.length < 5) {
        return [...prev, questionId];
      }
      return prev;
    });
  };

  const filteredQuestions = availableQuestions.filter(q =>
    q.promptJSON.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.themesJSON.some(theme => theme.toLowerCase().includes(searchQuery.toLowerCase())) ||
    q.subjectsJSON.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Create New Quiz</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                1. Basic Info
              </span>
              <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                2. Select Questions
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Drop Date
                  </label>
                  <input
                    type="date"
                    value={dropDate}
                    onChange={(e) => setDropDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Drop Time (Local)
                  </label>
                  <input
                    type="time"
                    value={dropTime}
                    onChange={(e) => setDropTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Settings className="inline h-4 w-4 mr-1" />
                  Quiz Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as DailyQuizMode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="STANDARD">Standard Mode</option>
                  <option value="THEMED">Themed Mode</option>
                  <option value="CHALLENGE">Challenge Mode</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="replaceExisting"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="replaceExisting" className="text-sm text-gray-700">
                  Replace existing quiz if one exists for this date
                </label>
              </div>

              {targetDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Target Date:</strong> {targetDate.toDateString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    The quiz will be created for this specific date
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Select Questions ({selectedQuestions.length}/5)
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {loadingQuestions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading questions...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedQuestions.includes(question.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleQuestionSelection(question.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600 capitalize">
                            {question.difficulty}
                          </span>
                          <span className="text-sm text-gray-600">
                            {question.questionType}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">
                          {question.id}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800 mb-2">
                        {question.promptJSON.task}
                      </div>
                      {question.themesJSON.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {question.themesJSON.map((theme) => (
                            <span key={theme} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedQuestions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Selected Questions:</strong> {selectedQuestions.length}/5
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {5 - selectedQuestions.length > 0 
                      ? `Select ${5 - selectedQuestions.length} more question${5 - selectedQuestions.length !== 1 ? 's' : ''}`
                      : 'Ready to create quiz!'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                onClick={handleNext}
                disabled={!dropDate || !dropTime}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={loading || selectedQuestions.length !== 5}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}