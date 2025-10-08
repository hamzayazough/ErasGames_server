'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
import { AnyQuestion } from '@/lib/types/interfaces/questions/any-question.type';
import { questionService } from '@/lib/services/question.service';

export default function QuestionPage() {
  const params = useParams();
  const questionId = params.questionId as string;
  const [question, setQuestion] = useState<AnyQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent double execution
    if (question) return;
    
    const loadQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to get the question from sessionStorage (passed from list page)
        const storedQuestion = sessionStorage.getItem(`question-${questionId}`);
        
        console.log('Question ID:', questionId);
        console.log('Stored question raw:', storedQuestion);
        
        if (storedQuestion) {
          console.log('Loading question from sessionStorage');
          const apiQuestion = JSON.parse(storedQuestion);
          console.log('Parsed question from sessionStorage:', apiQuestion);
          
          // Check if we have valid question data
          if (!apiQuestion || !apiQuestion.id) {
            throw new Error('Invalid question data from sessionStorage');
          }
          
          // Transform API response to match our interface structure
          const transformedQuestion: AnyQuestion = {
            id: apiQuestion.id,
            questionType: apiQuestion.questionType,
            difficulty: apiQuestion.difficulty,
            themes: apiQuestion.themesJSON || [],
            subjects: apiQuestion.subjectsJSON || [],
            prompt: apiQuestion.promptJSON || {},
            choices: apiQuestion.choicesJSON || [],
            correct: apiQuestion.correctJSON || {},
            mediaRefs: apiQuestion.mediaJSON || [],
            // Add any additional properties that might exist
            ...(apiQuestion.hint && { hint: apiQuestion.hint }),
            ...(apiQuestion.approved !== undefined && { approved: apiQuestion.approved }),
            ...(apiQuestion.disabled !== undefined && { disabled: apiQuestion.disabled }),
          };
          
          console.log('Transformed question from sessionStorage:', transformedQuestion);
          setQuestion(transformedQuestion);
          
          // Clean up sessionStorage after successful load
          setTimeout(() => {
            sessionStorage.removeItem(`question-${questionId}`);
          }, 100);
          
        } else {
          // Fallback: fetch from API if not found in sessionStorage (direct URL access)
          console.log('Question not found in sessionStorage, fetching from API');
          const response = await questionService.getQuestionById(questionId);
          const apiQuestion = response.data;
          
          if (!apiQuestion || !apiQuestion.id) {
            throw new Error('Invalid question data received from API');
          }
          
          // Transform API response to match our interface structure
          const transformedQuestion: AnyQuestion = {
            id: apiQuestion.id,
            questionType: apiQuestion.questionType,
            difficulty: apiQuestion.difficulty,
            themes: apiQuestion.themesJSON || [],
            subjects: apiQuestion.subjectsJSON || [],
            prompt: apiQuestion.promptJSON || {},
            choices: apiQuestion.choicesJSON || [],
            correct: apiQuestion.correctJSON || {},
            mediaRefs: apiQuestion.mediaJSON || [],
            // Add any additional properties that might exist
            ...(apiQuestion.hint && { hint: apiQuestion.hint }),
            ...(apiQuestion.approved !== undefined && { approved: apiQuestion.approved }),
            ...(apiQuestion.disabled !== undefined && { disabled: apiQuestion.disabled }),
          };
          
          setQuestion(transformedQuestion);
        }
        
      } catch (err: any) {
        console.error('Failed to load question:', err);
        setError(err.message || 'Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    if (questionId && !question) {
      loadQuestion();
    }
  }, [questionId, question]);

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
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
              <Text className="font-semibold">Debug Info:</Text>
              <Text>Question ID: {questionId}</Text>
              <Text>API Endpoint: /questions/{questionId}</Text>
              <Text>Error: {error}</Text>
            </div>
          )}
          <div className="space-y-2">
            <Button 
              onClick={() => window.history.back()}
              className="w-full"
              variant="outline"
            >
              ← Go Back
            </Button>
            <Button 
              onClick={() => window.location.href = '/questions'}
              className="w-full"
            >
              View All Questions
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
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