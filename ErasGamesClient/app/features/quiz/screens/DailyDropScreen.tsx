import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView, StatusBar} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import {EraSelector} from '../../../core/components/EraSelector';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'DailyDrop'>;

export default function DailyDropScreen({navigation}: Props) {
  const theme = useTheme();
  const [timeUntilDrop, setTimeUntilDrop] = useState({
    hours: 3,
    minutes: 42,
    seconds: 15,
  });

  // Mock countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilDrop(prev => {
        if (prev.seconds > 0) {
          return {...prev, seconds: prev.seconds - 1};
        } else if (prev.minutes > 0) {
          return {...prev, minutes: prev.minutes - 1, seconds: 59};
        } else if (prev.hours > 0) {
          return {...prev, hours: prev.hours - 1, minutes: 59, seconds: 59};
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const navigateToStartQuiz = () => {
    navigation.navigate('StartQuiz');
  };

  const navigateToResults = () => {
    navigation.navigate('Results');
  };

  const navigateToQuiz = () => {
    navigation.navigate('Quiz');
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading1" align="center" style={[styles.appTitle, {color: theme.colors.primary}]}>
            ✨ Eras Quiz ✨
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
            It's Era Time! Daily drops await...
          </Text>
        </View>

        {/* Main Drop Card */}
        <Card style={[styles.dropCard, {backgroundColor: theme.colors.card, borderColor: theme.colors.primary}]}>
          <View style={styles.dropContent}>
            <Text variant="heading2" align="center" style={[styles.dropTitle, {color: theme.colors.primary}]}>
              🌙 Tonight's Drop
            </Text>
            
            {/* Countdown */}
            <View style={styles.countdownContainer}>
              <Text variant="caption" align="center" style={[styles.countdownLabel, {color: theme.colors.textSecondary}]}>
                Next drop in your local time window (6:00 PM - 10:00 PM)
              </Text>
              
              <View style={styles.timeContainer}>
                <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent1}]}>
                  <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                    {timeUntilDrop.hours.toString().padStart(2, '0')}
                  </Text>
                  <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                    HOURS
                  </Text>
                </View>
                
                <Text variant="heading1" style={[styles.separator, {color: theme.colors.primary}]}>:</Text>
                
                <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent2}]}>
                  <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                    {timeUntilDrop.minutes.toString().padStart(2, '0')}
                  </Text>
                  <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                    MINUTES
                  </Text>
                </View>
                
                <Text variant="heading1" style={[styles.separator, {color: theme.colors.primary}]}>:</Text>
                
                <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent3}]}>
                  <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                    {timeUntilDrop.seconds.toString().padStart(2, '0')}
                  </Text>
                  <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                    SECONDS
                  </Text>
                </View>
              </View>
            </View>

            {/* Era hint */}
            <View style={[styles.eraHint, {backgroundColor: theme.colors.surface}]}>
              <Text variant="body" align="center" style={[styles.eraText, {color: theme.colors.text}]}>
                🎭 Tonight's theme: <Text style={[styles.eraName, {color: theme.colors.primary}]}>Folklore Era</Text>
              </Text>
              <Text variant="caption" align="center" style={[styles.eraDescription, {color: theme.colors.textSecondary}]}>
                Cottagecore vibes and indie folk questions await
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, {backgroundColor: theme.colors.card}]}>
            <Text variant="heading3" align="center" style={[styles.statNumber, {color: theme.colors.accent1}]}>
              #47
            </Text>
            <Text variant="caption" align="center" style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
              Global Rank
            </Text>
          </Card>
          
          <Card style={[styles.statCard, {backgroundColor: theme.colors.card}]}>
            <Text variant="heading3" align="center" style={[styles.statNumber, {color: theme.colors.accent2}]}>
              892
            </Text>
            <Text variant="caption" align="center" style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
              Total Score
            </Text>
          </Card>
          
          <Card style={[styles.statCard, {backgroundColor: theme.colors.card}]}>
            <Text variant="heading3" align="center" style={[styles.statNumber, {color: theme.colors.accent3}]}>
              13
            </Text>
            <Text variant="caption" align="center" style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
              Day Streak
            </Text>
          </Card>
        </View>

        {/* Era Theme Selector */}
        <EraSelector />

        {/* Development Navigation Buttons */}
        <View style={styles.devButtons}>
          <Button
            title="🚀 Go to Start Quiz (Dev)"
            onPress={navigateToStartQuiz}
            variant="outline"
            style={styles.devButton}
          />
          <Button
            title="📝 Go to Quiz Screen (Dev)"
            onPress={navigateToQuiz}
            variant="outline"
            style={styles.devButton}
          />
          <Button
            title="🏆 Go to Results (Dev)"
            onPress={navigateToResults}
            variant="outline"
            style={styles.devButton}
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
  appTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  dropCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderRadius: 20,
  },
  dropContent: {
    padding: 24,
  },
  dropTitle: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  countdownContainer: {
    marginBottom: 24,
  },
  countdownLabel: {
    marginBottom: 16,
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timeBlock: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  timeNumber: {
    fontWeight: 'bold',
    fontSize: 28,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 1,
  },
  separator: {
    fontWeight: 'bold',
    fontSize: 24,
    marginHorizontal: 4,
  },
  eraHint: {
    padding: 16,
    borderRadius: 12,
  },
  eraText: {
    fontSize: 16,
    marginBottom: 4,
  },
  eraName: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  eraDescription: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  devButtons: {
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  devButton: {
    marginBottom: 0,
  },
  bottomPadding: {
    height: 40,
  },
});