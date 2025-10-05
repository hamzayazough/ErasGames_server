'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface InspirationMapFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  disclaimer?: string;
  choices: string[];
  correctAnswer: number;
  hint?: string;
}

export default function InspirationMapForm({ onSubmit, isSubmitting }: InspirationMapFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.MEDIUM,
    themes: ['influences'],
    subjects: ['songs'],
    task: 'Who is widely believed to have inspired the song "All Too Well"?',
    disclaimer: 'Based on fan interpretations and media reports, not officially confirmed.',
    choices: ['', '', '', ''],
    correctAnswer: 0,
    hint: ''
  });

  // Popular Taylor Swift inspiration/relationship presets
  const inspirationPresets = {
    'All Too Well': {
      task: 'Who is widely believed to have inspired the song "All Too Well"?',
      disclaimer: 'Based on fan interpretations and media reports, not officially confirmed.',
      choices: ['Joe Jonas', 'Jake Gyllenhaal', 'Harry Styles', 'John Mayer'],
      correctAnswer: 1
    },
    'Dear John': {
      task: 'Who is widely believed to have inspired "Dear John"?',
      disclaimer: 'Based on fan interpretations and media reports, not officially confirmed.',
      choices: ['Taylor Lautner', 'Joe Jonas', 'John Mayer', 'Conor Kennedy'],
      correctAnswer: 2
    },
    'Style': {
      task: 'Who is widely believed to have inspired the song "Style"?',
      disclaimer: 'Based on fan interpretations and media reports, not officially confirmed.',
      choices: ['Calvin Harris', 'Harry Styles', 'Tom Hiddleston', 'Joe Alwyn'],
      correctAnswer: 1
    },
    'Getaway Car': {
      task: 'What relationship situation is "Getaway Car" believed to reference?',
      disclaimer: 'Based on fan interpretations and lyrical analysis.',
      choices: ['Meeting Joe Alwyn', 'Ending with Calvin Harris', 'Brief Tom Hiddleston period', 'All of the above'],
      correctAnswer: 3
    },
    'folklore Love Triangle': {
      task: 'Who do fans believe the folklore love triangle songs reference?',
      disclaimer: 'Based on fan theories and interpretations, not confirmed.',
      choices: ['High school relationships', 'Joe Alwyn situation', 'Fictional characters', 'Industry relationships'],
      correctAnswer: 0
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'influences', 'relationships', 'inspiration', 'biography', 'songwriting'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
      questionType: 'inspiration-map',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        disclaimer: formData.disclaimer || undefined
      },
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
      <h2 className="text-2xl font-bold mb-6">Inspiration Map Question</h2>

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
          placeholder="e.g., Who is widely believed to have inspired the song 'All Too Well'?"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        <div className="mt-2">
          <label className="block text-xs font-medium mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(inspirationPresets).map(([name, preset]) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  task: preset.task,
                  disclaimer: preset.disclaimer,
                  choices: [...preset.choices],
                  correctAnswer: preset.correctAnswer
                })}
                className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs hover:bg-pink-200"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Disclaimer (Optional)</label>
        <input
          type="text"
          value={formData.disclaimer}
          onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
          placeholder="e.g., Based on fan interpretations and media reports, not officially confirmed."
          className="w-full p-2 border rounded"
        />
        <p className="text-sm text-gray-600 mt-1">Add a disclaimer when the answer is based on speculation or interpretation</p>
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
                placeholder={`Person/inspiration ${index + 1}`}
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