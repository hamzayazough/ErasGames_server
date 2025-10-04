'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
import { AnyQuestion } from '@/lib/types/interfaces/questions/any-question.type';
import { allQuizMocks } from '@/lib/constants/quizMocks';

export default function QuestionPage() {
  const params = useParams();
  const questionId = params.questionId as string;
  const [question, setQuestion] = useState<AnyQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Find question in mock data (in real app, this would be an API call)
    const findQuestionById = (id: string): AnyQuestion | null => {
      for (const quiz of allQuizMocks) {
        const foundQuestion = quiz.questions.find(q => q.id === id);
        if (foundQuestion) {
          return foundQuestion;
        }
      }
      return null;
    };

    try {
      const foundQuestion = findQuestionById(questionId);
      if (foundQuestion) {
        setQuestion(foundQuestion);
      } else {
        setError('Question not found');
      }
    } catch (err) {
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <Text className="text-center">Loading question...</Text>
        </Card>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <Text className="text-center text-red-600 mb-4">
            {error || 'Question not found'}
          </Text>
          <Button 
            onClick={() => window.history.back()}
            className="w-full"
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-4 mb-2">
            <Text variant="h1">Question Preview</Text>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              question.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {question.difficulty}
            </span>
          </div>
          <Text variant="body" className="text-gray-600">
            Question ID: {question.id} • Type: {question.questionType}
          </Text>
          {question.themes && (
            <div className="flex gap-2 mt-2">
              {question.themes.map((theme, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Question Content */}
        <QuestionRenderer question={question} />
      </div>
    </div>
  );
}