'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface SpeedTapFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  targetRule: string;
  roundSeconds: number;
  gridItems: string[];
  correctTargets: string[];
  scoringHints?: {
    perCorrect: number;
    perWrong: number;
  };
  hint?: string;
}

export default function SpeedTapForm({ onSubmit, isSubmitting }: SpeedTapFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.HARD,
    themes: [],
    subjects: [],
    task: '',
    targetRule: '',
    roundSeconds: 10,
    gridItems: Array(16).fill(''), // 4x4 grid by default
    correctTargets: [],
    scoringHints: {
      perCorrect: 10,
      perWrong: -5
    },
    hint: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'speed', 'reaction', 'tap', 'challenge', 'quick-thinking', 'reflex'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (!formData.targetRule.trim()) {
      newErrors.targetRule = 'Target rule is required';
    }

    if (formData.roundSeconds < 5 || formData.roundSeconds > 60) {
      newErrors.roundSeconds = 'Round duration must be between 5 and 60 seconds';
    }

    const validGridItems = formData.gridItems.filter(item => item.trim());
    if (validGridItems.length < 4) {
      newErrors.gridItems = 'At least 4 grid items are required';
    }

    if (formData.correctTargets.length === 0) {
      newErrors.correctTargets = 'At least one correct target must be selected';
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
      questionType: 'speed-tap',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        targetRule: formData.targetRule,
        roundSeconds: formData.roundSeconds,
        grid: formData.gridItems.filter(item => item.trim())
      },
      correct: {
        targets: formData.correctTargets
      },
      scoringHints: formData.scoringHints,
      hint: formData.hint || undefined
    };

    onSubmit(questionData);
  };

  const updateGridItem = (index: number, value: string) => {
    const newItems = [...formData.gridItems];
    const oldItem = newItems[index];
    newItems[index] = value;
    setFormData({ ...formData, gridItems: newItems });
    
    // Update correct targets if item was changed
    if (formData.correctTargets.includes(oldItem)) {
      const newTargets = formData.correctTargets.map(target => 
        target === oldItem ? value : target
      ).filter(target => target.trim());
      setFormData(prev => ({ ...prev, correctTargets: newTargets }));
    }
  };

  const toggleCorrectTarget = (item: string) => {
    if (!item.trim()) return;
    
    const newTargets = formData.correctTargets.includes(item)
      ? formData.correctTargets.filter(target => target !== item)
      : [...formData.correctTargets, item];
    
    setFormData({ ...formData, correctTargets: newTargets });
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
      <h2 className="text-2xl font-bold mb-6">Speed Tap Question</h2>

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
          placeholder="e.g., Tap all the song titles as fast as you can!"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Target Rule</label>
        <input
          type="text"
          value={formData.targetRule}
          onChange={(e) => setFormData({ ...formData, targetRule: e.target.value })}
          placeholder="e.g., Songs from the Folklore album"
          className={`w-full p-2 border rounded ${errors.targetRule ? 'border-red-500' : ''}`}
        />
        <p className="text-sm text-gray-600 mt-1">Explain what items should be tapped</p>
        {errors.targetRule && <p className="text-red-500 text-sm mt-1">{errors.targetRule}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Round Duration (seconds)</label>
        <input
          type="number"
          min="5"
          max="60"
          value={formData.roundSeconds}
          onChange={(e) => setFormData({ ...formData, roundSeconds: parseInt(e.target.value) || 10 })}
          className={`w-full p-2 border rounded ${errors.roundSeconds ? 'border-red-500' : ''}`}
        />
        {errors.roundSeconds && <p className="text-red-500 text-sm mt-1">{errors.roundSeconds}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Grid Items (4x4 Grid)</label>
        <p className="text-sm text-gray-600 mb-3">
          Enter items for the tap grid. Mark correct targets with green checkboxes.
        </p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {formData.gridItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <input
                type="text"
                value={item}
                onChange={(e) => updateGridItem(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className={`w-full p-2 text-sm border rounded ${errors.gridItems ? 'border-red-500' : ''}`}
              />
              {item.trim() && (
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={formData.correctTargets.includes(item)}
                    onChange={() => toggleCorrectTarget(item)}
                    className="mr-1"
                  />
                  <span className={formData.correctTargets.includes(item) ? 'text-green-600 font-medium' : 'text-gray-600'}>
                    Target
                  </span>
                </label>
              )}
            </div>
          ))}
        </div>
        {errors.gridItems && <p className="text-red-500 text-sm mt-1">{errors.gridItems}</p>}
        {errors.correctTargets && <p className="text-red-500 text-sm mt-1">{errors.correctTargets}</p>}
      </div>

      {formData.correctTargets.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <h4 className="font-medium text-green-800 mb-2">Correct Targets to Tap:</h4>
          <div className="flex flex-wrap gap-2">
            {formData.correctTargets.map((target, index) => (
              <span key={index} className="bg-green-100 px-2 py-1 rounded text-sm text-green-700">
                {target}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Scoring</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Points per correct tap</label>
            <input
              type="number"
              value={formData.scoringHints?.perCorrect || 10}
              onChange={(e) => setFormData({
                ...formData,
                scoringHints: {
                  ...formData.scoringHints!,
                  perCorrect: parseInt(e.target.value) || 10
                }
              })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Points per wrong tap</label>
            <input
              type="number"
              value={formData.scoringHints?.perWrong || -5}
              onChange={(e) => setFormData({
                ...formData,
                scoringHints: {
                  ...formData.scoringHints!,
                  perWrong: parseInt(e.target.value) || -5
                }
              })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
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