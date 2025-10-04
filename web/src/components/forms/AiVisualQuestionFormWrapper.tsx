import { useState } from 'react';
import { AiVisualQuestionForm as AiVisualQuestionFormType } from '@/lib/types/question-forms';
import AiVisualQuestionForm from './AiVisualQuestionForm';

interface AiVisualQuestionFormWrapperProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function AiVisualQuestionFormWrapper({ onSubmit, isSubmitting }: AiVisualQuestionFormWrapperProps) {
  const [question, setQuestion] = useState<Partial<AiVisualQuestionFormType>>({
    type: 'ai-visual',
    difficulty: 'medium',
    era: '',
    question: '',
    imageUrl: '',
    imageFilename: '',
    aiPrompt: '',
    correctAnswer: '',
    options: ['', '', '', '']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!question.question || !question.imageUrl || !question.aiPrompt || !question.correctAnswer) {
      alert('Please fill in all required fields');
      return;
    }

    if (!question.options?.every(option => option.trim())) {
      alert('Please fill in all answer options');
      return;
    }

    // Transform form data to match backend DTO structure
    const correctAnswerIndex = question.options?.indexOf(question.correctAnswer) || 0;
    
    const transformedData = {
      questionType: 'ai-visual',
      difficulty: question.difficulty || 'medium',
      era: question.era || '',
      prompt: {
        main_prompt: question.aiPrompt
      },
      choices: question.options?.map((option, index) => ({
        id: `choice_${index}`,
        url: question.imageUrl || '' // All choices reference the same analyzed image
      })) || [],
      correct: {
        choiceId: `choice_${correctAnswerIndex}`
      }
    };

    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AiVisualQuestionForm
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