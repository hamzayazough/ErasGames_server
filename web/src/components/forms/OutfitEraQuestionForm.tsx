import { useState } from 'react';
import { OutfitEraQuestionForm as OutfitEraQuestionFormType } from '@/lib/types/question-forms';
import MediaUpload from '@/components/ui/MediaUpload';

interface OutfitEraQuestionFormProps {
  question: Partial<OutfitEraQuestionFormType>;
  onChange: (question: Partial<OutfitEraQuestionFormType>) => void;
}

export default function OutfitEraQuestionForm({ question, onChange }: OutfitEraQuestionFormProps) {
  const [uploadError, setUploadError] = useState<string>('');

  const updateQuestion = (updates: Partial<OutfitEraQuestionFormType>) => {
    onChange({ ...question, ...updates });
  };

  const handleImageUpload = (uploadData: { url: string; filename: string; size: number }) => {
    updateQuestion({
      outfitImageUrl: uploadData.url,
      imageFilename: uploadData.filename
    });
    setUploadError('');
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const addHistoricalContext = () => {
    const currentContexts = question.historicalContexts || [];
    updateQuestion({
      historicalContexts: [...currentContexts, { era: '', description: '', keyFeatures: [] }]
    });
  };

  const updateHistoricalContext = (index: number, field: keyof typeof question.historicalContexts[0], value: any) => {
    const currentContexts = question.historicalContexts || [];
    const newContexts = [...currentContexts];
    newContexts[index] = { ...newContexts[index], [field]: value };
    updateQuestion({ historicalContexts: newContexts });
  };

  const removeHistoricalContext = (index: number) => {
    const currentContexts = question.historicalContexts || [];
    const newContexts = currentContexts.filter((_, i) => i !== index);
    updateQuestion({ historicalContexts: newContexts });
  };

  const addKeyFeature = (contextIndex: number) => {
    const currentContexts = question.historicalContexts || [];
    const newContexts = [...currentContexts];
    const currentFeatures = newContexts[contextIndex].keyFeatures || [];
    newContexts[contextIndex] = {
      ...newContexts[contextIndex],
      keyFeatures: [...currentFeatures, '']
    };
    updateQuestion({ historicalContexts: newContexts });
  };

  const updateKeyFeature = (contextIndex: number, featureIndex: number, value: string) => {
    const currentContexts = question.historicalContexts || [];
    const newContexts = [...currentContexts];
    const newFeatures = [...(newContexts[contextIndex].keyFeatures || [])];
    newFeatures[featureIndex] = value;
    newContexts[contextIndex] = {
      ...newContexts[contextIndex],
      keyFeatures: newFeatures
    };
    updateQuestion({ historicalContexts: newContexts });
  };

  const removeKeyFeature = (contextIndex: number, featureIndex: number) => {
    const currentContexts = question.historicalContexts || [];
    const newContexts = [...currentContexts];
    const newFeatures = (newContexts[contextIndex].keyFeatures || []).filter((_, i) => i !== featureIndex);
    newContexts[contextIndex] = {
      ...newContexts[contextIndex],
      keyFeatures: newFeatures
    };
    updateQuestion({ historicalContexts: newContexts });
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
          placeholder="Enter the question text (e.g., 'What historical era does this outfit represent?')"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Outfit Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Outfit Image *
        </label>
        {question.outfitImageUrl ? (
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
                onClick={() => updateQuestion({ outfitImageUrl: '', imageFilename: '' })}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <img 
              src={question.outfitImageUrl} 
              alt="Outfit image"
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

      {/* Correct Era */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Era *
        </label>
        <input
          type="text"
          value={question.correctEra || ''}
          onChange={(e) => updateQuestion({ correctEra: e.target.value })}
          placeholder="Enter the correct historical era (e.g., 'Victorian Era', '1920s')"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Era Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Era Options *
        </label>
        <div className="space-y-2">
          {(question.eraOptions || ['', '', '', '']).map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...(question.eraOptions || ['', '', '', ''])];
                newOptions[index] = e.target.value;
                updateQuestion({ eraOptions: newOptions });
              }}
              placeholder={`Era option ${index + 1}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>
      </div>

      {/* Historical Contexts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Historical Contexts (Educational Information)
          </label>
          <button
            onClick={addHistoricalContext}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Context
          </button>
        </div>
        
        <div className="space-y-4">
          {(question.historicalContexts || []).map((context, contextIndex) => (
            <div key={contextIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Historical Context {contextIndex + 1}</h4>
                <button
                  onClick={() => removeHistoricalContext(contextIndex)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Era */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Era</label>
                  <input
                    type="text"
                    value={context.era}
                    onChange={(e) => updateHistoricalContext(contextIndex, 'era', e.target.value)}
                    placeholder="Era name"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={context.description}
                    onChange={(e) => updateHistoricalContext(contextIndex, 'description', e.target.value)}
                    placeholder="Description of the era and its fashion characteristics"
                    rows={2}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Key Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-gray-600">Key Fashion Features</label>
                    <button
                      onClick={() => addKeyFeature(contextIndex)}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Add Feature
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    {(context.keyFeatures || []).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateKeyFeature(contextIndex, featureIndex, e.target.value)}
                          placeholder="Key fashion feature"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeKeyFeature(contextIndex, featureIndex)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {(!question.historicalContexts || question.historicalContexts.length === 0) && (
          <p className="text-sm text-gray-500 italic">
            No historical contexts added yet. These provide educational information about different eras.
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