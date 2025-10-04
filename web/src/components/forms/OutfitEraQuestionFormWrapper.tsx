import { useState } from 'react';
import { OutfitEraQuestionForm as OutfitEraQuestionFormType } from '@/lib/types/question-forms';
import OutfitEraQuestionForm from './OutfitEraQuestionForm';

interface OutfitEraQuestionFormWrapperProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function OutfitEraQuestionFormWrapper({ onSubmit, isSubmitting }: OutfitEraQuestionFormWrapperProps) {
  const [question, setQuestion] = useState<Partial<OutfitEraQuestionFormType>>({
    type: 'outfit-era',
    difficulty: 'medium',
    era: '',
    question: '',
    outfitImageUrl: '',
    imageFilename: '',
    correctEra: '',
    eraOptions: ['', '', '', ''],
    historicalContexts: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!question.question || !question.outfitImageUrl || !question.correctEra) {
      alert('Please fill in all required fields');
      return;
    }

    if (!question.eraOptions?.every(option => option.trim())) {
      alert('Please fill in all era options');
      return;
    }

    onSubmit({
      ...question,
      type: 'outfit-era'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OutfitEraQuestionForm
        question={question}
        onChange={setQuestion}
      />
      
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md font-medium ${
            isSubmitting
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Creating...' : 'Create Question'}
        </button>
      </div>
    </form>
  );
}