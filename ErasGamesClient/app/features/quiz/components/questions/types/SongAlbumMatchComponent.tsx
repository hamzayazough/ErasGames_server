import React from 'react';
import { SongAlbumMatchQuestion } from '../../../../../shared/interfaces/questions/song-album-match.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { MatchingComponent } from '../common/MatchingComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

interface SongAlbumMatchComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: SongAlbumMatchQuestion;
}

export const SongAlbumMatchComponent: React.FC<SongAlbumMatchComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const handleMatchChange = (matches: Record<string, string>) => {
    onAnswerChange(matches);
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <MatchingComponent
        leftItems={question.prompt.left}
        rightItems={question.prompt.right}
        matches={selectedAnswer || {}}
        onMatchChange={handleMatchChange}
        disabled={disabled}
        showCorrect={showCorrect}
        correctMatches={correctAnswer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  questionText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    letterSpacing: 0.5,
  },
});