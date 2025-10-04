'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface OddOneOutFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  setRule: string;
  choices: string[];
  correctAnswer: number;
}

export default function OddOneOutForm({ onSubmit, isSubmitting }: OddOneOutFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.MEDIUM,
    themes: [],
    subjects: [],
    task: "Which item doesn't belong with the others?",
    setRule: '',
    choices: ['', '', '', ''],
    correctAnswer: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'eras', 'albums', 'songs', 'timeline', 'categories', 'analysis'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (!formData.setRule.trim()) {
      newErrors.setRule = 'Set rule is required';
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
      questionType: 'odd-one-out',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        setRule: formData.setRule
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

  const addSubject = (subjectType: string) => {
    if (!formData.subjects.includes(subjectType)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subjectType]
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
      <h2 className="text-2xl font-bold mb-6">Odd One Out Question</h2>

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
          placeholder="e.g., Which album doesn't belong with the others?"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Set Rule</label>
        <input
          type="text"
          value={formData.setRule}
          onChange={(e) => setFormData({ ...formData, setRule: e.target.value })}
          placeholder="e.g., Albums from the 2010s"
          className={`w-full p-2 border rounded ${errors.setRule ? 'border-red-500' : ''}`}
        />
        <p className="text-sm text-gray-600 mt-1">Explain what the majority of items have in common</p>
        {errors.setRule && <p className="text-red-500 text-sm mt-1">{errors.setRule}</p>}
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
                placeholder={`Choice ${index + 1} ${index === formData.correctAnswer ? '(odd one out)' : ''}`}
                className={`flex-1 p-2 border rounded ${errors.choices ? 'border-red-500' : ''}`}
              />
            </div>
          </div>
        ))}
        <p className="text-sm text-gray-600 mt-1">Select which choice is the odd one out (doesn't follow the set rule)</p>
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
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => addSubject('albums')}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Albums
            </button>
            <button
              type="button"
              onClick={() => addSubject('songs')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Songs
            </button>
            <button
              type="button"
              onClick={() => addSubject('eras')}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Eras
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Custom subject"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const subject = e.currentTarget.value.trim();
                    if (subject) {
                      addSubject(subject);
                      e.currentTarget.value = '';
                    }
                  }
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const subject = input.value.trim();
                  if (subject) {
                    addSubject(subject);
                    input.value = '';
                  }
                }}
                className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Add
              </button>
            </div>
          </div>
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