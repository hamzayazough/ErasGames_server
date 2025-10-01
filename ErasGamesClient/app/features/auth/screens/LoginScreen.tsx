import React, {useState} from 'react';
import {StyleSheet, Alert, Image, ScrollView, Dimensions} from 'react-native';
import {useTranslation} from 'react-i18next';
import {View, Text, Button, Input, Card} from '../../../ui';
import {useTheme, ThemedBackground} from '../../../core/theme';
import {useAuth} from '../../../core/context/AuthContext';
import type {RootStackScreenProps} from '../../../navigation/types';

const {width, height} = Dimensions.get('window');

type Props = RootStackScreenProps<'Login'>;

export default function LoginScreen({navigation}: Props) {
  const {t} = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { signIn, isLoading } = useAuth();
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      await signIn(email.trim(), password);
      // Navigation is handled automatically by the auth state change
    } catch (error: any) {
      let errorMessage = 'Something went wrong';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      Alert.alert('Login Failed', errorMessage);
    }
  };
  
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };
  
  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
                ✨ Welcome Back! ✨
              </Text>
              <Text variant="body" align="center" style={[styles.subtitleText, {color: theme.colors.textSecondary}]}>
                Step into the magical world of quizzes
              </Text>
            </View>
          </View>

          {/* Login Form Card */}
          <Card style={[styles.loginCard, {backgroundColor: theme.colors.card}]}>
            <View style={styles.formHeader}>
              <Text variant="heading3" align="center" style={[styles.formTitle, {color: theme.colors.text}]}>
                🎮 Sign In to Play
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
              />
              
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your secret spell"
                secureTextEntry
                style={styles.input}
              />
              
              <Button
                title={isLoading ? "✨ Casting spell..." : "🚀 Enter the Game"}
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
                textStyle={{color: '#FFFFFF'}}
              />
              
              <Button
                title="🔮 Forgot Your Spell?"
                variant="ghost"
                onPress={navigateToForgotPassword}
                style={styles.forgotButton}
              />
            </View>
          </Card>
          
          {/* Sign Up Section */}
          <View style={styles.signupSection}>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, {borderColor: theme.colors.borderLight}]} />
              <Text variant="caption" style={[styles.dividerText, {color: theme.colors.textSecondary}]}>
                ⭐ New to the magic? ⭐
              </Text>
              <View style={[styles.divider, {borderColor: theme.colors.borderLight}]} />
            </View>
            
            <Button
              title="🌟 Create Your Adventure"
              variant="outline"
              onPress={navigateToRegister}
              style={[styles.signupButton, {borderColor: theme.colors.primary}]}
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
  loginCard: {
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
  },
  formContent: {
    padding: 24,
  },
  input: {
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 15,
    height: 50,
    // Add magical glow
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  forgotButton: {
    marginBottom: 0,
  },
  signupSection: {
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
  signupButton: {
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
});