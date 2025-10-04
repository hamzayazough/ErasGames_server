'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface PopularityMatchFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  asOf: string;
  items: string[];
  correctOrder: string[];
  hint?: string;
}

export default function PopularityMatchForm({ onSubmit, isSubmitting }: PopularityMatchFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.MEDIUM,
    themes: [],
    subjects: [],
    task: '',
    asOf: '',
    items: [''],
    correctOrder: [],
    hint: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'charts', 'popularity', 'streaming', 'rankings', 'statistics', 'performance'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (!formData.asOf.trim()) {
      newErrors.asOf = 'Date reference (as of) is required';
    }

    if (formData.items.length < 3 || formData.items.some(item => !item.trim())) {
      newErrors.items = 'At least 3 items are required and all must be filled';
    }

    if (formData.correctOrder.length !== formData.items.filter(item => item.trim()).length) {
      newErrors.correctOrder = 'Please set the correct popularity order for all items';
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
      questionType: 'popularity-match',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        asOf: formData.asOf
      },
      choices: formData.items.filter(item => item.trim()).map((text, index) => ({
        id: `choice${index + 1}`,
        text
      })),
      correct: {
        values: formData.correctOrder
      },
      hint: formData.hint || undefined
    };

    onSubmit(questionData);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
    
    // Update correct order if item was changed
    if (formData.correctOrder.includes(formData.items[index])) {
      const newOrder = [...formData.correctOrder];
      const orderIndex = newOrder.indexOf(formData.items[index]);
      if (value.trim()) {
        newOrder[orderIndex] = value;
      } else {
        newOrder.splice(orderIndex, 1);
      }
      setFormData(prev => ({ ...prev, correctOrder: newOrder }));
    }
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, ''] });
  };

  const removeItem = (index: number) => {
    const itemToRemove = formData.items[index];
    const newItems = formData.items.filter((_, i) => i !== index);
    const newOrder = formData.correctOrder.filter(item => item !== itemToRemove);
    setFormData({ ...formData, items: newItems, correctOrder: newOrder });
  };

  const setCorrectOrder = () => {
    const validItems = formData.items.filter(item => item.trim());
    if (validItems.length < 2) {
      alert('Please add at least 2 items before setting the order');
      return;
    }

    const orderString = prompt(
      `Enter the correct popularity order (most popular to least popular) as numbers separated by commas.\nItems:\n${validItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nExample: 3,1,4,2`
    );

    if (orderString) {
      try {
        const orderIndexes = orderString.split(',').map(s => parseInt(s.trim()) - 1);
        if (orderIndexes.every(i => i >= 0 && i < validItems.length)) {
          const newOrder = orderIndexes.map(i => validItems[i]);
          setFormData({ ...formData, correctOrder: newOrder });
        } else {
          alert('Invalid order. Please use numbers from 1 to ' + validItems.length);
        }
      } catch {
        alert('Invalid format. Please use numbers separated by commas (e.g., 3,1,4,2)');
      }
    }
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
      <h2 className="text-2xl font-bold mb-6">Popularity Match Question</h2>

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
          placeholder="e.g., Order these songs by total Spotify streams (highest to lowest)"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">As of Date</label>
        <input
          type="text"
          value={formData.asOf}
          onChange={(e) => setFormData({ ...formData, asOf: e.target.value })}
          placeholder="e.g., 2025-01-01 or January 2025"
          className={`w-full p-2 border rounded ${errors.asOf ? 'border-red-500' : ''}`}
        />
        <p className="text-sm text-gray-600 mt-1">Reference date for the popularity data</p>
        {errors.asOf && <p className="text-red-500 text-sm mt-1">{errors.asOf}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Items to Rank</label>
        {formData.items.map((item, index) => (
          <div key={index} className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1} (e.g., song, album)`}
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Add Item
          </button>
          <button
            type="button"
            onClick={setCorrectOrder}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Set Popularity Order
          </button>
        </div>
        {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
      </div>

      {formData.correctOrder.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <h4 className="font-medium text-green-800 mb-2">Correct Popularity Order (Most → Least Popular):</h4>
          <ol className="list-decimal list-inside text-green-700">
            {formData.correctOrder.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      )}
      {errors.correctOrder && <p className="text-red-500 text-sm mt-1">{errors.correctOrder}</p>}

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