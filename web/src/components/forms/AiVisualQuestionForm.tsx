import { useState } from 'react';
import { AiVisualQuestionForm as AiVisualQuestionFormType } from '@/lib/types/question-forms';
import MediaUpload from '@/components/ui/MediaUpload';

interface AiVisualQuestionFormProps {
  question: Partial<AiVisualQuestionFormType>;
  onChange: (question: Partial<AiVisualQuestionFormType>) => void;
}

export default function AiVisualQuestionForm({ question, onChange }: AiVisualQuestionFormProps) {
  const [uploadError, setUploadError] = useState<string>('');

  const updateQuestion = (updates: Partial<AiVisualQuestionFormType>) => {
    onChange({ ...question, ...updates });
  };

  const handleImageUpload = (uploadData: { url: string; filename: string; size: number }) => {
    updateQuestion({
      imageUrl: uploadData.url,
      imageFilename: uploadData.filename
    });
    setUploadError('');
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
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
          placeholder="Enter the question text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image *
        </label>
        {question.imageUrl ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-700">
                  {question.imageFilename || 'Image uploaded'}
                </span>
              </div>
              <button
                onClick={() => updateQuestion({ imageUrl: '', imageFilename: '' })}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <img 
              src={question.imageUrl} 
              alt="Uploaded image"
              className="max-w-xs max-h-48 object-contain border border-gray-200 rounded-lg"
            />
          </div>
        ) : (
          <MediaUpload
            type="image"
            onUploadSuccess={handleImageUpload}
            onError={handleUploadError}
            className="w-full"
          />
        )}
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
      </div>

      {/* AI Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Analysis Prompt *
        </label>
        <textarea
          value={question.aiPrompt || ''}
          onChange={(e) => updateQuestion({ aiPrompt: e.target.value })}
          placeholder="Enter the prompt that will be used to analyze the image (e.g., 'Identify the historical era of the clothing in this image')"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Answer Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Options *
        </label>
        <div className="space-y-3">
          {(question.options || ['', '', '', '']).map((option, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => updateQuestion({ correctAnswerIndex: index })}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  question.correctAnswerIndex === index
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {question.correctAnswerIndex === index && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">{index + 1}</span>
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...(question.options || ['', '', '', ''])];
                  newOptions[index] = e.target.value;
                  updateQuestion({ options: newOptions });
                }}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Click the circle button to select the correct answer
        </p>
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