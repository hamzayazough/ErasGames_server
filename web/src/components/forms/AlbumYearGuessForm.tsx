'use client';

import { useState, useEffect } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface AlbumYearGuessFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  album: string;
  task: string;
  choices: string[];
  correctAnswer: number;
}

export default function AlbumYearGuessForm({ onSubmit, isSubmitting }: AlbumYearGuessFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.EASY,
    themes: [],
    subjects: [],
    album: '',
    task: '',
    choices: ['', '', '', ''],
    correctAnswer: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'timeline', 'albums', 'eras', 'biography', 'awards', 'collaborations'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.album.trim()) {
      newErrors.album = 'Album name is required';
    }

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
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
      questionType: 'album-year-guess',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        album: formData.album
      },
      choices: formData.choices.map((text, index) => ({
        id: `choice${index + 1}`,
        text
      })),
      correct: {
        index: formData.correctAnswer
      }
    };

    onSubmit(questionData);
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData({ ...formData, choices: newChoices });
  };

  const addSubject = () => {
    const subject = `album:${formData.album.toLowerCase().replace(/\s+/g, '-')}`;
    if (!formData.subjects.includes(subject) && formData.album.trim()) {
      setFormData({ 
        ...formData, 
        subjects: [...formData.subjects, subject]
      });
    }
  };

  // Auto-add album subject when album changes
  useEffect(() => {
    if (formData.album.trim() && formData.subjects.length === 0) {
      const subject = `album:${formData.album.toLowerCase().replace(/\s+/g, '-')}`;
      setFormData(prev => ({ 
        ...prev, 
        subjects: [subject]
      }));
    }
  }, [formData.album]);

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
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={Difficulty.EASY}>Easy</option>
            <option value={Difficulty.MEDIUM}>Medium</option>
            <option value={Difficulty.HARD}>Hard</option>
          </select>
        </div>

        {/* Album */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Album Name
          </label>
          <input
            type="text"
            value={formData.album}
            onChange={(e) => setFormData({ ...formData, album: e.target.value })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.album ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., folklore"
          />
          {errors.album && <p className="mt-1 text-sm text-red-600">{errors.album}</p>}
        </div>
      </div>

      {/* Task Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Task
        </label>
        <input
          type="text"
          value={formData.task}
          onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.task ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={`What year was the album "${formData.album}" released?`}
        />
        {errors.task && <p className="mt-1 text-sm text-red-600">{errors.task}</p>}
      </div>

      {/* Themes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Themes
        </label>
        <div className="flex flex-wrap gap-2">
          {availableThemes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => toggleTheme(theme)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                formData.themes.includes(theme)
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              } border`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subjects
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.subjects.map((subject, index) => (
            <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
              <span className="text-sm">{subject}</span>
              <button
                type="button"
                onClick={() => removeSubject(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSubject}
          disabled={!formData.album}
          className="text-blue-600 hover:text-blue-800 text-sm underline disabled:text-gray-400"
        >
          + Add album subject (auto-generated from album name)
        </button>
        {errors.subjects && <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>}
      </div>

      {/* Answer Choices */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Choices (years)
        </label>
        <div className="grid grid-cols-2 gap-4">
          {formData.choices.map((choice, index) => (
            <div key={index}>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === index}
                  onChange={() => setFormData({ ...formData, correctAnswer: index })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Choice ${index + 1} (e.g., 2020)`}
                />
              </div>
            </div>
          ))}
        </div>
        {errors.choices && <p className="mt-1 text-sm text-red-600">{errors.choices}</p>}
      </div>



      {/* Submit Button */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Question'}
        </button>
      </div>
    </form>
  );
}