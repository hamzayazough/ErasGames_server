import { useState } from 'react';
import { OneSecondQuestionForm as OneSecondQuestionFormType } from '@/lib/types/question-forms';
import MediaUpload from '@/components/ui/MediaUpload';

interface OneSecondQuestionFormProps {
  question: Partial<OneSecondQuestionFormType>;
  onChange: (question: Partial<OneSecondQuestionFormType>) => void;
}

export default function OneSecondQuestionForm({ question, onChange }: OneSecondQuestionFormProps) {
  const [uploadError, setUploadError] = useState<string>('');

  const updateQuestion = (updates: Partial<OneSecondQuestionFormType>) => {
    onChange({ ...question, ...updates });
  };

  const handleAudioUpload = (uploadData: { url: string; filename: string; size: number }) => {
    updateQuestion({
      audioSnippetUrl: uploadData.url,
      audioFilename: uploadData.filename
    });
    setUploadError('');
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const addContextClue = () => {
    const currentClues = question.contextClues || [];
    updateQuestion({
      contextClues: [...currentClues, { type: 'temporal', clue: '', relevance: 'high' }]
    });
  };

  const updateContextClue = (index: number, field: keyof typeof question.contextClues[0], value: any) => {
    const currentClues = question.contextClues || [];
    const newClues = [...currentClues];
    newClues[index] = { ...newClues[index], [field]: value };
    updateQuestion({ contextClues: newClues });
  };

  const removeContextClue = (index: number) => {
    const currentClues = question.contextClues || [];
    const newClues = currentClues.filter((_, i) => i !== index);
    updateQuestion({ contextClues: newClues });
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
          placeholder="Enter the question text (e.g., 'Listen to this 1-second clip and identify the source')"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Audio Snippet Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1-Second Audio Snippet *
        </label>
        {question.audioSnippetUrl ? (
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
                onClick={() => updateQuestion({ audioSnippetUrl: '', audioFilename: '' })}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <audio controls className="w-full max-w-md">
              <source src={question.audioSnippetUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-xs text-gray-500">
              Note: Ensure the audio clip is approximately 1 second long for optimal gameplay.
            </p>
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

      {/* Source Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Title *
          </label>
          <input
            type="text"
            value={question.sourceTitle || ''}
            onChange={(e) => updateQuestion({ sourceTitle: e.target.value })}
            placeholder="Title of the source (e.g., song name, movie title)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Type *
          </label>
          <select
            value={question.sourceType || 'music'}
            onChange={(e) => updateQuestion({ sourceType: e.target.value as 'music' | 'movie' | 'tv_show' | 'speech' | 'nature' | 'other' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="music">Music</option>
            <option value="movie">Movie</option>
            <option value="tv_show">TV Show</option>
            <option value="speech">Speech</option>
            <option value="nature">Nature</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Answer Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Options *
        </label>
        <div className="space-y-2">
          {(question.options || ['', '', '', '']).map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...(question.options || ['', '', '', ''])];
                newOptions[index] = e.target.value;
                updateQuestion({ options: newOptions });
              }}
              placeholder={`Option ${index + 1}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timestamp in Original Source
        </label>
        <input
          type="text"
          value={question.timestamp || ''}
          onChange={(e) => updateQuestion({ timestamp: e.target.value })}
          placeholder="e.g., '2:34', '1:15:22', 'Opening scene'"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Specify where this clip occurs in the original source (optional)
        </p>
      </div>

      {/* Context Clues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Context Clues (Optional Hints)
          </label>
          <button
            onClick={addContextClue}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Clue
          </button>
        </div>
        
        <div className="space-y-3">
          {(question.contextClues || []).map((clue, index) => (
            <div key={index} className="flex gap-3 items-start p-3 border border-gray-200 rounded-lg">
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={clue.type}
                  onChange={(e) => updateContextClue(index, 'type', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="temporal">Temporal (Time Period)</option>
                  <option value="genre">Genre</option>
                  <option value="artist">Artist/Creator</option>
                  <option value="contextual">Contextual</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Clue</label>
                <input
                  type="text"
                  value={clue.clue}
                  onChange={(e) => updateContextClue(index, 'clue', e.target.value)}
                  placeholder="Hint about the source"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-600 mb-1">Relevance</label>
                <select
                  value={clue.relevance}
                  onChange={(e) => updateContextClue(index, 'relevance', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <button
                onClick={() => removeContextClue(index)}
                className="text-red-500 hover:text-red-700 p-1 mt-5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        {(!question.contextClues || question.contextClues.length === 0) && (
          <p className="text-sm text-gray-500 italic">
            No context clues added yet. These provide optional hints to help players identify the source.
          </p>
        )}
      </div>

      {/* Audio Processing Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Audio Processing Settings</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Snippet Duration (seconds)
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={question.snippetDuration || 1}
              onChange={(e) => updateQuestion({ snippetDuration: parseFloat(e.target.value) || 1 })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Audio Quality
            </label>
            <select
              value={question.audioQuality || 'standard'}
              onChange={(e) => updateQuestion({ audioQuality: e.target.value as 'low' | 'standard' | 'high' })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Quality</option>
              <option value="standard">Standard Quality</option>
              <option value="high">High Quality</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Volume Level
            </label>
            <select
              value={question.volumeLevel || 'normal'}
              onChange={(e) => updateQuestion({ volumeLevel: e.target.value as 'low' | 'normal' | 'high' })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
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