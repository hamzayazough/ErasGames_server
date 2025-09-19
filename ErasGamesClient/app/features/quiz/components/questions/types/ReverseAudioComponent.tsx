import React, { useState } from 'react';
import { ReverseAudioQuestion } from '../../../../../shared/interfaces/questions/reverse-audio.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface ReverseAudioComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: ReverseAudioQuestion;
}

export const ReverseAudioComponent: React.FC<ReverseAudioComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleSongSelect = (songIndex: number) => {
    onAnswerChange({ songIndex });
  };

  const handlePlayAudio = () => {
    // TODO: Implement actual audio playback
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000); // Simulate 3-second playback
  };

  const getSongStyle = (index: number) => {
    const isSelected = selectedAnswer?.songIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.songIndex;
    const isWrong = showCorrect && index === selectedAnswer?.songIndex && index !== correctAnswer?.songIndex;

    if (isCorrect) {
      return [styles.songOption, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.songOption, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.songOption, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }];
    } else {
      return [styles.songOption, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }];
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      <View style={[styles.audioContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="body" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          🔄 Listen to the reversed audio clip
        </Text>
        
        <Pressable
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlayAudio}
          disabled={disabled || isPlaying}
        >
          <Text style={[styles.playButtonText, { color: theme.colors.textOnPrimary }]}>
            {isPlaying ? '🔄 Playing...' : '▶️ Play Reversed Audio'}
          </Text>
        </Pressable>

        {isPlaying && (
          <View style={styles.playingIndicator}>
            <Text variant="caption" style={[styles.playingText, { color: theme.colors.primary }]}>
              🎵 Audio playing in reverse...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.songOptions}>
        <Text variant="heading4" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Which song is this?
        </Text>
        
        {question.songs?.map((song, index) => (
          <Pressable
            key={index}
            style={getSongStyle(index)}
            onPress={() => !disabled && handleSongSelect(index)}
            disabled={disabled}
          >
            <Text variant="body" style={[styles.songText, { color: theme.colors.text }]}>
              {song}
            </Text>
          </Pressable>
        )) || (
          <Text variant="body" style={[styles.noSongsText, { color: theme.colors.textSecondary }]}>
            No song options available
          </Text>
        )}
      </View>

      {showHint && question.hint && (
        <View style={[styles.hintContainer, { backgroundColor: theme.colors.warning + '20' }]}>
          <Text variant="caption" style={[styles.hintText, { color: theme.colors.text }]}>
            💡 Hint: {question.hint}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  audioContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 16,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  playButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  playingIndicator: {
    marginTop: 8,
  },
  playingText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  songOptions: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  songOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  songText: {
    fontSize: 15,
    fontWeight: '500',
  },
  noSongsText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hintContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});