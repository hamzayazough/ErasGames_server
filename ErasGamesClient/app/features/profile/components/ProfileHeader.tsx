import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { View, Text } from '../../../ui';
import { useTheme } from '../../../core/theme';
import { UserProfile } from '../../../core/api/user';

interface ProfileHeaderProps {
  profile: UserProfile;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onLogout: () => void;
}

export default function ProfileHeader({ 
  profile, 
  editing, 
  onEdit, 
  onCancel, 
  onLogout 
}: ProfileHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text variant="h2" weight="bold" style={{ color: theme.colors.textOnPrimary }}>
            {(profile.name || profile.handle || 'U')[0].toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.profileInfo}>
        <Text variant="h3" weight="bold" color="text" center>
          {profile.name || 'No Name Set'}
        </Text>
        <Text variant="body" color="textSecondary" center>
          @{profile.handle || 'no-handle'}
        </Text>
        <Text variant="caption" color="textMuted" center>
          Joined {new Date(profile.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[
            styles.editButton, 
            { 
              backgroundColor: editing ? theme.colors.error : theme.colors.primary,
              borderColor: editing ? theme.colors.error : theme.colors.primary,
            }
          ]}
          onPress={editing ? onCancel : onEdit}
        >
          <Text variant="body" weight="semibold" style={{ color: theme.colors.textOnPrimary }}>
            {editing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.editButton, 
            { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.error,
            }
          ]}
          onPress={onLogout}
        >
          <Text variant="body" weight="semibold" style={{ color: theme.colors.error }}>
            Log Off
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});