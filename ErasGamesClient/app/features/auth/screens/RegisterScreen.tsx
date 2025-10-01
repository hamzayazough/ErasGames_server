import React, {useState} from 'react';
import {StyleSheet, Alert, Image, ScrollView, Dimensions} from 'react-native';
import {useTranslation} from 'react-i18next';
import {View, Text, Button, Input, Card} from '../../../ui';
import {useTheme, ThemedBackground} from '../../../core/theme';
import {useAuth} from '../../../core/context/AuthContext';
import type {RootStackScreenProps} from '../../../navigation/types';

const {width, height} = Dimensions.get('window');

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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Magical Title Section */}
          <View style={styles.titleSection}>
            <Image
              source={require('../../../assets/images/main-erasgames-title.png')}
              style={styles.titleImage}
              resizeMode="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text variant="body" align="center" style={[styles.subtitleText, {color: theme.colors.textSecondary}]}>
                Create your account and start the adventure
              </Text>
            </View>
          </View>

          {/* Registration Form Card */}
          <Card style={[styles.registerCard, {backgroundColor: theme.colors.card}]}>
            <View style={styles.formHeader}>
              <Text variant="heading3" align="center" style={[styles.formTitle, {color: theme.colors.text}]}>
                Create Your Account
              </Text>
            </View>
            
            <View style={styles.formContent}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create your password (6+ characters)"
                secureTextEntry
                style={styles.input}
              />
              
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                secureTextEntry
                style={styles.input}
              />
              
              {/* Password strength indicator */}
              <View style={styles.passwordHints}>
                <Text variant="caption" style={[styles.hintText, {
                  color: password.length >= 6 ? theme.colors.success : theme.colors.textMuted
                }]}>
                  • At least 6 characters {password.length >= 6 ? '✓' : ''}
                </Text>
                <Text variant="caption" style={[styles.hintText, {
                  color: password && confirmPassword && password === confirmPassword ? theme.colors.success : theme.colors.textMuted
                }]}>
                  • Passwords match {password && confirmPassword && password === confirmPassword ? '✓' : ''}
                </Text>
              </View>
              
              <Button
                title={isLoading ? "✨ Creating..." : "Create My Account"}
                onPress={handleRegister}
                loading={isLoading}
                textStyle={[styles.registerButtonText, {color: theme.colors.textOnPrimary}]}
              />
            </View>
          </Card>
          
          {/* Login Section */}
          <View style={styles.loginSection}>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, {borderColor: theme.colors.borderLight}]} />
              <Text variant="caption" style={[styles.dividerText, {color: theme.colors.textSecondary}]}>
                ⭐ Already have an account? ⭐
              </Text>
              <View style={[styles.divider, {borderColor: theme.colors.borderLight}]} />
            </View>
            
            <Button
              title="Sign In to Your Account"
              variant="outline"
              onPress={navigateToLogin}
              textStyle={[styles.loginButtonText, {color: theme.colors.primary}]}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleImage: {
    width: width * 0.8,
    height: width * 0.3,
    marginBottom: 20,
    // Add subtle glow effect
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    fontSize: 16,
    fontStyle: 'italic',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  registerCard: {
    marginBottom: 30,
    borderRadius: 20,
    padding: 0,
    // Enhanced shadow for magical effect
    shadowColor: '#E6E6FA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 182, 193, 0.3)',
  },
  formHeader: {
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 182, 193, 0.2)',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  formContent: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  passwordHints: {
    marginBottom: 20,
    paddingLeft: 10,
  },
  hintText: {
    fontSize: 12,
    marginBottom: 2,
  },
  registerButton: {
    marginTop: 10,
    borderRadius: 15,
    height: 50,
    // Add magical glow
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginSection: {
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: 'transparent',
    // Add subtle glow
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});