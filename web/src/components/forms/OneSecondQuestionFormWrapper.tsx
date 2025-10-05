'use client';

import { useState } from 'react';
import { Difficulty } from '@/lib/types/enums/question.enums';
import MediaUpload from '@/components/ui/MediaUpload';

interface OneSecondQuestionFormWrapperProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  audioUrl: string;
  choices: string[];
  correctAnswer: number;
  hint?: string;
}

export default function OneSecondQuestionFormWrapper({ onSubmit, isSubmitting }: OneSecondQuestionFormWrapperProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.HARD,
    themes: ['audio', 'speed'],
    subjects: ['songs'],
    task: 'Identify the song from this 1-second audio clip',
    audioUrl: '',
    choices: ['', '', '', ''],
    correctAnswer: 0,
    hint: ''
  });

  // Popular Taylor Swift one-second challenge presets
  const oneSecondPresets = {
    'Red Era Hits': {
      task: 'Identify the song from this 1-second audio clip',
      choices: [
        'We Are Never Getting Back Together',
        'I Knew You Were Trouble',
        '22',
        'Everything Has Changed'
      ],
      correctAnswer: 0
    },
    'folklore Favorites': {
      task: 'Which folklore song is this 1-second clip from?',
      choices: [
        'cardigan',
        'the 1',
        'august', 
        'exile'
      ],
      correctAnswer: 0
    },
    'Midnights Mayhem': {
      task: 'Name this Midnights track from just 1 second',
      choices: [
        'Anti-Hero',
        'Lavender Haze',
        'Midnight Rain',
        'Bejeweled'
      ],
      correctAnswer: 0
    },
    '1989 Classics': {
      task: 'Identify this iconic 1989 song in 1 second',
      choices: [
        'Shake It Off',
        'Blank Space',
        'Style',
        'Bad Blood'
      ],
      correctAnswer: 0
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (!formData.audioUrl.trim()) {
      newErrors.audioUrl = 'Audio file is required';
    }

    if (formData.choices.some(choice => !choice.trim())) {
      newErrors.choices = 'All answer choices must be filled';
    }

    if (formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const questionData = {
      questionType: 'one-second',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task
      },
      mediaRefs: [{
        type: 'audio',
        url: formData.audioUrl
      }],
      choices: formData.choices,
      correct: formData.correctAnswer,
      hint: formData.hint || undefined
    };

    onSubmit(questionData);
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData({ ...formData, choices: newChoices });
  };

  const handleAudioUpload = (uploadData: { url: string; filename: string; size: number }) => {
    setFormData({ ...formData, audioUrl: uploadData.url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">One Second Challenge Question</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Difficulty</label>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
          className="w-full p-2 border rounded"
        >
          <option value={Difficulty.EASY}>Easy</option>
          <option value={Difficulty.MEDIUM}>Medium</option>
          <option value={Difficulty.HARD}>Hard</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Task Description</label>
        <input
          type="text"
          value={formData.task}
          onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          placeholder="e.g., Identify the song from this 1-second audio clip"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        <div className="mt-2">
          <label className="block text-xs font-medium mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(oneSecondPresets).map(([name, preset]) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  task: preset.task,
                  choices: [...preset.choices],
                  correctAnswer: preset.correctAnswer
                })}
                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">1-Second Audio Clip</label>
        {formData.audioUrl ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm text-green-700">Audio uploaded</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, audioUrl: '' })}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <audio controls className="w-full max-w-md">
              <source src={formData.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : (
          <MediaUpload
            type="audio"
            onUploadSuccess={handleAudioUpload}
            onError={(error) => setErrors({ ...errors, audioUrl: error })}
            className="w-full"
          />
        )}
        {errors.audioUrl && <p className="text-red-500 text-sm mt-1">{errors.audioUrl}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Answer Choices</label>
        <div className="space-y-3">
          {formData.choices.map((choice, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, correctAnswer: index })}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  formData.correctAnswer === index
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {formData.correctAnswer === index && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">{String.fromCharCode(65 + index)}</span>
              </div>
              <input
                type="text"
                value={choice}
                onChange={(e) => updateChoice(index, e.target.value)}
                placeholder={`Song option ${index + 1}`}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.choices ? 'border-red-500' : ''}`}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Click the circle button to select the correct answer
        </p>
        {errors.choices && <p className="text-red-500 text-sm mt-1">{errors.choices}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hint (Optional)</label>
        <input
          type="text"
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          placeholder="Optional hint for the question"
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Question'}
      </button>
    </form>
  );
}