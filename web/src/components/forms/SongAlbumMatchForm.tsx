'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface SongAlbumMatchFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  leftItems: string[];
  rightItems: string[];
  correctMatches: Record<string, string>;
  hint?: string;
}

export default function SongAlbumMatchForm({ onSubmit, isSubmitting }: SongAlbumMatchFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.MEDIUM,
    themes: [],
    subjects: [],
    task: '',
    leftItems: [''],
    rightItems: [''],
    correctMatches: {},
    hint: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'albums', 'songs', 'eras', 'discography', 'timeline'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (formData.leftItems.some(item => !item.trim())) {
      newErrors.leftItems = 'All songs must be filled';
    }

    if (formData.rightItems.some(item => !item.trim())) {
      newErrors.rightItems = 'All albums must be filled';
    }

    // Check if all left items have matches
    const leftItemsWithValues = formData.leftItems.filter(item => item.trim());
    const matchCount = Object.keys(formData.correctMatches).length;
    if (matchCount < leftItemsWithValues.length) {
      newErrors.correctMatches = 'All songs must be matched to albums';
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
      questionType: 'song-album-match',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        left: formData.leftItems.filter(item => item.trim()),
        right: formData.rightItems.filter(item => item.trim())
      },
      correct: {
        matches: formData.correctMatches
      },
      hint: formData.hint || undefined
    };

    onSubmit(questionData);
  };

  const updateLeftItem = (index: number, value: string) => {
    const newLeftItems = [...formData.leftItems];
    const oldValue = newLeftItems[index];
    newLeftItems[index] = value;
    
    // Update matches if the key changed
    const newMatches = { ...formData.correctMatches };
    if (oldValue && newMatches[oldValue]) {
      delete newMatches[oldValue];
      if (value) {
        newMatches[value] = formData.correctMatches[oldValue];
      }
    }
    
    setFormData({ 
      ...formData, 
      leftItems: newLeftItems,
      correctMatches: newMatches
    });
  };

  const updateRightItem = (index: number, value: string) => {
    const newRightItems = [...formData.rightItems];
    newRightItems[index] = value;
    setFormData({ ...formData, rightItems: newRightItems });
  };

  const addLeftItem = () => {
    setFormData({ 
      ...formData, 
      leftItems: [...formData.leftItems, '']
    });
  };

  const addRightItem = () => {
    setFormData({ 
      ...formData, 
      rightItems: [...formData.rightItems, '']
    });
  };

  const removeLeftItem = (index: number) => {
    const newLeftItems = formData.leftItems.filter((_, i) => i !== index);
    const removedItem = formData.leftItems[index];
    const newMatches = { ...formData.correctMatches };
    if (removedItem && newMatches[removedItem]) {
      delete newMatches[removedItem];
    }
    setFormData({ 
      ...formData, 
      leftItems: newLeftItems,
      correctMatches: newMatches
    });
  };

  const removeRightItem = (index: number) => {
    const newRightItems = formData.rightItems.filter((_, i) => i !== index);
    setFormData({ ...formData, rightItems: newRightItems });
  };

  const setMatch = (leftItem: string, rightItem: string) => {
    const newMatches = { ...formData.correctMatches };
    newMatches[leftItem] = rightItem;
    setFormData({ ...formData, correctMatches: newMatches });
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
            placeholder="Match each song to its correct album"
          />
          {errors.task && <p className="mt-1 text-sm text-red-600">{errors.task}</p>}
        </div>
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

      {/* Songs and Albums */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Songs (Left Items) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Songs
          </label>
          <div className="space-y-2">
            {formData.leftItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateLeftItem(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Song ${index + 1}`}
                />
                {formData.leftItems.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removeLeftItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLeftItem}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            + Add Song
          </button>
          {errors.leftItems && <p className="mt-1 text-sm text-red-600">{errors.leftItems}</p>}
        </div>

        {/* Albums (Right Items) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Albums
          </label>
          <div className="space-y-2">
            {formData.rightItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateRightItem(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Album ${index + 1}`}
                />
                {formData.rightItems.length > 4 && (
                  <button
                    type="button"
                    onClick={() => removeRightItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRightItem}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            + Add Album
          </button>
          {errors.rightItems && <p className="mt-1 text-sm text-red-600">{errors.rightItems}</p>}
        </div>
      </div>

      {/* Correct Matches */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Matches
        </label>
        <div className="bg-gray-50 rounded-lg p-4">
          {formData.leftItems
            .filter(item => item.trim())
            .map((leftItem, index) => (
              <div key={index} className="flex items-center space-x-4 mb-2">
                <span className="w-1/3 text-sm font-medium">{leftItem}</span>
                <span className="text-gray-500">→</span>
                <select
                  value={formData.correctMatches[leftItem] || ''}
                  onChange={(e) => setMatch(leftItem, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select album...</option>
                  {formData.rightItems
                    .filter(item => item.trim())
                    .map((rightItem, rightIndex) => (
                      <option key={rightIndex} value={rightItem}>
                        {rightItem}
                      </option>
                    ))}
                </select>
              </div>
            ))}
        </div>
        {errors.correctMatches && <p className="mt-1 text-sm text-red-600">{errors.correctMatches}</p>}
      </div>

      {/* Hint (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hint (Optional)
        </label>
        <textarea
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional hint to help players..."
        />
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