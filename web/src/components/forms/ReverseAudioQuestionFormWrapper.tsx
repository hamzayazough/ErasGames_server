import { useState } from 'react';
import { ReverseAudioQuestionForm as ReverseAudioQuestionFormType } from '@/lib/types/question-forms';
import ReverseAudioQuestionForm from './ReverseAudioQuestionForm';

interface ReverseAudioQuestionFormWrapperProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function ReverseAudioQuestionFormWrapper({ onSubmit, isSubmitting }: ReverseAudioQuestionFormWrapperProps) {
  const [question, setQuestion] = useState<Partial<ReverseAudioQuestionFormType>>({
    type: 'reverse-audio',
    difficulty: 'medium',
    era: '',
    question: '',
    reverseAudioUrl: '',
    audioFilename: '',
    originalWord: '',
    options: ['', '', '', ''],
    wordClues: [],
    reverseSpeed: 1,
    audioQuality: 'standard'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!question.question || !question.reverseAudioUrl || !question.originalWord) {
      alert('Please fill in all required fields');
      return;
    }

    if (!question.options?.every(option => option.trim())) {
      alert('Please fill in all answer options');
      return;
    }

    onSubmit({
      ...question,
      type: 'reverse-audio'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ReverseAudioQuestionForm
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