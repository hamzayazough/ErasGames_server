// components/daily-quiz/QuizDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Hash, Settings } from 'lucide-react';
import type { DailyQuiz, QuizQuestion } from '@/lib/types/api.types';
import { adminDailyQuizService } from '@/lib/services/admin-daily-quiz.service';

// Import all question renderer components
import { AiVisualRenderer } from '@/components/questions/types/AiVisualRenderer';
import { AlbumYearGuessRenderer } from '@/components/questions/types/AlbumYearGuessRenderer';
import { FillBlankRenderer } from '@/components/questions/types/FillBlankRenderer';
import { GuessByLyricRenderer } from '@/components/questions/types/GuessByLyricRenderer';
import { InspirationMapRenderer } from '@/components/questions/types/InspirationMapRenderer';
import { LifeTriviaRenderer } from '@/components/questions/types/LifeTriviaRenderer';
import { LongestSongRenderer } from '@/components/questions/types/LongestSongRenderer';
import { LyricMashupRenderer } from '@/components/questions/types/LyricMashupRenderer';
import { MoodMatchRenderer } from '@/components/questions/types/MoodMatchRenderer';
import { OddOneOutRenderer } from '@/components/questions/types/OddOneOutRenderer';
import { OneSecondRenderer } from '@/components/questions/types/OneSecondRenderer';
import { OutfitEraRenderer } from '@/components/questions/types/OutfitEraRenderer';
import { PopularityMatchRenderer } from '@/components/questions/types/PopularityMatchRenderer';
import { ReverseAudioRenderer } from '@/components/questions/types/ReverseAudioRenderer';
import { SongAlbumMatchRenderer } from '@/components/questions/types/SongAlbumMatchRenderer';
import { SoundAlikeSnippetRenderer } from '@/components/questions/types/SoundAlikeSnippetRenderer';
import { SpeedTapRenderer } from '@/components/questions/types/SpeedTapRenderer';
import { TimelineOrderRenderer } from '@/components/questions/types/TimelineOrderRenderer';
import { TracklistOrderRenderer } from '@/components/questions/types/TracklistOrderRenderer';

interface QuizDetailsModalProps {
  quiz: DailyQuiz | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (quiz: DailyQuiz) => void;
}

