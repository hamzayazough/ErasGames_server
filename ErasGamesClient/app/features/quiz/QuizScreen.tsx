/**
 * Quiz Screen - Active quiz taking interface
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { 
  QuizAttemptService, 
  QuizAttempt, 
  QuizStatus, 
  QuizAnswer, 
  QuizSubmission 
} from '../../core/services/quiz-attempt.service';

interface QuizScreenProps {
  onQuizComplete: (result: QuizSubmission) => void;
  onQuizExit: () => void;
}

// Mock quiz questions for testing
const mockQuestions = [
  {
    index: 0,
    question: "What is Taylor Swift's middle name?",
    options: ["Alison", "Anne", "Alice", "Amber"],
    correct: "Alison"
  },
  {
    index: 1,
    question: "Which album features the song 'All Too Well'?",
    options: ["Fearless", "Red", "1989", "Folklore"],
    correct: "Red"
  },
  {
    index: 2,
    question: "In what year was '1989' released?",
    options: ["2012", "2013", "2014", "2015"],
    correct: "2014"
  }
];

export const QuizScreen: React.FC<QuizScreenProps> = ({ onQuizComplete, onQuizExit }) => {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [status, setStatus] = useState<QuizStatus | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Start quiz attempt on component mount
  useEffect(() => {
    startQuiz();
  }, []);

  // Timer effect to update time remaining
  useEffect(() => {
    if (!attempt?.attemptId) return;

    const interval = setInterval(async () => {
      try {
        const status = await QuizAttemptService.getAttemptStatus(attempt.attemptId);
        setStatus(status);
        setTimeRemaining(status.timeRemaining);

        if (status.isTimeUp) {
          handleTimeUp();
        }
      } catch (error) {
        console.error('Error updating quiz status:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt?.attemptId]);

  const startQuiz = async () => {
    try {
      setIsLoading(true);
      const quizAttempt = await QuizAttemptService.startAttempt();
      setAttempt(quizAttempt);
      setTimeRemaining(quizAttempt.timeLimit);
      
      // Get initial status
      const initialStatus = await QuizAttemptService.getAttemptStatus(quizAttempt.attemptId);
      setStatus(initialStatus);
    } catch (error) {
      console.error('Error starting quiz:', error);
      Alert.alert('Error', 'Failed to start quiz. Please try again.');
      onQuizExit();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (selectedAnswer: string) => {
    const newAnswer: QuizAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer: selectedAnswer,
    };

    // Update answers array
    const updatedAnswers = [...answers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionIndex === currentQuestionIndex);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }
    
    setAnswers(updatedAnswers);

    // Auto-advance to next question or submit
    setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmitQuiz(updatedAnswers);
      }
    }, 500);
  };

  const handleSubmitQuiz = async (finalAnswers: QuizAnswer[] = answers) => {
    if (!attempt) return;

    try {
      setIsSubmitting(true);
      const result = await QuizAttemptService.submitAttempt(attempt.attemptId, finalAnswers);
      onQuizComplete(result);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      'Your quiz time has expired. Submitting your current answers.',
      [{ text: 'OK', onPress: () => handleSubmitQuiz() }]
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, textAlign: 'center' }}>
          Starting your quiz...
        </Text>
      </View>
    );
  }

  if (isSubmitting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, textAlign: 'center' }}>
          Submitting your answers...
        </Text>
      </View>
    );
  }

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const selectedAnswer = answers.find(a => a.questionIndex === currentQuestionIndex)?.selectedAnswer;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      {/* Header with timer and progress */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20 
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          Question {currentQuestionIndex + 1} of {mockQuestions.length}
        </Text>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: timeRemaining < 60 ? '#FF3B30' : '#007AFF'
        }}>
          {QuizAttemptService.formatTimeRemaining(timeRemaining)}
        </Text>
      </View>

      {/* Question Card */}
      <Card style={{ marginBottom: 24, padding: 20 }}>
        <Text style={{ 
          fontSize: 20, 
          fontWeight: '600', 
          textAlign: 'center',
          marginBottom: 20 
        }}>
          {currentQuestion.question}
        </Text>

        {/* Answer Options */}
        <View style={{ gap: 12 }}>
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              title={option}
              onPress={() => handleAnswerSelect(option)}
              variant={selectedAnswer === option ? 'primary' : 'secondary'}
              style={{
                padding: 16,
                borderRadius: 12,
              }}
            />
          ))}
        </View>
      </Card>

      {/* Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button
          title="Exit Quiz"
          onPress={onQuizExit}
          variant="secondary"
          style={{ flex: 1, marginRight: 10 }}
        />
        
        {currentQuestionIndex === mockQuestions.length - 1 && answers.length === mockQuestions.length && (
          <Button
            title="Submit Quiz"
            onPress={() => handleSubmitQuiz()}
            variant="primary"
            style={{ flex: 1, marginLeft: 10 }}
          />
        )}
      </View>
    </View>
  );
};