import React from 'react';
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {View, Text, Button} from '../../ui';
import {useTheme} from '../../core/theme';

const {width} = Dimensions.get('window');

interface GenericNotificationModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
  onAction?: () => void;
}

export default function GenericNotificationModal({
  visible,
  title = 'Notification',
  message = 'You have a new notification',
  buttonText = 'OK',
  onClose,
  onAction,
}: GenericNotificationModalProps) {
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

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

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
          {/* Title */}
          <Text
            variant="heading3"
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

          {/* Action Button */}
          <Button
            variant="primary"
            size="md"
            title={buttonText}
            onPress={handleAction}
            style={[styles.actionButton, {backgroundColor: theme.colors.primary}]}
          />

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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: width * 0.9,
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 182, 193, 0.3)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
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