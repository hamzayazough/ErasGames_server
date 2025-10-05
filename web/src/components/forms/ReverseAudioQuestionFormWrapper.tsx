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
    themes: ['audio', 'trivia'],
    subjects: ['songs'],
    task: 'Identify the song from this reversed audio clip',
    audioUrl: '',
    audioFilename: '',
    choices: ['Love Story', 'You Belong With Me', 'Shake It Off', '22'],
    correctAnswerIndex: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!question.task || !question.audioUrl) {
      alert('Please fill in all required fields');
      return;
    }

    if (!question.choices?.every(choice => choice.trim())) {
      alert('Please fill in all answer choices');
      return;
    }

    if (question.correctAnswerIndex === undefined || question.correctAnswerIndex < 0) {
      alert('Please select the correct answer');
      return;
    }

    // Transform to match the desired structure
    const transformedData = {
      questionType: 'reverse-audio',
      difficulty: question.difficulty || 'medium',
      themes: question.themes || ['audio', 'trivia'],
      subjects: question.subjects || ['songs'],
      prompt: {
        task: question.task
      },
      mediaRefs: [{
        type: 'audio',
        url: question.audioUrl
      }],
      choices: question.choices,
      correct: {
        index: question.correctAnswerIndex
      }
    };

    onSubmit(transformedData);
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