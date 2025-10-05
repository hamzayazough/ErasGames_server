'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Users, Settings } from 'lucide-react';
import { adminDailyQuizService } from '@/lib/services/admin-daily-quiz.service';
import type { DailyQuiz, QuizQuestion } from '@/lib/types/api.types';

// Child components
import DropTimeTab from './edit-modal/DropTimeTab';
import QuestionsTab from './edit-modal/QuestionsTab';
import ActionsTab from './edit-modal/ActionsTab';
import SwapQuestionModal from './edit-modal/SwapQuestionModal';

interface EditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: DailyQuiz | null;
  onSuccess: () => void;
}

export default function EditQuizModal({
  isOpen,
  onClose,
  quiz,
  onSuccess
}: EditQuizModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'dropTime' | 'questions' | 'actions'>('dropTime');
  const [loading, setLoading] = useState(false);

  // Drop time editing
  const [newDropTime, setNewDropTime] = useState('');
  
  // Questions editing
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Question swapping
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [questionToSwap, setQuestionToSwap] = useState<QuizQuestion | null>(null);
  const [swapQuestionIndex, setSwapQuestionIndex] = useState<number>(-1);
  const [swapCandidates, setSwapCandidates] = useState<any[]>([]);
  const [loadingSwapCandidates, setLoadingSwapCandidates] = useState(false);

  // Initialize component when opened
  useEffect(() => {
    if (isOpen && quiz) {
      resetForm();
      loadQuizDetails();
      if (quiz.dropAtUTC) {
        const dropDate = new Date(quiz.dropAtUTC);
        const hours = dropDate.getHours().toString().padStart(2, '0');
        const minutes = dropDate.getMinutes().toString().padStart(2, '0');
        setNewDropTime(`${hours}:${minutes}`);
      }
    }
  }, [isOpen, quiz]);

  const resetForm = () => {
    setActiveTab('dropTime');
    setNewDropTime('');
    setCurrentQuestions([]);
    setSelectedQuestions([]);
    setLoading(false);
    setLoadingDetails(false);
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
      alert('Failed to load quiz details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateDropTime = async () => {
    if (!quiz?.id || !newDropTime) return;

    setLoading(true);
    try {
      // Get current date from existing drop time and combine with new time
      const currentDate = new Date(quiz.dropAtUTC);
      const [hours, minutes] = newDropTime.split(':');
      const newDate = new Date(currentDate);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      await adminDailyQuizService.updateQuizDropTime({
        quizId: quiz.id,
        newDropAtUTC: newDate.toISOString(),
      });

      alert('Drop time updated successfully!');
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
    if (!quiz?.id || selectedQuestions.length !== 6) return;

    setLoading(true);
    try {
      await adminDailyQuizService.updateQuizQuestions({
        quizId: quiz.id,
        questionIds: selectedQuestions,
      });

      alert('Questions updated successfully!');
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

      alert('Template regenerated successfully!');
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

    const confirmed = confirm(
      'Are you sure you want to delete this quiz? This action cannot be undone.'
    );
    if (!confirmed) return;

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

  const handleSwapQuestion = async (question: QuizQuestion, index: number) => {
    setQuestionToSwap(question);
    setSwapQuestionIndex(index);
    setShowSwapModal(true);
    setLoadingSwapCandidates(true);
    
    try {
      // Get all available questions
      const response = await adminDailyQuizService.getAllQuestions();
      
      // Filter out questions that are already in the current quiz
      const currentQuestionIds = currentQuestions.map(q => q.id);
      const candidates = response.filter((q: any) => 
        !currentQuestionIds.includes(q.id) && 
        q.approved && 
        !q.disabled
      );
      
      setSwapCandidates(candidates);
    } catch (error) {
      console.error('Failed to load swap candidates:', error);
      alert('Failed to load available questions. Please try again.');
    } finally {
      setLoadingSwapCandidates(false);
    }
  };

  const handleConfirmSwap = async (newQuestion: any) => {
    if (!questionToSwap || swapQuestionIndex === -1 || !quiz?.id) return;
    
    // Check if quiz has already dropped
    if (quiz.status === 'dropped') {
      alert('Cannot swap questions for a quiz that has already been dropped.');
      return;
    }
    
    // Create new questions array with the swapped question
    const newQuestions = [...selectedQuestions];
    newQuestions[swapQuestionIndex] = newQuestion.id;
    
    // Ensure we only have 6 questions
    if (newQuestions.length !== 6) {
      console.error('Invalid question array length:', newQuestions.length);
      alert('Error: Question array must contain exactly 6 questions.');
      return;
    }
    
    try {
      await adminDailyQuizService.updateQuizQuestions({
        quizId: quiz.id,
        questionIds: newQuestions,
      });
      
      // Refresh the quiz details
      await loadQuizDetails();
      setShowSwapModal(false);
      setQuestionToSwap(null);
      setSwapQuestionIndex(-1);
      
      alert('Question swapped successfully!');
    } catch (error) {
      console.error('Failed to swap question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to swap question: ${errorMessage}`);
    }
  };

  const closeSwapModal = () => {
    setShowSwapModal(false);
    setQuestionToSwap(null);
    setSwapQuestionIndex(-1);
  };

  const formatDropTime = (dropAtUTC: string) => {
    return new Date(dropAtUTC).toLocaleString('en-US', {
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Quiz</h2>
              <p className="text-sm text-gray-600 font-mono">{quiz.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dropTime')}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dropTime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Drop Time
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Questions
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'actions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Actions
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'dropTime' && (
              <DropTimeTab
                quiz={quiz}
                newDropTime={newDropTime}
                setNewDropTime={setNewDropTime}
                loading={loading}
                onUpdateDropTime={handleUpdateDropTime}
                formatDropTime={formatDropTime}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionsTab
                quiz={quiz}
                currentQuestions={currentQuestions}
                selectedQuestions={selectedQuestions}
                setSelectedQuestions={setSelectedQuestions}
                loading={loading}
                loadingDetails={loadingDetails}
                onUpdateQuestions={handleUpdateQuestions}
                onSwapQuestion={handleSwapQuestion}
              />
            )}

            {activeTab === 'actions' && (
              <ActionsTab
                quiz={quiz}
                loading={loading}
                onRegenerateTemplate={handleRegenerateTemplate}
                onDeleteQuiz={handleDeleteQuiz}
              />
            )}
          </div>
        </div>
      </div>

      {/* Swap Question Modal */}
      <SwapQuestionModal
        isOpen={showSwapModal}
        onClose={closeSwapModal}
        questionIndex={swapQuestionIndex}
        candidates={swapCandidates}
        loading={loadingSwapCandidates}
        onSelectQuestion={handleConfirmSwap}
      />
    </>
  );
}