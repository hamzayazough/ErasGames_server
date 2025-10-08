import React from 'react';
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import {View, Text, Button} from '../../ui';
import {useTheme} from '../../core/theme';

const {width, height} = Dimensions.get('window');

interface DailyQuizNotificationModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  quizId?: string;
  dropTime?: string;
  onPlayNow: () => void;
  onLater: () => void;
  onClose: () => void;
}

export default function DailyQuizNotificationModal({
  visible,
  title = '🎵 Daily Quiz is Ready!',
  message = "Today's Taylor Swift quiz is now available. Test your knowledge!",
  quizId,
  dropTime,
  onPlayNow,
  onLater,
  onClose,
}: DailyQuizNotificationModalProps) {
  const theme = useTheme();
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out
      scaleValue.setValue(0);
    }
  }, [visible, scaleValue]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.card,
              transform: [{scale: scaleValue}],
            },
          ]}
        >
          {/* Sparkle Header */}
          <View style={styles.headerContainer}>
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={styles.sparkle}>💜</Text>
              <Text style={styles.sparkle}>✨</Text>
            </View>
            
            {/* Musical Note Icon */}
            <View style={[styles.iconContainer, {backgroundColor: theme.colors.primary + '20'}]}>
              <Text style={styles.musicIcon}>🎵</Text>
            </View>
            
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={styles.sparkle}>💖</Text>
              <Text style={styles.sparkle}>✨</Text>
            </View>
          </View>

          {/* Title */}
          <Text
            variant="heading2"
            weight="bold"
            style={[styles.title, {color: theme.colors.text}]}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            variant="body"
            style={[styles.message, {color: theme.colors.textSecondary}]}
          >
            {message}
          </Text>

          {/* Quiz Info */}
          {dropTime && (
            <View style={[styles.infoContainer, {backgroundColor: theme.colors.primary + '10'}]}>
              <Text style={[styles.infoText, {color: theme.colors.primary}]}>
                🕒 Available now • Ready to play!
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size="lg"
              title="PLAY NOW"
              onPress={onPlayNow}
              style={[styles.playButton, {backgroundColor: theme.colors.primary}]}
              textStyle={styles.playButtonText}
            />
            
            <TouchableOpacity
              style={[styles.laterButton, {borderColor: theme.colors.border}]}
              onPress={onLater}
              activeOpacity={0.7}
            >
              <Text style={[styles.laterButtonText, {color: theme.colors.textSecondary}]}>
                Later
              </Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.closeButtonText, {color: theme.colors.textSecondary}]}>
              ✕
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: width * 0.9,
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 182, 193, 0.3)',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  sparkleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sparkle: {
    fontSize: 16,
    opacity: 0.8,
  },
  iconContainer: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicIcon: {
    fontSize: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 32,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  playButton: {
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  laterButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});