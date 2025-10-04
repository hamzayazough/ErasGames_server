import { useState } from 'react';
import { OneSecondQuestionForm as OneSecondQuestionFormType } from '@/lib/types/question-forms';
import OneSecondQuestionForm from './OneSecondQuestionForm';

interface OneSecondQuestionFormWrapperProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function OneSecondQuestionFormWrapper({ onSubmit, isSubmitting }: OneSecondQuestionFormWrapperProps) {
  const [question, setQuestion] = useState<Partial<OneSecondQuestionFormType>>({
    type: 'one-second',
    difficulty: 'medium',
    era: '',
    question: '',
    audioSnippetUrl: '',
    audioFilename: '',
    sourceTitle: '',
    sourceType: 'music',
    options: ['', '', '', ''],
    timestamp: '',
    contextClues: [],
    snippetDuration: 1,
    audioQuality: 'standard',
    volumeLevel: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!question.question || !question.audioSnippetUrl || !question.sourceTitle) {
      alert('Please fill in all required fields');
      return;
    }

    if (!question.options?.every(option => option.trim())) {
      alert('Please fill in all answer options');
      return;
    }

    onSubmit({
      ...question,
      type: 'one-second'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OneSecondQuestionForm
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