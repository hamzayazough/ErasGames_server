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
      audioUrl: uploadData.url,
      audioFilename: uploadData.filename
    });
    setUploadError('');
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const popularSongs = [
    'Love Story', 'You Belong With Me', 'Shake It Off', '22', 'Anti-Hero',
    'Cruel Summer', 'cardigan', 'Willow', 'We Are Never Getting Back Together',
    'Look What You Made Me Do', 'Delicate', 'Paper Rings', 'All Too Well'
  ];

  const commonChoiceSets = [
    ['Love Story', 'You Belong With Me', 'Shake It Off', '22'],
    ['Anti-Hero', 'Cruel Summer', 'cardigan', 'Willow'],
    ['All Too Well', 'Red', 'I Knew You Were Trouble', 'Begin Again'],
    ['Delicate', 'Look What You Made Me Do', 'Ready For It', 'End Game']
  ];



  return (
    <div className="space-y-6">
      {/* Task Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Description
        </label>
        <input
          type="text"
          value={question.task || 'Identify the song from this reversed audio clip'}
          onChange={(e) => updateQuestion({ task: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Audio Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reversed Audio *
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

      {/* Answer Choices */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Choices *
        </label>
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1">Quick Presets:</label>
          <div className="flex flex-wrap gap-2">
            {commonChoiceSets.map((choiceSet, setIndex) => (
              <button
                key={setIndex}
                type="button"
                onClick={() => updateQuestion({ choices: [...choiceSet] })}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200"
              >
                {choiceSet.join(', ')}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {(question.choices || ['', '', '', '']).map((choice, index) => (
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
                value={choice}
                onChange={(e) => {
                  const newChoices = [...(question.choices || ['', '', '', ''])];
                  newChoices[index] = e.target.value;
                  updateQuestion({ choices: newChoices });
                }}
                placeholder={`Song option ${index + 1}`}
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
    </div>
  );
}