'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/lib/types/enums/question.enums';
import { QuestionTheme } from '@/lib/types/enums/question-theme.enum';

interface TracklistOrderFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface FormData {
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  task: string;
  album: string;
  tracks: string[];
  correctOrder: string[];
  hint?: string;
}

export default function TracklistOrderForm({ onSubmit, isSubmitting }: TracklistOrderFormProps) {
  const [formData, setFormData] = useState<FormData>({
    difficulty: Difficulty.HARD,
    themes: [],
    subjects: [],
    task: '',
    album: '',
    tracks: [''],
    correctOrder: [],
    hint: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableThemes = [
    'albums', 'track-order', 'tracklist', 'order', 'sequence'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    if (!formData.album.trim()) {
      newErrors.album = 'Album name is required';
    }

    if (formData.tracks.length < 3 || formData.tracks.some(track => !track.trim())) {
      newErrors.tracks = 'At least 3 tracks are required and all must be filled';
    }

    if (formData.correctOrder.length !== formData.tracks.filter(track => track.trim()).length) {
      newErrors.correctOrder = 'Please set the correct track order for all tracks';
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
      questionType: 'tracklist-order',
      difficulty: formData.difficulty,
      themes: formData.themes,
      subjects: formData.subjects,
      prompt: {
        task: formData.task,
        album: formData.album,
        tracks: formData.tracks.filter(track => track.trim())
      },
      choices: [], // Tracklist order doesn't use traditional choices
      correct: {
        values: formData.correctOrder
      },
      hint: formData.hint || undefined
    };

    onSubmit(questionData);
  };

  const updateTrack = (index: number, value: string) => {
    const newTracks = [...formData.tracks];
    newTracks[index] = value;
    setFormData({ ...formData, tracks: newTracks });
    
    // Update correct order if track was changed
    if (formData.correctOrder.includes(formData.tracks[index])) {
      const newOrder = [...formData.correctOrder];
      const orderIndex = newOrder.indexOf(formData.tracks[index]);
      if (value.trim()) {
        newOrder[orderIndex] = value;
      } else {
        newOrder.splice(orderIndex, 1);
      }
      setFormData(prev => ({ ...prev, correctOrder: newOrder }));
    }
  };

  const addTrack = () => {
    setFormData({ ...formData, tracks: [...formData.tracks, ''] });
  };

  const removeTrack = (index: number) => {
    const trackToRemove = formData.tracks[index];
    const newTracks = formData.tracks.filter((_, i) => i !== index);
    const newOrder = formData.correctOrder.filter(track => track !== trackToRemove);
    setFormData({ ...formData, tracks: newTracks, correctOrder: newOrder });
  };

  const setCorrectOrder = () => {
    const validTracks = formData.tracks.filter(track => track.trim());
    if (validTracks.length < 2) {
      alert('Please add at least 2 tracks before setting the order');
      return;
    }

    const orderString = prompt(
      `Enter the correct album track order (first to last) as numbers separated by commas.\nTracks:\n${validTracks.map((track, i) => `${i + 1}. ${track}`).join('\n')}\n\nExample: 2,1,4,3`
    );

    if (orderString) {
      try {
        const orderIndexes = orderString.split(',').map(s => parseInt(s.trim()) - 1);
        if (orderIndexes.every(i => i >= 0 && i < validTracks.length)) {
          const newOrder = orderIndexes.map(i => validTracks[i]);
          setFormData({ ...formData, correctOrder: newOrder });
        } else {
          alert('Invalid order. Please use numbers from 1 to ' + validTracks.length);
        }
      } catch {
        alert('Invalid format. Please use numbers separated by commas (e.g., 2,1,4,3)');
      }
    }
  };

  const addSubject = () => {
    if (formData.album.trim()) {
      const subject = `album:${formData.album.toLowerCase().replace(/\s+/g, '-')}`;
      if (!formData.subjects.includes(subject)) {
        setFormData({
          ...formData,
          subjects: [...formData.subjects, subject]
        });
      }
    } else {
      alert('Please enter an album name first');
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
      <h2 className="text-2xl font-bold mb-6">Tracklist Order Question</h2>

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
          placeholder="e.g., Arrange these songs in their album order"
          className={`w-full p-2 border rounded ${errors.task ? 'border-red-500' : ''}`}
        />
        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Album Name</label>
        <input
          type="text"
          value={formData.album}
          onChange={(e) => setFormData({ ...formData, album: e.target.value })}
          placeholder="e.g., folklore"
          className={`w-full p-2 border rounded ${errors.album ? 'border-red-500' : ''}`}
        />
        {errors.album && <p className="text-red-500 text-sm mt-1">{errors.album}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Album Tracks</label>
        {formData.tracks.map((track, index) => (
          <div key={index} className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
            <input
              type="text"
              value={track}
              onChange={(e) => updateTrack(index, e.target.value)}
              placeholder={`Track ${index + 1}`}
              className={`flex-1 p-2 border rounded ${errors.tracks ? 'border-red-500' : ''}`}
            />
            {formData.tracks.length > 1 && (
              <button
                type="button"
                onClick={() => removeTrack(index)}
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
            onClick={addTrack}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Add Track
          </button>
          <button
            type="button"
            onClick={setCorrectOrder}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Set Album Order
          </button>
        </div>
        {errors.tracks && <p className="text-red-500 text-sm mt-1">{errors.tracks}</p>}
      </div>

      {formData.correctOrder.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <h4 className="font-medium text-green-800 mb-2">Correct Album Track Order:</h4>
          <ol className="list-decimal list-inside text-green-700">
            {formData.correctOrder.map((track, index) => (
              <li key={index}>{track}</li>
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
              Add Album Subject
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