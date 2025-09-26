/**
 * Quiz Results Screen - Shows quiz completion results
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { QuizSubmission } from '../../core/services/quiz-attempt.service';

interface QuizResultsScreenProps {
  result: QuizSubmission;
  onContinue: () => void;
}

export const QuizResultsScreen: React.FC<QuizResultsScreenProps> = ({ 
  result, 
  onContinue 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#34C759'; // Green
    if (score >= 60) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Outstanding! 🌟';
    if (score >= 80) return 'Excellent work! 🎉';
    if (score >= 70) return 'Great job! 👏';
    if (score >= 60) return 'Good effort! 💪';
    return 'Keep practicing! 📚';
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 30, marginTop: 40 }}>
        <Text style={{ 
          fontSize: 32, 
          fontWeight: 'bold',
          color: getScoreColor(result.score),
          marginBottom: 8 
        }}>
          {result.score}%
        </Text>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600',
          textAlign: 'center',
          color: '#333'
        }}>
          {getScoreMessage(result.score)}
        </Text>
      </View>

      {/* Results Card */}
      <Card style={{ marginBottom: 24, padding: 24 }}>
        <Text style={{ 
          fontSize: 20, 
          fontWeight: '600', 
          textAlign: 'center',
          marginBottom: 20 
        }}>
          Quiz Complete!
        </Text>

        {/* Stats */}
        <View style={{ gap: 16 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E7'
          }}>
            <Text style={{ fontSize: 16, color: '#666' }}>Score</Text>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600',
              color: getScoreColor(result.score)
            }}>
              {result.score}%
            </Text>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E7'
          }}>
            <Text style={{ fontSize: 16, color: '#666' }}>Correct Answers</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
              {result.correctAnswers} of {result.totalQuestions}
            </Text>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            paddingVertical: 8
          }}>
            <Text style={{ fontSize: 16, color: '#666' }}>Completed</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
              {new Date(result.submittedAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
      </Card>

      {/* Performance Insight */}
      <Card style={{ marginBottom: 24, padding: 20, backgroundColor: '#F2F2F7' }}>
        <Text style={{ 
          fontSize: 16, 
          textAlign: 'center',
          color: '#666',
          lineHeight: 22
        }}>
          {result.score >= 80 
            ? "You're a true Swiftie! Your Taylor Swift knowledge is impressive. 🎵"
            : result.score >= 60
            ? "Good job! Keep listening to more Taylor Swift to improve your score. 🎶"
            : "There's always room to grow! Listen to more Taylor Swift and try again tomorrow. 💕"
          }
        </Text>
      </Card>

      {/* Action Button */}
      <Button
        title="Continue"
        onPress={onContinue}
        variant="primary"
        style={{ 
          paddingVertical: 16,
          borderRadius: 12
        }}
      />

      {/* Footer */}
      <Text style={{ 
        textAlign: 'center', 
        color: '#999', 
        fontSize: 14,
        marginTop: 20 
      }}>
        Come back tomorrow for a new daily quiz!
      </Text>
    </View>
  );
};