export default function QuizDetailsModal({
  quiz,
  isOpen,
  onClose,
  onEdit,
}: QuizDetailsModalProps) {
  const [detailedQuiz, setDetailedQuiz] = useState<DailyQuiz | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && quiz?.id) {
      loadQuizDetails();
    }
  }, [isOpen, quiz?.id]);

  const loadQuizDetails = async () => {
    if (!quiz?.id) return;
    
    setLoading(true);
    try {
      const response = await adminDailyQuizService.getQuizDetails(quiz.id);
      setDetailedQuiz(response.data);
    } catch (error) {
      console.error('Failed to load quiz details:', error);
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const canEdit = detailedQuiz?.status !== 'dropped';

  // Function to render the appropriate question component based on question type
  const renderQuestion = (question: QuizQuestion) => {
    // Generate default choices if they are null/undefined
    const getChoices = () => {
      if (question.choices || question.choicesJSON) {
        return question.choices || question.choicesJSON;
      }
      
      // For questions without choices, provide empty array or generate default based on type
      const normalizedType = question.questionType?.replace(/_/g, '-');
      
      if (normalizedType === 'album-year-guess') {
        // Generate sample year choices for album year guess questions
        const currentYear = new Date().getFullYear();
        return [
          String(currentYear - 1),
          String(currentYear - 2),
          String(currentYear - 3),
          String(currentYear - 4)
        ];
      }
      
      return [];
    };

    // Convert API question format to component format
    const questionProps = {
      id: question.id,
      difficulty: question.difficulty,
      themes: question.themes,
      subjects: question.subjects || [],
      prompt: question.prompt,
      choices: getChoices(),
      correct: question.correct || question.correctJSON,
      mediaRefs: question.mediaRefs || question.mediaJSON,
      questionType: question.questionType,
      scoringHints: question.scoringHints || {},
      orderIndex: 0,
    };

    // Convert underscore question types to hyphenated format that renderers expect
    const normalizedType = question.questionType?.replace(/_/g, '-');

    switch (normalizedType) {
      case 'ai-visual':
        return <AiVisualRenderer question={questionProps} showAnswer={true} />;
      case 'album-year-guess':
        return <AlbumYearGuessRenderer question={questionProps} />;
      case 'fill-blank':
        return <FillBlankRenderer question={questionProps} />;
      case 'guess-by-lyric':
        return <GuessByLyricRenderer question={questionProps} />;
      case 'inspiration-map':
        return <InspirationMapRenderer question={questionProps} />;
      case 'life-trivia':
        return <LifeTriviaRenderer question={questionProps} />;
      case 'longest-song':
        return <LongestSongRenderer question={questionProps} />;
      case 'lyric-mashup':
        return <LyricMashupRenderer question={questionProps} />;
      case 'mood-match':
        return <MoodMatchRenderer question={questionProps} />;
      case 'odd-one-out':
        return <OddOneOutRenderer question={questionProps} />;
      case 'one-second':
        return <OneSecondRenderer question={questionProps} />;
      case 'outfit-era':
        return <OutfitEraRenderer question={questionProps} />;
      case 'popularity-match':
        return <PopularityMatchRenderer question={questionProps} />;
      case 'reverse-audio':
        return <ReverseAudioRenderer question={questionProps} />;
      case 'song-album-match':
        return <SongAlbumMatchRenderer question={questionProps} />;
      case 'sound-alike-snippet':
        return <SoundAlikeSnippetRenderer question={questionProps} />;
      case 'speed-tap':
        return <SpeedTapRenderer question={questionProps} />;
      case 'timeline-order':
        return <TimelineOrderRenderer question={questionProps} />;
      case 'tracklist-order':
        return <TracklistOrderRenderer question={questionProps} />;
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Unsupported Question Type:</strong> {question.questionType || 'Unknown'} (normalized: {normalizedType})
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              Task: {question.prompt?.task || 'No task available'}
            </p>
            <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(question, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Quiz Details</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(detailedQuiz?.status || quiz.status)}`}>
              {(detailedQuiz?.status || quiz.status).toUpperCase()}
            </span>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading quiz details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">Quiz ID:</span>
                    <span className="font-mono text-sm">{detailedQuiz?.id || quiz.id}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created:</span>
                    <span>{detailedQuiz?.createdAt ? formatDateTime(detailedQuiz.createdAt) : 'N/A'}</span>
                  </div>
                  
                  {detailedQuiz?.dropAtUTC && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Drop Time:</span>
                      <span>{formatDateTime(detailedQuiz.dropAtUTC)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Mode:</span>
                    <span className="capitalize">{detailedQuiz?.mode || quiz.mode}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Questions:</span>
                    <span>{detailedQuiz?.questionCount || quiz.questionCount || 5}</span>
                  </div>
                  
                  {detailedQuiz?.templateUrl && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span className="font-medium">Template:</span>
                      <a 
                        href={detailedQuiz.templateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        View CDN Template
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions */}
              {detailedQuiz?.questions && detailedQuiz.questions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Questions</h3>
                  <div className="space-y-6">
                    {detailedQuiz.questions.map((question: any, index: number) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Question Header */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                Q{index + 1}
                              </span>
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
                          {question.themes && question.themes.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {question.themes.map((theme: string) => (
                                <span key={theme} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                  {theme}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Question Content */}
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {detailedQuiz?.updatedAt && (
              <>Last updated: {formatDateTime(detailedQuiz.updatedAt)}</>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            {canEdit && (
              <button
                onClick={() => {
                  onEdit(detailedQuiz || quiz);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}