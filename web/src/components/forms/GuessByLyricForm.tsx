'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface GuessByLyricFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  lyric: string;
  choices: string[];
  correctAnswer: number;
}

export default function GuessByLyricForm({ onSubmit, isSubmitting }: GuessByLyricFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.EASY,
    themes: [],
    subjects: [],
    task: 'Which song contains this lyric?',
    lyric: '',
    choices: ['', '', '', ''],
    correctAnswer: 0
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

    if (!formData.lyric.trim()) {
      newErrors.lyric = 'Lyric is required';
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
      questionType: 'guess-by-lyric',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        lyric: formData.lyric
      },
      choices: formData.choices.map((text, index) => ({
        id: `${index + 1}`,
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
    const correctSong = formData.choices[formData.correctAnswer];
    if (correctSong.trim()) {
      const subject = `song:${correctSong.toLowerCase().replace(/\s+/g, '-')}`;
      if (!formData.subjects.includes(subject)) {
        setFormData({
          ...formData,
          subjects: [...formData.subjects, subject]
        });
      }
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
      <h2 className="text-2xl font-bold mb-6">Guess by Lyric Question</h2>

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
          placeholder="e.g., Which song contains this lyric?"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Lyric</label>
        <textarea
          value={formData.lyric}
          onChange={(e) => setFormData({ ...formData, lyric: e.target.value })}
          placeholder="Enter the lyric excerpt..."
          rows={3}
          className={`w-full p-2 border rounded ${errors.lyric ? 'border-red-500' : ''}`}
        />
        {errors.lyric && <p className="text-red-500 text-sm mt-1">{errors.lyric}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Answer Choices</label>
        {formData.choices.map((choice, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={formData.correctAnswer === index}
                onChange={() => setFormData({ ...formData, correctAnswer: index })}
                className="mr-2"
              />
              <input
                type="text"
                value={choice}
                onChange={(e) => updateChoice(index, e.target.value)}
                placeholder={`Choice ${index + 1} (song name)`}
                className={`flex-1 p-2 border rounded ${errors.choices ? 'border-red-500' : ''}`}
              />
            </div>
          </div>
        ))}
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
          <button
            type="button"
            onClick={addSubject}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Add Subject (from correct answer)
          </button>
        </div>
        {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
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