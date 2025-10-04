import { useState } from 'react';
import { ReverseAudioQuestionForm as ReverseAudioQuestionFormType } from '@/lib/types/question-forms';
import MediaUpload from '@/components/ui/MediaUpload';

interface ReverseAudioQuestionFormProps {
  question: Partial<ReverseAudioQuestionFormType>;
  onChange: (question: Partial<ReverseAudioQuestionFormType>) => void;
}

export default function ReverseAudioQuestionForm({ question, onChange }: ReverseAudioQuestionFormProps) {
  const [uploadError, setUploadError] = useState<string>('');

  const updateQuestion = (updates: Partial<ReverseAudioQuestionFormType>) => {
    onChange({ ...question, ...updates });
  };

  const handleAudioUpload = (uploadData: { url: string; filename: string; size: number }) => {
    updateQuestion({
      reverseAudioUrl: uploadData.url,
      audioFilename: uploadData.filename
    });
    setUploadError('');
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const addWordClue = () => {
    const currentClues = question.wordClues || [];
    updateQuestion({
      wordClues: [...currentClues, { position: currentClues.length + 1, hint: '', category: '' }]
    });
  };

  const updateWordClue = (index: number, field: keyof typeof question.wordClues[0], value: any) => {
    const currentClues = question.wordClues || [];
    const newClues = [...currentClues];
    newClues[index] = { ...newClues[index], [field]: value };
    updateQuestion({ wordClues: newClues });
  };

  const removeWordClue = (index: number) => {
    const currentClues = question.wordClues || [];
    const newClues = currentClues.filter((_, i) => i !== index);
    // Update positions to be sequential
    const updatedClues = newClues.map((clue, i) => ({ ...clue, position: i + 1 }));
    updateQuestion({ wordClues: updatedClues });
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
          placeholder="Enter the question text (e.g., 'Listen to this reversed audio and identify the original word')"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Reverse Audio Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reversed Audio *
        </label>
        {question.reverseAudioUrl ? (
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
                onClick={() => updateQuestion({ reverseAudioUrl: '', audioFilename: '' })}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <audio controls className="w-full max-w-md">
              <source src={question.reverseAudioUrl} type="audio/mpeg" />
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

      {/* Original Word */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Original Word *
        </label>
        <input
          type="text"
          value={question.originalWord || ''}
          onChange={(e) => updateQuestion({ originalWord: e.target.value })}
          placeholder="Enter the original word that was reversed"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

      {/* Word Clues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Word Clues (Optional Hints)
          </label>
          <button
            onClick={addWordClue}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Clue
          </button>
        </div>
        
        <div className="space-y-3">
          {(question.wordClues || []).map((clue, index) => (
            <div key={index} className="flex gap-3 items-start p-3 border border-gray-200 rounded-lg">
              <div className="w-16">
                <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                <input
                  type="number"
                  min="1"
                  value={clue.position}
                  onChange={(e) => updateWordClue(index, 'position', parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Hint</label>
                <input
                  type="text"
                  value={clue.hint}
                  onChange={(e) => updateWordClue(index, 'hint', e.target.value)}
                  placeholder="Hint about the word"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <input
                  type="text"
                  value={clue.category}
                  onChange={(e) => updateWordClue(index, 'category', e.target.value)}
                  placeholder="Category (e.g., 'Animal', 'Object')"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => removeWordClue(index)}
                className="text-red-500 hover:text-red-700 p-1 mt-5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        {(!question.wordClues || question.wordClues.length === 0) && (
          <p className="text-sm text-gray-500 italic">
            No word clues added yet. These provide optional hints to help players identify the reversed word.
          </p>
        )}
      </div>

      {/* Audio Processing Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Audio Processing Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Reverse Speed
            </label>
            <select
              value={question.reverseSpeed || 1}
              onChange={(e) => updateQuestion({ reverseSpeed: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0.5}>0.5x (Slower)</option>
              <option value={1}>1x (Normal)</option>
              <option value={1.5}>1.5x (Faster)</option>
              <option value={2}>2x (Much Faster)</option>
            </select>
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