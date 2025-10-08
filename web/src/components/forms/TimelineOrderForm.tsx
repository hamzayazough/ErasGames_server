'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface TimelineOrderFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  items: string[];
}

export default function TimelineOrderForm({ onSubmit, isSubmitting }: TimelineOrderFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.HARD,
    themes: [],
    subjects: [],
    task: 'Arrange these albums in chronological release order',
    items: ['', '', '', '']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'timeline', 'chronology', 'albums', 'eras', 'history', 'order'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (formData.items.length < 3 || formData.items.some(item => !item.trim())) {
      newErrors.items = 'At least 3 items are required and all must be filled';
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
      questionType: 'timeline-order',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        items: formData.items.filter(item => item.trim())
      }
    };

    onSubmit(questionData);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, ''] });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
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
      <h2 className="text-2xl font-bold mb-6">Timeline Order Question</h2>

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
          placeholder="e.g., Arrange these albums in chronological release order"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Items to Order</label>
        {formData.items.map((item, index) => (
          <div key={index} className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1} (e.g., album, song, event)`}
              className={`flex-1 p-2 border rounded ${errors.items ? 'border-red-500' : ''}`}
            />
            {formData.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Add Item
        </button>
        {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
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
              onClick={() => addSubject('events')}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Events
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