import React from 'react';
import { Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { View, Text } from '../../ui';
import { useTheme } from '../../core/theme';

const { width } = Dimensions.get('window');

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  closeButtonText?: string;
}

export default function ErrorModal({ 
  visible, 
  title = "Oops! Something went wrong",
  message,
  onClose,
  closeButtonText = "Try Again"
}: ErrorModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.errorIcon}>😔</Text>
          </View>
          
          {/* Title */}
          <Text variant="heading3" align="center" style={[styles.modalTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          
          {/* Message */}
          <Text variant="body" align="center" style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>
          
          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text variant="body" style={[styles.actionButtonText, { color: theme.colors.textOnPrimary }]}>
              {closeButtonText}
            </Text>
          </TouchableOpacity>
        </View>
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
    // Enhanced shadow for magical effect
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
  iconContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 99, 132, 0.1)',
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    // Add magical glow
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});