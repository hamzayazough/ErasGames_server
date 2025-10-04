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
    { value: 'inspiration-map', label: 'Inspiration Map', description: 'Player identifies who/what inspired a song' }
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

  const testQuestionCreation = async (questionType: string) => {
    const testData = getTestQuestionData(questionType);
    await handleSubmit(testData);
  };

  const getTestQuestionData = (questionType: string) => {
    switch (questionType) {
      case 'album-year-guess':
        return {
          questionType: 'album-year-guess',
          difficulty: 'easy',
          themes: ['timeline'],
          subjects: ['album:folklore'],
          prompt: {
            task: 'What year was the album "folklore" released?',
            album: 'folklore',
          },
          choices: [
            {id: 'choice1', text: '2019'},
            {id: 'choice2', text: '2020'},
            {id: 'choice3', text: '2021'},
            {id: 'choice4', text: '2022'},
          ],
          correct: {
            choiceIndex: 1
          }
        };
      
      case 'song-album-match':
        return {
          questionType: 'song-album-match',
          difficulty: 'medium',
          themes: ['albums'],
          subjects: ['albums'],
          prompt: {
            task: 'Match each song to its correct album',
            left: ['cardigan', 'Anti-Hero', 'Shake It Off'],
            right: ['folklore', 'Midnights', '1989', 'Lover'],
          },
          correct: {
            matches: {
              'cardigan': 'folklore',
              'Anti-Hero': 'Midnights',
              'Shake It Off': '1989'
            }
          }
        };
      
      case 'fill-blank':
        return {
          questionType: 'fill-blank',
          difficulty: 'easy',
          themes: ['lyrics'],
          subjects: ['song:blank-space'],
          prompt: {
            task: 'Complete the lyric from "Blank Space"',
            text: "I've got a blank space baby, and I'll _______",
            song: 'Blank Space'
          },
          choices: [
            {id: 'choice1', text: 'write your name'},
            {id: 'choice2', text: 'sing your song'},
            {id: 'choice3', text: 'dance all night'},
            {id: 'choice4', text: 'call you mine'},
          ],
          correct: {
            choiceIndex: 0
          }
        };
      
      case 'guess-by-lyric':
        return {
          questionType: 'guess-by-lyric',
          difficulty: 'easy',
          themes: ['lyrics'],
          subjects: ['song:love-story'],
          prompt: {
            task: 'Which song contains this lyric?',
            lyric: 'Romeo, take me somewhere we can be alone'
          },
          choices: [
            {id: 'choice1', text: 'Love Story'},
            {id: 'choice2', text: 'You Belong With Me'},
            {id: 'choice3', text: 'White Horse'},
            {id: 'choice4', text: 'Teardrops On My Guitar'},
          ],
          correct: {
            choiceIndex: 0
          }
        };
      
      case 'odd-one-out':
        return {
          questionType: 'odd-one-out',
          difficulty: 'medium',
          themes: ['eras'],
          subjects: ['albums'],
          prompt: {
            task: "Which album doesn't belong with the others?",
            setRule: 'Albums from the 2010s'
          },
          choices: [
            {id: 'choice1', text: 'Lover'},
            {id: 'choice2', text: 'folklore'},
            {id: 'choice3', text: '1989'},
            {id: 'choice4', text: 'reputation'},
          ],
          correct: {
            choiceIndex: 1
          }
        };
      
      case 'mood-match':
        return {
          questionType: 'mood-match',
          difficulty: 'medium',
          themes: ['emotions'],
          subjects: ['songs'],
          prompt: {
            task: 'Which mood best describes the song "All Too Well"?',
            moodTags: ['emotional', 'nostalgic', 'heartbreak'],
            note: 'Consider the overall feeling and lyrics of the song'
          },
          mediaRefs: [],
          choices: ['Melancholic', 'Upbeat', 'Romantic', 'Angry'],
          correct: {
            choiceIndex: 0
          }
        };
      
      case 'inspiration-map':
        return {
          questionType: 'inspiration-map',
          difficulty: 'easy',
          themes: ['influences'],
          subjects: ['songs'],
          prompt: {
            task: 'Who is widely believed to have inspired the song "All Too Well"?',
            disclaimer: 'Based on fan interpretations and media reports, not officially confirmed.'
          },
          choices: ['Joe Jonas', 'Jake Gyllenhaal', 'Harry Styles', 'John Mayer'],
          correct: 1
        };
      
      default:
        return {};
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

        {/* Quick Test Actions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Test</h2>
          <p className="text-sm text-gray-600 mb-4">
            Test question creation with pre-filled examples from the quiz mocks
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => testQuestionCreation('album-year-guess')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Test Album Year Guess
            </button>
            <button
              onClick={() => testQuestionCreation('song-album-match')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Test Song Album Match
            </button>
            <button
              onClick={() => testQuestionCreation('fill-blank')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Test Fill Blank
            </button>
            <button
              onClick={() => testQuestionCreation('guess-by-lyric')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              Test Guess by Lyric
            </button>
            <button
              onClick={() => testQuestionCreation('odd-one-out')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Test Odd One Out
            </button>
            <button
              onClick={() => testQuestionCreation('mood-match')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              Test Mood Match
            </button>
            <button
              onClick={() => testQuestionCreation('inspiration-map')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Test Inspiration Map
            </button>
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