import React, {useState} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {useTranslation} from 'react-i18next';
import {View, Text, Button, Input, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import {useLogin} from '../hooks';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'Login'>;

export default function LoginScreen({navigation}: Props) {
  const {t} = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const loginMutation = useLogin();
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      await loginMutation.mutateAsync({email, password});
      // Navigation is handled automatically by the auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    }
  };
  
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };
  
  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };
  
  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="heading1" align="center" style={styles.title}>
            🎮 ErasGames
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
            {t('auth.welcome_back')}
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
          
          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={loginMutation.isPending}
            style={styles.loginButton}
          />
          
          <Button
            title={t('auth.forgot_password')}
            variant="ghost"
            onPress={navigateToForgotPassword}
            style={styles.forgotButton}
          />
        </Card>
        
        <View style={styles.footer}>
          <Text variant="caption" color="secondary" align="center">
            {t('auth.no_account')}
          </Text>
          <Button
            title={t('auth.sign_up')}
            variant="outline"
            onPress={navigateToRegister}
            style={styles.registerButton}
          />
        </View>
      </View>
    </View>
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
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotButton: {
    marginBottom: 0,
  },
  footer: {
    alignItems: 'center',
  },
  registerButton: {
    marginTop: 16,
    width: '100%',
  },
});