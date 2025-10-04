'use client';

import { useState, useEffect } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface FillBlankFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  text: string;
  song?: string;
  choices: string[];
  correctAnswer: number;
  hint?: string;
}

export default function FillBlankForm({ onSubmit, isSubmitting }: FillBlankFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.EASY,
    themes: [],
    subjects: [],
    task: '',
    text: '',
    song: '',
    choices: ['', '', '', ''],
    correctAnswer: 0,
    hint: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'lyrics', 'songs', 'albums', 'eras', 'quotes'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (!formData.text.trim()) {
      newErrors.text = 'Text with blank is required';
    }

    if (!formData.text.includes('_')) {
      newErrors.text = 'Text must contain at least one underscore (_) for the blank';
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
      questionType: 'fill-blank',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        text: formData.text,
        song: formData.song || undefined
      },
      choices: formData.choices.map((text, index) => ({
        id: `choice${index + 1}`,
        text
      })),
      correct: {
        choiceIndex: formData.correctAnswer
      },
      hint: formData.hint || undefined
    };

    onSubmit(questionData);
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData({ ...formData, choices: newChoices });
  };

  const addSubject = () => {
    if (formData.song && formData.song.trim()) {
      const subject = `song:${formData.song.toLowerCase().replace(/\s+/g, '-')}`;
      if (!formData.subjects.includes(subject)) {
        setFormData({ 
          ...formData, 
          subjects: [...formData.subjects, subject]
        });
      }
    }
  };

  // Auto-add song subject when song changes
  useEffect(() => {
    if (formData.song && formData.song.trim() && formData.subjects.length === 0) {
      const subject = `song:${formData.song.toLowerCase().replace(/\s+/g, '-')}`;
      setFormData(prev => ({ 
        ...prev, 
        subjects: [subject]
      }));
    }
  }, [formData.song]);

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

        {/* Song (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Song Name (Optional)
          </label>
          <input
            type="text"
            value={formData.song || ''}
            onChange={(e) => setFormData({ ...formData, song: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Blank Space"
          />
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
          placeholder={formData.song ? `Complete the lyric from "${formData.song}"` : 'Complete the lyric'}
        />
        {errors.task && <p className="mt-1 text-sm text-red-600">{errors.task}</p>}
      </div>

      {/* Text with Blank */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text with Blank
        </label>
        <textarea
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          rows={3}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.text ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="I've got a blank space baby, and I'll _______"
        />
        <p className="mt-1 text-sm text-gray-500">
          Use underscores (_) to mark where the blank should be. You can use multiple underscores for longer blanks.
        </p>
        {errors.text && <p className="mt-1 text-sm text-red-600">{errors.text}</p>}
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
          disabled={!formData.song}
          className="text-blue-600 hover:text-blue-800 text-sm underline disabled:text-gray-400"
        >
          + Add song subject (auto-generated from song name)
        </button>
        {errors.subjects && <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>}
      </div>

      {/* Answer Choices */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Choices
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
                  placeholder={`Choice ${index + 1} (e.g., write your name)`}
                />
              </div>
            </div>
          ))}
        </div>
        {errors.choices && <p className="mt-1 text-sm text-red-600">{errors.choices}</p>}
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