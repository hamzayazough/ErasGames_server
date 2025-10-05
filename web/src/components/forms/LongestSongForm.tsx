'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface LongestSongFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  context?: string;
  choices: (string | { text: string; duration?: number })[];
  correctAnswer: number;
  hint?: string;
}

export default function LongestSongForm({ onSubmit, isSubmitting }: LongestSongFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.EASY,
    themes: ['duration'],
    subjects: ['songs'],
    task: 'Which of these songs is the longest?',
    choices: ['', '', '', ''],
    correctAnswer: 0,
    hint: ''
  });

  // Popular Taylor Swift song duration comparisons
  const durationPresets = {
    'Red Album Songs': {
      task: 'Which of these songs is the longest?',
      context: 'From the Red album',
      choices: [
        { text: 'All Too Well (10 Minute Version)', duration: 630 },
        { text: 'State of Grace', duration: 295 },
        { text: 'Holy Ground', duration: 203 },
        { text: 'Begin Again', duration: 239 }
      ],
      correctAnswer: 0
    },
    'Popular Hits': {
      task: 'Which of these popular songs has the longest duration?',
      context: 'Taylor Swift hits',
      choices: [
        { text: 'Love Story', duration: 235 },
        { text: 'All Too Well', duration: 329 },
        { text: 'Shake It Off', duration: 219 },
        { text: 'Anti-Hero', duration: 201 }
      ],
      correctAnswer: 1
    },
    'Folklore Era': {
      task: 'Which folklore/evermore song is the longest?',
      context: 'From the sister albums',
      choices: [
        { text: 'cardigan', duration: 239 },
        { text: 'the last great american dynasty', duration: 227 },
        { text: 'august', duration: 261 },
        { text: 'hoax', duration: 226 }
      ],
      correctAnswer: 2
    },
    'Midnights Collection': {
      task: 'Which Midnights track has the longest runtime?',
      context: 'From the Midnights album',
      choices: [
        { text: 'Lavender Haze', duration: 202 },
        { text: 'Anti-Hero', duration: 201 },
        { text: 'Midnight Rain', duration: 174 },
        { text: 'Question...?', duration: 210 }
      ],
      correctAnswer: 3
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'songs', 'duration', 'length', 'comparison', 'statistics'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (formData.choices.some(choice => {
      if (typeof choice === 'string') return !choice.trim();
      return !choice.text || !choice.text.trim();
    })) {
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
      questionType: 'longest-song',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        context: formData.context || undefined
      },
      choices: formData.choices.map((choice, index) => {
        if (typeof choice === 'object') {
          return {
            id: (index + 1).toString(),
            text: choice.text,
            duration: choice.duration
          };
        }
        return {
          id: (index + 1).toString(),
          text: choice
        };
      }),
      correct: {
        index: formData.correctAnswer
      },
      hint: formData.hint || undefined
    };

    onSubmit(questionData);
  };

  const updateChoice = (index: number, text: string, duration?: number) => {
    const newChoices = [...formData.choices];
    if (duration !== undefined) {
      newChoices[index] = { text, duration };
    } else {
      newChoices[index] = text;
    }
    setFormData({ ...formData, choices: newChoices });
  };

  const addSubject = () => {
    const subject = 'songs';
    if (!formData.subjects.includes(subject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subject]
      });
    }
  };

  const addCustomSubject = () => {
    const customSubject = prompt('Enter a custom subject:');
    if (customSubject && customSubject.trim() && !formData.subjects.includes(customSubject.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, customSubject.trim()]
      });
    }
  };

  const removeSubject = (index: number) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const toggleTheme = (theme: string) => {
    const newThemes = formData.themes.includes(theme)
      ? formData.themes.filter(t => t !== theme)
      : [...formData.themes, theme];
    setFormData({ ...formData, themes: newThemes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Longest Song Question</h2>

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
          placeholder="e.g., Which of these songs is the longest?"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        <div className="mt-2">
          <label className="block text-xs font-medium mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(durationPresets).map(([name, preset]) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  task: preset.task,
                  context: preset.context,
                  choices: [...preset.choices],
                  correctAnswer: preset.correctAnswer
                })}
                className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs hover:bg-indigo-200"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Context (Optional)</label>
        <input
          type="text"
          value={formData.context || ''}
          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          placeholder="e.g., From the Red album"
          className="w-full p-2 border rounded"
        />
        <p className="text-sm text-gray-500 mt-1">Additional context about the song selection</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Song Choices</label>
        <p className="text-sm text-gray-600 mb-3">
          Enter song names and optionally their durations. Mark the longest one as the correct answer.
        </p>
        <div className="space-y-3">
          {formData.choices.map((choice, index) => {
            const choiceText = typeof choice === 'string' ? choice : choice.text || '';
            const duration = typeof choice === 'object' ? choice.duration : undefined;
            
            return (
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
                  value={choiceText}
                  onChange={(e) => updateChoice(index, e.target.value, duration)}
                  placeholder={`Song ${index + 1} ${index === formData.correctAnswer ? '(longest)' : ''}`}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.choices ? 'border-red-500' : ''}`}
                />
                <input
                  type="number"
                  value={duration || ''}
                  onChange={(e) => updateChoice(index, choiceText, e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Seconds"
                  className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">sec</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Click the circle button to mark the longest song. Duration is optional but helpful for accuracy.
        </p>
        {errors.choices && <p className="text-red-500 text-sm mt-1">{errors.choices}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Themes</label>
        <div className="flex flex-wrap gap-2">
          {availableThemes.map(theme => (
            <button
              key={theme}
              type="button"
              onClick={() => toggleTheme(theme)}
              className={`px-3 py-1 rounded text-sm ${
                formData.themes.includes(theme)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Subjects</label>
        <div className="space-y-2">
          {formData.subjects.map((subject, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-1 rounded text-sm">{subject}</span>
              <button
                type="button"
                onClick={() => removeSubject(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addSubject}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Add Songs Subject
            </button>
            <button
              type="button"
              onClick={addCustomSubject}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Add Custom Subject
            </button>
          </div>
        </div>
        {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
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