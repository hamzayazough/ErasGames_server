import React, {useState} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {useTranslation} from 'react-i18next';
import {View, Text, Button, Input, Card} from '../../../ui';
import {useTheme, ThemedBackground} from '../../../core/theme';
import {useAuth} from '../../../core/context/AuthContext';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'Register'>;

export default function RegisterScreen({navigation}: Props) {
  const {t} = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { signUp, isLoading } = useAuth();
  
  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    try {
      await signUp(email.trim(), password);
      // Navigation is handled automatically by the auth state change
    } catch (error: any) {
      let errorMessage = 'Something went wrong';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    }
  };
  
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };
  
  return (
    <ThemedBackground style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="heading1" align="center" style={styles.title}>
            🎮 ErasGames
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
            {t('auth.create_account')}
          </Text>
        </View>
        
        <Card style={styles.form}>
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.email_placeholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.password_placeholder')}
            secureTextEntry
            style={styles.input}
          />
          
          <Input
            label={t('auth.confirm_password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('auth.confirm_password_placeholder')}
            secureTextEntry
            style={styles.input}
          />
          
          <Button
            title={t('auth.sign_up')}
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />
        </Card>
        
        <View style={styles.footer}>
          <Text variant="caption" color="secondary" align="center">
            {t('auth.have_account')}
          </Text>
          <Button
            title={t('auth.login')}
            variant="outline"
            onPress={navigateToLogin}
            style={styles.loginButton}
          />
        </View>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 0,
  },
  form: {
    padding: 24,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  loginButton: {
    marginTop: 16,
    width: '100%',
  },
});