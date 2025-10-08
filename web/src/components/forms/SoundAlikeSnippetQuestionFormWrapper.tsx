import { useState } from 'react';
import { SoundAlikeSnippetQuestionForm as SoundAlikeSnippetQuestionFormType } from '@/lib/types/question-forms';
import SoundAlikeSnippetQuestionForm from './SoundAlikeSnippetQuestionForm';

interface SoundAlikeSnippetQuestionFormWrapperProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function SoundAlikeSnippetQuestionFormWrapper({ onSubmit, isSubmitting }: SoundAlikeSnippetQuestionFormWrapperProps) {
  const [question, setQuestion] = useState<Partial<SoundAlikeSnippetQuestionFormType>>({
    type: 'sound-alike-snippet',
    difficulty: 'medium',
    era: '',
    question: '',
    audioUrl: '',
    audioFilename: '',
    correctWord: '',
    soundAlikeOptions: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!question.question || !question.audioUrl || !question.correctWord) {
      alert('Please fill in all required fields');
      return;
    }

    if (!question.soundAlikeOptions?.length) {
      alert('Please add at least one sound-alike option');
      return;
    }

    onSubmit({
      ...question,
      type: 'sound-alike-snippet'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SoundAlikeSnippetQuestionForm
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