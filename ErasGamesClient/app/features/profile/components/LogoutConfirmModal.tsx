import React from 'react';
import { Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { View, Text } from '../../../ui';
import { useTheme } from '../../../core/theme';

interface LogoutConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ 
  visible, 
  onCancel, 
  onConfirm 
}: LogoutConfirmModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.logoutModalOverlay}>
        <View style={[styles.logoutModalContainer, { backgroundColor: theme.colors.card }]}>
          <Text variant="h3" weight="bold" color="text" style={styles.logoutModalTitle}>
            Sign Out
          </Text>
          <Text variant="body" color="textSecondary" style={styles.logoutModalMessage}>
            Are you sure you want to sign out? You'll need to log in again to access your account.
          </Text>
          
          <View style={styles.logoutModalActions}>
            <TouchableOpacity
              style={[styles.logoutModalButton, styles.logoutModalCancelButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={onCancel}
            >
              <Text variant="body" weight="medium" style={{ color: theme.colors.text }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.logoutModalButton, styles.logoutModalConfirmButton, { backgroundColor: theme.colors.error }]}
              onPress={onConfirm}
            >
              <Text variant="body" weight="medium" style={{ color: theme.colors.textOnPrimary }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoutModalContainer: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutModalTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  logoutModalMessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutModalCancelButton: {
    borderWidth: 1,
  },
  logoutModalConfirmButton: {
    // No additional styles needed
  },
});