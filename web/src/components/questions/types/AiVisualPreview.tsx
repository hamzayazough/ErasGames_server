'use client';

import { AiVisualRenderer } from './AiVisualRenderer';
import { AiVisualQuestion } from '@/lib/types/interfaces/questions/ai-visual.interface';

// Example question matching your desired structure
const exampleQuestion: AiVisualQuestion = {
  id: '8',
  questionType: 'ai-visual',
  difficulty: 'easy',
  themes: ['visual', 'ai'],
  subjects: ['albums'],
  prompt: {
    task: 'Which album cover is shown in this AI-generated image?',
  },
  mediaRefs: [
    {
      type: 'image',
      url: 'https://httpbin.org/image/jpeg',
    },
  ],
  choices: [
    {id: '1', text: 'Midnights'},
    {id: '2', text: 'folklore'},
    {id: '3', text: 'evermore'},
    {id: '4', text: 'Lover'},
  ],
  correct: {
    index: 1
  },
};

export function AiVisualPreview() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">AI Visual Question - Normal View</h2>
        <AiVisualRenderer question={exampleQuestion} showAnswer={false} />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">AI Visual Question - With Answer</h2>
        <AiVisualRenderer question={exampleQuestion} showAnswer={true} />
      </div>
    </div>
  );
}