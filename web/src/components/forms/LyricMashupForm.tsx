'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface LyricMashupFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  snippets: string[];
  optionsPerSnippet: string[];
  correctMatches: Record<string, string>;
  hint?: string;
}

export default function LyricMashupForm({ onSubmit, isSubmitting }: LyricMashupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.MEDIUM,
    themes: ['lyrics', 'challenge'],
    subjects: ['songs'],
    task: 'Match each lyric snippet to the correct song',
    snippets: [''],
    optionsPerSnippet: [''],
    correctMatches: {},
    hint: ''
  });

  // Popular Taylor Swift lyric mashup presets
  const lyricMashupPresets = {
    'Era Signature Lines': {
      task: 'Match each lyric snippet to the correct song',
      snippets: [
        'Midnight rain',
        'Golden daylight', 
        'Paper rings',
        'Cornelia Street'
      ],
      options: [
        'Lavender Haze',
        'Daylight',
        'Paper Rings', 
        'Cornelia Street'
      ],
      matches: {
        'Midnight rain': 'Lavender Haze',
        'Golden daylight': 'Daylight',
        'Paper rings': 'Paper Rings',
        'Cornelia Street': 'Cornelia Street'
      }
    },
    'Love Song Classics': {
      task: 'Match each romantic lyric to its song',
      snippets: [
        'You were my crown',
        'I want to wear his initial',
        'Romeo take me somewhere',
        'We never go out of style'
      ],
      options: [
        'cardigan',
        'Call It What You Want',
        'Love Story',
        'Style'
      ],
      matches: {
        'You were my crown': 'cardigan',
        'I want to wear his initial': 'Call It What You Want',
        'Romeo take me somewhere': 'Love Story',
        'We never go out of style': 'Style'
      }
    },
    'Heartbreak Anthology': {
      task: 'Match each breakup lyric to the correct song',
      snippets: [
        'All too well',
        'We are never getting back together',
        'I knew you were trouble',
        'Bad blood'
      ],
      options: [
        'All Too Well',
        'We Are Never Getting Back Together',
        'I Knew You Were Trouble',
        'Bad Blood'
      ],
      matches: {
        'All too well': 'All Too Well',
        'We are never getting back together': 'We Are Never Getting Back Together',
        'I knew you were trouble': 'I Knew You Were Trouble',
        'Bad blood': 'Bad Blood'
      }
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'lyrics', 'mashup', 'songs', 'matching', 'challenge'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (formData.snippets.length < 2 || formData.snippets.some(snippet => !snippet.trim())) {
      newErrors.snippets = 'At least 2 lyric snippets are required and all must be filled';
    }

    if (formData.optionsPerSnippet.length < 2 || formData.optionsPerSnippet.some(option => !option.trim())) {
      newErrors.optionsPerSnippet = 'At least 2 song options are required and all must be filled';
    }

    const validSnippets = formData.snippets.filter(s => s.trim());
    if (Object.keys(formData.correctMatches).length !== validSnippets.length) {
      newErrors.correctMatches = 'Please set the correct song match for all snippets';
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
      questionType: 'lyric-mashup',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        snippets: formData.snippets.filter(s => s.trim()),
        optionsPerSnippet: formData.optionsPerSnippet.filter(o => o.trim())
      },
      correct: {
        map: formData.correctMatches
      },
      hint: formData.hint || undefined
    };

    onSubmit(questionData);
  };

  const updateSnippet = (index: number, value: string) => {
    const newSnippets = [...formData.snippets];
    const oldSnippet = newSnippets[index];
    newSnippets[index] = value;
    setFormData({ ...formData, snippets: newSnippets });
    
    // Update correct matches if snippet was changed
    if (formData.correctMatches[oldSnippet]) {
      const newMatches = { ...formData.correctMatches };
      delete newMatches[oldSnippet];
      if (value.trim()) {
        newMatches[value] = formData.correctMatches[oldSnippet];
      }
      setFormData(prev => ({ ...prev, correctMatches: newMatches }));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.optionsPerSnippet];
    newOptions[index] = value;
    setFormData({ ...formData, optionsPerSnippet: newOptions });
  };

  const addSnippet = () => {
    setFormData({ ...formData, snippets: [...formData.snippets, ''] });
  };

  const removeSnippet = (index: number) => {
    const snippetToRemove = formData.snippets[index];
    const newSnippets = formData.snippets.filter((_, i) => i !== index);
    const newMatches = { ...formData.correctMatches };
    delete newMatches[snippetToRemove];
    setFormData({ ...formData, snippets: newSnippets, correctMatches: newMatches });
  };

  const addOption = () => {
    setFormData({ ...formData, optionsPerSnippet: [...formData.optionsPerSnippet, ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.optionsPerSnippet.filter((_, i) => i !== index);
    setFormData({ ...formData, optionsPerSnippet: newOptions });
  };

  const setCorrectMatch = (snippet: string, song: string) => {
    setFormData({
      ...formData,
      correctMatches: {
        ...formData.correctMatches,
        [snippet]: song
      }
    });
  };

  const addSubject = () => {
    const subject = 'lyrics';
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
      <h2 className="text-2xl font-bold mb-6">Lyric Mashup Question</h2>

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
          placeholder="e.g., Match each lyric snippet to the correct song"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        <div className="mt-2">
          <label className="block text-xs font-medium mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(lyricMashupPresets).map(([name, preset]) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  task: preset.task,
                  snippets: [...preset.snippets],
                  optionsPerSnippet: [...preset.options],
                  correctMatches: {...preset.matches}
                })}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Lyric Snippets</label>
        {formData.snippets.map((snippet, index) => (
          <div key={index} className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
            <textarea
              value={snippet}
              onChange={(e) => updateSnippet(index, e.target.value)}
              placeholder={`Lyric snippet ${index + 1}`}
              rows={2}
              className={`flex-1 p-2 border rounded ${errors.snippets ? 'border-red-500' : ''}`}
            />
            {formData.snippets.length > 1 && (
              <button
                type="button"
                onClick={() => removeSnippet(index)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSnippet}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Add Snippet
        </button>
        {errors.snippets && <p className="text-red-500 text-sm mt-1">{errors.snippets}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Song Options</label>
        {formData.optionsPerSnippet.map((option, index) => (
          <div key={index} className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Song option ${index + 1}`}
              className={`flex-1 p-2 border rounded ${errors.optionsPerSnippet ? 'border-red-500' : ''}`}
            />
            {formData.optionsPerSnippet.length > 1 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Add Song Option
        </button>
        {errors.optionsPerSnippet && <p className="text-red-500 text-sm mt-1">{errors.optionsPerSnippet}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Correct Matches</label>
        <p className="text-sm text-gray-600 mb-3">Set which song each lyric snippet belongs to:</p>
        {formData.snippets.filter(s => s.trim()).map((snippet, index) => (
          <div key={index} className="mb-3 p-3 border rounded bg-gray-50">
            <p className="text-sm font-medium mb-2">Snippet: "{snippet}"</p>
            <select
              value={formData.correctMatches[snippet] || ''}
              onChange={(e) => setCorrectMatch(snippet, e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select correct song...</option>
              {formData.optionsPerSnippet.filter(o => o.trim()).map((option, i) => (
                <option key={i} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        {errors.correctMatches && <p className="text-red-500 text-sm mt-1">{errors.correctMatches}</p>}
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
              Add Lyrics Subject
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