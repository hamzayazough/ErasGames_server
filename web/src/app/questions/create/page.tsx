'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth.context';
import { questionService } from '@/lib/services/question.service';
import { QuestionType, QuestionDifficulty, QuestionTheme } from '@/lib/types/enums/question.enums';
import { AlbumYearGuessQuestion } from '@/lib/types/interfaces/questions/album-year-guess.interface';
import { SongAlbumMatchQuestion } from '@/lib/types/interfaces/questions/song-album-match.interface';
import { FillBlankQuestion } from '@/lib/types/interfaces/questions/fill-blank.interface';

// Form components for different question types
import AlbumYearGuessForm from '@/components/forms/AlbumYearGuessForm';
import SongAlbumMatchForm from '@/components/forms/SongAlbumMatchForm';
import FillBlankForm from '@/components/forms/FillBlankForm';
import GuessByLyricForm from '@/components/forms/GuessByLyricForm';
import OddOneOutForm from '@/components/forms/OddOneOutForm';
import MoodMatchForm from '@/components/forms/MoodMatchForm';
import InspirationMapForm from '@/components/forms/InspirationMapForm';
import LifeTriviaForm from '@/components/forms/LifeTriviaForm';
import TimelineOrderForm from '@/components/forms/TimelineOrderForm';
import PopularityMatchForm from '@/components/forms/PopularityMatchForm';
import LongestSongForm from '@/components/forms/LongestSongForm';
import TracklistOrderForm from '@/components/forms/TracklistOrderForm';
import LyricMashupForm from '@/components/forms/LyricMashupForm';
import SpeedTapForm from '@/components/forms/SpeedTapForm';
import AiVisualQuestionFormWrapper from '@/components/forms/AiVisualQuestionFormWrapper';
import SoundAlikeSnippetQuestionFormWrapper from '@/components/forms/SoundAlikeSnippetQuestionFormWrapper';
import OutfitEraQuestionFormWrapper from '@/components/forms/OutfitEraQuestionFormWrapper';
import ReverseAudioQuestionFormWrapper from '@/components/forms/ReverseAudioQuestionFormWrapper';
import OneSecondQuestionFormWrapper from '@/components/forms/OneSecondQuestionFormWrapper';

export default function CreateQuestionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [selectedType, setSelectedType] = useState<string>('album-year-guess');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Available question types
  const availableTypes = [
    { value: 'album-year-guess', label: 'Album Year Guess', description: 'Player guesses the release year of an album' },
    { value: 'song-album-match', label: 'Song Album Match', description: 'Player matches songs to their albums' },
    { value: 'fill-blank', label: 'Fill in the Blank', description: 'Player completes missing lyrics or text' },
    { value: 'guess-by-lyric', label: 'Guess by Lyric', description: 'Player identifies the song from a lyric excerpt' },
    { value: 'odd-one-out', label: 'Odd One Out', description: 'Player selects the item that doesn\'t belong' },
    { value: 'mood-match', label: 'Mood Match', description: 'Player matches songs to their emotional mood' },
    { value: 'inspiration-map', label: 'Inspiration Map', description: 'Player identifies who/what inspired a song' },
    { value: 'life-trivia', label: 'Life Trivia', description: 'Player answers trivia about Taylor Swift\'s life or career' },
    { value: 'timeline-order', label: 'Timeline Order', description: 'Player arranges items in chronological order' },
    { value: 'popularity-match', label: 'Popularity Match', description: 'Player orders items by popularity or ranking' },
    { value: 'longest-song', label: 'Longest Song', description: 'Player identifies the longest song from options' },
    { value: 'tracklist-order', label: 'Tracklist Order', description: 'Player arranges tracks in their album order' },
    { value: 'lyric-mashup', label: 'Lyric Mashup', description: 'Player matches lyric snippets to correct songs' },
    { value: 'speed-tap', label: 'Speed Tap', description: 'Player taps correct items as fast as possible' },
    { value: 'ai-visual', label: 'AI Visual Question', description: 'Player answers questions about images analyzed by AI' },
    { value: 'sound-alike-snippet', label: 'Sound-Alike Snippet', description: 'Player identifies words from similar-sounding audio clips' },
    { value: 'outfit-era', label: 'Outfit Era Question', description: 'Player identifies historical eras from clothing/outfit images' },
    { value: 'reverse-audio', label: 'Reverse Audio Question', description: 'Player identifies words from reversed audio clips' },
    { value: 'one-second', label: 'One Second Question', description: 'Player identifies sources from 1-second audio snippets' }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  const handleSubmit = async (questionData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      console.log('Submitting question data:', questionData);
      
      const response = await questionService.createQuestion(questionData);
      
      console.log('Question created response:', response);
      
      setSuccess('Question created successfully!');
      setTimeout(() => {
        router.push('/questions');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
      console.error('Error creating question:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderQuestionForm = () => {
    switch (selectedType) {
      case 'album-year-guess':
        return (
          <AlbumYearGuessForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'song-album-match':
        return (
          <SongAlbumMatchForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'fill-blank':
        return (
          <FillBlankForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'guess-by-lyric':
        return (
          <GuessByLyricForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'odd-one-out':
        return (
          <OddOneOutForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'mood-match':
        return (
          <MoodMatchForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'inspiration-map':
        return (
          <InspirationMapForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'life-trivia':
        return (
          <LifeTriviaForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'timeline-order':
        return (
          <TimelineOrderForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'popularity-match':
        return (
          <PopularityMatchForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'longest-song':
        return (
          <LongestSongForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'tracklist-order':
        return (
          <TracklistOrderForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'lyric-mashup':
        return (
          <LyricMashupForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'speed-tap':
        return (
          <SpeedTapForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'ai-visual':
        return (
          <AiVisualQuestionFormWrapper
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'sound-alike-snippet':
        return (
          <SoundAlikeSnippetQuestionFormWrapper
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'outfit-era':
        return (
          <OutfitEraQuestionFormWrapper
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'reverse-audio':
        return (
          <ReverseAudioQuestionFormWrapper
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'one-second':
        return (
          <OneSecondQuestionFormWrapper
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Select a question type to get started</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/questions')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Questions
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Question</h1>
          <p className="mt-2 text-gray-600">Choose a question type and fill in the details</p>
        </div>

        {/* Error/Success Messages */}
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

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Question Type Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableTypes.map((type) => (
              <div
                key={type.value}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="questionType"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <h3 className="font-medium text-gray-900">{type.label}</h3>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Question Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {availableTypes.find(t => t.value === selectedType)?.label} Details
          </h2>
          {renderQuestionForm()}
        </div>
      </div>
    </div>
  );
}