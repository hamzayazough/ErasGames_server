import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'StartQuiz'>;

export default function StartQuizScreen({navigation}: Props) {
  const theme = useTheme();
  const [joinWindowTime, setJoinWindowTime] = useState({
    minutes: 47,
    seconds: 23,
  });

  // Mock countdown timer for join window
  useEffect(() => {
    const interval = setInterval(() => {
      setJoinWindowTime(prev => {
        if (prev.seconds > 0) {
          return {...prev, seconds: prev.seconds - 1};
        } else if (prev.minutes > 0) {
          return {...prev, minutes: prev.minutes - 1, seconds: 59};
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartQuiz = () => {
    Alert.alert(
      '🎵 Ready to Begin?',
      'Choose from different quiz types to test various question formats!',
      [
        {text: 'Not Yet', style: 'cancel'},
        {text: 'Choose Quiz!', onPress: () => navigation.navigate('QuizSelection')},
      ]
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading1" align="center" style={[styles.title, {color: theme.colors.primary}]}>
            🌟 Era Time!
          </Text>
          <Text variant="body" align="center" style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            The daily drop is live! You have 1 hour to join.
          </Text>
        </View>

        {/* Join Window Card */}
        <Card style={[styles.joinCard, {backgroundColor: theme.colors.card, borderColor: theme.colors.primary}]}>
          <View style={styles.joinContent}>
            <Text variant="heading2" align="center" style={[styles.joinTitle, {color: theme.colors.text}]}>
              ⏰ Join Window
            </Text>
            
            {/* Time remaining */}
            <View style={styles.timeContainer}>
              <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent1}]}>
                <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                  {joinWindowTime.minutes.toString().padStart(2, '0')}
                </Text>
                <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                  MINUTES
                </Text>
              </View>
              
              <Text variant="heading1" style={[styles.separator, {color: theme.colors.primary}]}>:</Text>
              
              <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent2}]}>
                <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                  {joinWindowTime.seconds.toString().padStart(2, '0')}
                </Text>
                <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                  SECONDS
                </Text>
              </View>
            </View>

            <Text variant="caption" align="center" style={[styles.windowNote, {color: theme.colors.textSecondary}]}>
              Time remaining to press "Start"
            </Text>
          </View>
        </Card>

        {/* Quiz Details */}
        <Card style={[styles.detailsCard, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.detailsContent}>
            <Text variant="heading3" align="center" style={[styles.detailsTitle, {color: theme.colors.text}]}>
              📚 Today's Quiz Details
            </Text>
            
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailEmoji, {color: theme.colors.accent1}]}>🎭</Text>
                <View style={styles.detailTextContainer}>
                  <Text variant="body" style={[styles.detailText, {color: theme.colors.text}]}>
                    <Text style={[styles.detailLabel, {color: theme.colors.primary}]}>Theme:</Text> Current Era
                  </Text>
                  <Text variant="caption" style={[styles.detailSubtext, {color: theme.colors.textSecondary}]}>
                    Questions themed around your selected era
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailEmoji, {color: theme.colors.accent2}]}>📝</Text>
                <View style={styles.detailTextContainer}>
                  <Text variant="body" style={[styles.detailText, {color: theme.colors.text}]}>
                    <Text style={[styles.detailLabel, {color: theme.colors.primary}]}>Questions:</Text> 6 total
                  </Text>
                  <Text variant="caption" style={[styles.detailSubtext, {color: theme.colors.textSecondary}]}>
                    3 easy • 2 medium • 1 hard
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailEmoji, {color: theme.colors.accent3}]}>⏱️</Text>
                <View style={styles.detailTextContainer}>
                  <Text variant="body" style={[styles.detailText, {color: theme.colors.text}]}>
                    <Text style={[styles.detailLabel, {color: theme.colors.primary}]}>Time Limit:</Text> 10 minutes
                  </Text>
                  <Text variant="caption" style={[styles.detailSubtext, {color: theme.colors.textSecondary}]}>
                    +2 min Basic • +4 min Premium
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailEmoji, {color: theme.colors.accent4}]}>💎</Text>
                <View style={styles.detailTextContainer}>
                  <Text variant="body" style={[styles.detailText, {color: theme.colors.text}]}>
                    <Text style={[styles.detailLabel, {color: theme.colors.primary}]}>Scoring:</Text> Accuracy + Speed + Early Bonus
                  </Text>
                  <Text variant="caption" style={[styles.detailSubtext, {color: theme.colors.textSecondary}]}>
                    Starting early gives bonus points!
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Power-ups Available */}
        <Card style={[styles.powerupsCard, {backgroundColor: theme.colors.card}]}>
          <View style={styles.powerupsContent}>
            <Text variant="heading3" align="center" style={[styles.powerupsTitle, {color: theme.colors.text}]}>
              ✨ Available Power-ups
            </Text>
            
            <View style={styles.powerupsList}>
              <View style={[styles.powerupItem, {backgroundColor: theme.colors.surface}]}>
                <Text style={styles.powerupEmoji}>💡</Text>
                <Text variant="caption" style={[styles.powerupText, {color: theme.colors.text}]}>
                  3 Hints Available
                </Text>
              </View>
              
              <View style={[styles.powerupItem, {backgroundColor: theme.colors.surface}]}>
                <Text style={styles.powerupEmoji}>🔄</Text>
                <Text variant="caption" style={[styles.powerupText, {color: theme.colors.text}]}>
                  1 Retry Left
                </Text>
              </View>
              
              <View style={[styles.powerupItem, {backgroundColor: theme.colors.surface}]}>
                <Text style={styles.powerupEmoji}>⏰</Text>
                <Text variant="caption" style={[styles.powerupText, {color: theme.colors.text}]}>
                  +2 Min Bonus
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="🚀 Start Quiz!"
            onPress={handleStartQuiz}
            style={[styles.startButton, {backgroundColor: theme.colors.primary}]}
          />
          
          <Button
            title="← Back to Daily Drop"
            onPress={goBack}
            variant="outline"
            style={styles.backButton}
          />
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  joinCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderRadius: 20,
  },
  joinContent: {
    padding: 24,
  },
  joinTitle: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timeBlock: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  timeNumber: {
    fontWeight: 'bold',
    fontSize: 32,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 1,
  },
  separator: {
    fontWeight: 'bold',
    fontSize: 28,
    marginHorizontal: 8,
  },
  windowNote: {
    fontSize: 14,
  },
  detailsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
  },
  detailsContent: {
    padding: 20,
  },
  detailsTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  detailsList: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  detailSubtext: {
    fontSize: 14,
  },
  powerupsCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 16,
  },
  powerupsContent: {
    padding: 20,
  },
  powerupsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  powerupsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  powerupItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  powerupEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  powerupText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButtons: {
    marginHorizontal: 24,
    gap: 12,
  },
  startButton: {
    paddingVertical: 16,
  },
  backButton: {
    marginBottom: 0,
  },
  bottomPadding: {
    height: 40,
  },
});