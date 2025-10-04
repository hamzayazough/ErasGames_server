import { useState } from 'react';
import { SoundAlikeSnippetQuestionForm as SoundAlikeSnippetQuestionFormType } from '@/lib/types/question-forms';
import MediaUpload from '@/components/ui/MediaUpload';

interface SoundAlikeSnippetQuestionFormProps {
  question: Partial<SoundAlikeSnippetQuestionFormType>;
  onChange: (question: Partial<SoundAlikeSnippetQuestionFormType>) => void;
}

export default function SoundAlikeSnippetQuestionForm({ question, onChange }: SoundAlikeSnippetQuestionFormProps) {
  const [uploadError, setUploadError] = useState<string>('');

  const updateQuestion = (updates: Partial<SoundAlikeSnippetQuestionFormType>) => {
    onChange({ ...question, ...updates });
  };

  const handleAudioUpload = (uploadData: { url: string; filename: string; size: number }) => {
    updateQuestion({
      audioUrl: uploadData.url,
      audioFilename: uploadData.filename
    });
    setUploadError('');
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const addSoundAlikeOption = () => {
    const currentOptions = question.soundAlikeOptions || [];
    updateQuestion({
      soundAlikeOptions: [...currentOptions, { word: '', soundAlike: '' }]
    });
  };

  const updateSoundAlikeOption = (index: number, field: 'word' | 'soundAlike', value: string) => {
    const currentOptions = question.soundAlikeOptions || [];
    const newOptions = [...currentOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateQuestion({ soundAlikeOptions: newOptions });
  };

  const removeSoundAlikeOption = (index: number) => {
    const currentOptions = question.soundAlikeOptions || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    updateQuestion({ soundAlikeOptions: newOptions });
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <input
          type="text"
          value={question.question || ''}
          onChange={(e) => updateQuestion({ question: e.target.value })}
          placeholder="Enter the question text (e.g., 'Listen to this audio snippet and identify the word')"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Audio Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audio Snippet *
        </label>
        {question.audioUrl ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-700">
                  {question.audioFilename || 'Audio uploaded'}
                </span>
              </div>
              <button
                onClick={() => updateQuestion({ audioUrl: '', audioFilename: '' })}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <audio controls className="w-full max-w-md">
              <source src={question.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : (
          <MediaUpload
            type="audio"
            onUploadSuccess={handleAudioUpload}
            onError={handleUploadError}
            className="w-full"
          />
        )}
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
      </div>

      {/* Correct Word */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Word *
        </label>
        <input
          type="text"
          value={question.correctWord || ''}
          onChange={(e) => updateQuestion({ correctWord: e.target.value })}
          placeholder="Enter the correct word that is pronounced in the audio"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sound-Alike Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Sound-Alike Options *
          </label>
          <button
            onClick={addSoundAlikeOption}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Option
          </button>
        </div>
        
        <div className="space-y-3">
          {(question.soundAlikeOptions || []).map((option, index) => (
            <div key={index} className="flex gap-3 items-center p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={option.word}
                  onChange={(e) => updateSoundAlikeOption(index, 'word', e.target.value)}
                  placeholder="Word"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={option.soundAlike}
                  onChange={(e) => updateSoundAlikeOption(index, 'soundAlike', e.target.value)}
                  placeholder="Sounds like (phonetic representation)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => removeSoundAlikeOption(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        {(!question.soundAlikeOptions || question.soundAlikeOptions.length === 0) && (
          <p className="text-sm text-gray-500 italic">
            No sound-alike options added yet. Click "Add Option" to create options.
          </p>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level
        </label>
        <select
          value={question.difficulty || 'medium'}
          onChange={(e) => updateQuestion({ difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Era */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Era
        </label>
        <input
          type="text"
          value={question.era || ''}
          onChange={(e) => updateQuestion({ era: e.target.value })}
          placeholder="Enter the historical era (optional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}