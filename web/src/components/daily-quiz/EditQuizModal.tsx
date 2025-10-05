// components/daily-quiz/EditQuizModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, RefreshCw } from 'lucide-react';
import { DailyQuiz, QuizQuestion } from '@/lib/types/api.types';
import { adminDailyQuizService } from '@/lib/services/admin-daily-quiz.service';

// Question renderer imports
import { AlbumYearGuessRenderer } from '@/components/questions/types/AlbumYearGuessRenderer';
import { SongAlbumMatchRenderer } from '@/components/questions/types/SongAlbumMatchRenderer';
import { FillBlankRenderer } from '@/components/questions/types/FillBlankRenderer';
import { GuessByLyricRenderer } from '@/components/questions/types/GuessByLyricRenderer';
import { OddOneOutRenderer } from '@/components/questions/types/OddOneOutRenderer';
import { AiVisualRenderer } from '@/components/questions/types/AiVisualRenderer';
import { SoundAlikeSnippetRenderer } from '@/components/questions/types/SoundAlikeSnippetRenderer';
import { MoodMatchRenderer } from '@/components/questions/types/MoodMatchRenderer';
import { InspirationMapRenderer } from '@/components/questions/types/InspirationMapRenderer';
import { LifeTriviaRenderer } from '@/components/questions/types/LifeTriviaRenderer';
import { TimelineOrderRenderer } from '@/components/questions/types/TimelineOrderRenderer';
import { PopularityMatchRenderer } from '@/components/questions/types/PopularityMatchRenderer';
import { LongestSongRenderer } from '@/components/questions/types/LongestSongRenderer';
import { TracklistOrderRenderer } from '@/components/questions/types/TracklistOrderRenderer';
import { OutfitEraRenderer } from '@/components/questions/types/OutfitEraRenderer';
import { LyricMashupRenderer } from '@/components/questions/types/LyricMashupRenderer';
import { SpeedTapRenderer } from '@/components/questions/types/SpeedTapRenderer';
import { ReverseAudioRenderer } from '@/components/questions/types/ReverseAudioRenderer';
import { OneSecondRenderer } from '@/components/questions/types/OneSecondRenderer';

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
  const [newDropTime, setNewDropTime] = useState('');
  
  // Questions editing
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
    if (!quiz?.id || !newDropTime || !quiz.dropAtUTC) return;

    setLoading(true);
    try {
      // Use the current quiz date but update the time
      const currentDate = new Date(quiz.dropAtUTC);
      const currentDateString = currentDate.toISOString().split('T')[0];
      const newDropAtUTC = new Date(`${currentDateString}T${newDropTime}:00`).toISOString();
      
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

  // Question renderer function
  const renderQuestion = (question: QuizQuestion) => {
    if (!question.questionType) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-yellow-800 font-medium">Unsupported Question Type: Unknown (normalized: )</h4>
          <p className="text-yellow-700 text-sm mt-1">Task: {question.prompt?.task || 'No task available'}</p>
          <pre className="mt-2 text-xs text-yellow-600 bg-yellow-100 p-2 rounded overflow-auto">
            {JSON.stringify(question, null, 2)}
          </pre>
        </div>
      );
    }

    // Transform question data to match renderer expectations
    const questionProps = {
      ...question,
      prompt: question.prompt,
      themes: question.themes || [],
      choices: question.choices || question.choicesJSON || [],
      correct: question.correct || question.correctJSON,
      mediaRefs: question.mediaRefs || question.mediaJSON || []
    };

    const normalizedType = question.questionType.replace(/_/g, '-');

    try {
      switch (normalizedType) {
        case 'album-year-guess':
          return <AlbumYearGuessRenderer question={questionProps as any} showAnswer={true} />;
        case 'song-album-match':
          return <SongAlbumMatchRenderer question={questionProps as any} showAnswer={true} />;
        case 'fill-blank':
          return <FillBlankRenderer question={questionProps as any} showAnswer={true} />;
        case 'guess-by-lyric':
          return <GuessByLyricRenderer question={questionProps as any} showAnswer={true} />;
        case 'odd-one-out':
          return <OddOneOutRenderer question={questionProps as any} showAnswer={true} />;
        case 'ai-visual':
          return <AiVisualRenderer question={questionProps as any} showAnswer={true} />;
        case 'sound-alike-snippet':
          return <SoundAlikeSnippetRenderer question={questionProps as any} showAnswer={true} />;
        case 'mood-match':
          return <MoodMatchRenderer question={questionProps as any} showAnswer={true} />;
        case 'inspiration-map':
          return <InspirationMapRenderer question={questionProps as any} showAnswer={true} />;
        case 'life-trivia':
          return <LifeTriviaRenderer question={questionProps as any} showAnswer={true} />;
        case 'timeline-order':
          return <TimelineOrderRenderer question={questionProps as any} showAnswer={true} />;
        case 'popularity-match':
          return <PopularityMatchRenderer question={questionProps as any} showAnswer={true} />;
        case 'longest-song':
          return <LongestSongRenderer question={questionProps as any} showAnswer={true} />;
        case 'tracklist-order':
          return <TracklistOrderRenderer question={questionProps as any} showAnswer={true} />;
        case 'outfit-era':
          return <OutfitEraRenderer question={questionProps as any} showAnswer={true} />;
        case 'lyric-mashup':
          return <LyricMashupRenderer question={questionProps as any} showAnswer={true} />;
        case 'speed-tap':
          return <SpeedTapRenderer question={questionProps as any} showAnswer={true} />;
        case 'reverse-audio':
          return <ReverseAudioRenderer question={questionProps as any} showAnswer={true} />;
        case 'one-second':
          return <OneSecondRenderer question={questionProps as any} showAnswer={true} />;
        default:
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-yellow-800 font-medium">Unsupported Question Type: {question.questionType} (normalized: {normalizedType})</h4>
              <p className="text-yellow-700 text-sm mt-1">Task: {question.prompt?.task || 'No task available'}</p>
              <pre className="mt-2 text-xs text-yellow-600 bg-yellow-100 p-2 rounded overflow-auto">
                {JSON.stringify(question, null, 2)}
              </pre>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering question:', error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium">Error Rendering Question</h4>
          <p className="text-red-700 text-sm mt-1">Type: {question.questionType}</p>
          <p className="text-red-700 text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      );
    }
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
                      Change the time when this quiz will be released. The date will remain the same. This will also update notification scheduling.
                    </p>
                  </div>

                  {quiz.dropAtUTC && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Current Drop Time:</strong> {formatDateTime(quiz.dropAtUTC)}
                      </p>
                    </div>
                  )}

                  <div className="max-w-sm">
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
                              <span className="text-xs text-gray-500 font-mono">
                                {question.id}
                              </span>
                            </div>
                            <div className="p-4">
                              {renderQuestion(question)}
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
                    disabled={loading || !newDropTime}
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