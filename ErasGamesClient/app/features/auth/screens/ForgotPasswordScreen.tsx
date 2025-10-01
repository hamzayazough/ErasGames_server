import React, {useState} from 'react';
import {StyleSheet, Alert, Image, ScrollView, Dimensions} from 'react-native';
import {useTranslation} from 'react-i18next';
import {View, Text, Button, Input, Card} from '../../../ui';
import {useTheme, ThemedBackground} from '../../../core/theme';
import {useAuth} from '../../../core/context/AuthContext';
import type {RootStackScreenProps} from '../../../navigation/types';

const {width, height} = Dimensions.get('window');

type Props = RootStackScreenProps<'ForgotPassword'>;

export default function ForgotPasswordScreen({navigation}: Props) {
  const {t} = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { sendPasswordResetEmail } = useAuth();
  
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setEmailSent(true);
      Alert.alert(
        'Reset Email Sent! ✨',
        'Check your email for the magical reset link. If you don\'t see it, check your spam folder!',
        [{
          text: 'Got it!',
          onPress: () => navigation.navigate('Login')
        }]
      );
    } catch (error: any) {
      let errorMessage = 'Something went wrong';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a moment and try again';
      }
      
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setIsLoading(false);
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
              <Text variant="heading2" align="center" style={[styles.welcomeText, {color: theme.colors.text}]}>
                🔮 Forgot Your Spell? 🔮
              </Text>
              <Text variant="body" align="center" style={[styles.subtitleText, {color: theme.colors.textSecondary}]}>
                No worries! We'll help you cast a new one
              </Text>
            </View>
          </View>

          {/* Reset Form Card */}
          <Card style={[styles.resetCard, {backgroundColor: theme.colors.card}]}>
            <View style={styles.formHeader}>
              <Text variant="heading3" align="center" style={[styles.formTitle, {color: theme.colors.text}]}>
                ✨ Spell Recovery Center
              </Text>
              <Text variant="body" align="center" style={[styles.formDescription, {color: theme.colors.textSecondary}]}>
                Enter your email and we'll send you a magical link to reset your password
              </Text>
            </View>
            
            <View style={styles.formContent}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your magical email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                editable={!emailSent}
              />
              
              {!emailSent ? (
                <Button
                  title={isLoading ? "🪄 Casting recovery spell..." : "🚀 Send Reset Link"}
                  onPress={handleResetPassword}
                  loading={isLoading}
                  style={styles.resetButton}
                  textStyle={{color: '#FFFFFF'}}
                />
              ) : (
                <View style={styles.successContainer}>
                  <Text variant="body" align="center" style={[styles.successText, {color: theme.colors.success}]}>
                    ✅ Magic link sent to your email!
                  </Text>
                  <Text variant="caption" align="center" style={[styles.successSubtext, {color: theme.colors.textSecondary}]}>
                    Check your inbox and spam folder
                  </Text>
                </View>
              )}
            </View>
          </Card>
          
          {/* Back to Login Section */}
          <View style={styles.backSection}>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, {borderColor: theme.colors.borderLight}]} />
              <Text variant="caption" style={[styles.dividerText, {color: theme.colors.textSecondary}]}>
                ⭐ Remember your spell? ⭐
              </Text>
              <View style={[styles.divider, {borderColor: theme.colors.borderLight}]} />
            </View>
            
            <Button
              title="🎮 Back to Sign In"
              variant="outline"
              onPress={navigateToLogin}
              style={[styles.backButton, {borderColor: theme.colors.primary}]}
            />
          </View>

          {/* Helpful Tips */}
          <Card style={[styles.tipsCard, {backgroundColor: 'rgba(255, 255, 255, 0.1)'}]}>
            <View style={styles.tipsContent}>
              <Text variant="body" align="center" style={[styles.tipsTitle, {color: theme.colors.text}]}>
                💡 Helpful Tips
              </Text>
              <Text variant="caption" style={[styles.tipText, {color: theme.colors.textSecondary}]}>
                • Check your spam/junk folder if you don't see the email
              </Text>
              <Text variant="caption" style={[styles.tipText, {color: theme.colors.textSecondary}]}>
                • The reset link expires in 24 hours for security
              </Text>
              <Text variant="caption" style={[styles.tipText, {color: theme.colors.textSecondary}]}>
                • Make sure the email address is correct
              </Text>
            </View>
          </Card>
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
  resetCard: {
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
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  formContent: {
    padding: 24,
  },
  input: {
    marginBottom: 20,
  },
  resetButton: {
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
  successContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(152, 251, 152, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(152, 251, 152, 0.3)',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 14,
  },
  backSection: {
    alignItems: 'center',
    marginBottom: 30,
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
  backButton: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    borderWidth: 2,
    // Add subtle glow
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsCard: {
    borderRadius: 15,
    padding: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipsContent: {
    padding: 20,
    alignItems: 'center',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
});