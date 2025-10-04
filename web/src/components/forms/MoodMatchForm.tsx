'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface MoodMatchFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  moodTags: string[];
  note?: string;
  choices: string[];
  correctAnswer: number;
  hint?: string;
}

export default function MoodMatchForm({ onSubmit, isSubmitting }: MoodMatchFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.MEDIUM,
    themes: [],
    subjects: [],
    task: '',
    moodTags: [],
    note: '',
    choices: ['', '', '', ''],
    correctAnswer: 0,
    hint: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'emotions', 'moods', 'songs', 'analysis', 'feelings'
  ];

  const commonMoodTags = [
    'emotional', 'nostalgic', 'heartbreak', 'upbeat', 'melancholic', 
    'romantic', 'angry', 'sad', 'happy', 'energetic', 'calm', 'dramatic'
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
      questionType: 'mood-match',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        moodTags: formData.moodTags,
        note: formData.note || undefined
      },
      mediaRefs: [], // Can be extended later for audio/visual content
      choices: formData.choices,
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

  const toggleMoodTag = (tag: string) => {
    const newTags = formData.moodTags.includes(tag)
      ? formData.moodTags.filter(t => t !== tag)
      : [...formData.moodTags, tag];
    setFormData({ ...formData, moodTags: newTags });
  };

  const addCustomMoodTag = () => {
    const customTag = prompt('Enter a custom mood tag:');
    if (customTag && customTag.trim() && !formData.moodTags.includes(customTag.trim())) {
      setFormData({
        ...formData,
        moodTags: [...formData.moodTags, customTag.trim()]
      });
    }
  };

  const removeMoodTag = (index: number) => {
    const newTags = formData.moodTags.filter((_, i) => i !== index);
    setFormData({ ...formData, moodTags: newTags });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Mood Match Question</h2>

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
          placeholder="e.g., Which mood best describes the song 'All Too Well'?"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mood Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {commonMoodTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleMoodTag(tag)}
              className={`px-2 py-1 rounded text-xs ${
                formData.moodTags.includes(tag)
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {formData.moodTags.map((tag, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="bg-purple-100 px-2 py-1 rounded text-sm">{tag}</span>
              <button
                type="button"
                onClick={() => removeMoodTag(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCustomMoodTag}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
          >
            Add Custom Mood Tag
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Note (Optional)</label>
        <input
          type="text"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="e.g., Consider the overall feeling and lyrics of the song"
          className="w-full p-2 border rounded"
        />
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
                placeholder={`Mood option ${index + 1}`}
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