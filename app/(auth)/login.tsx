import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

export default function Login() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = () => {
    // Here you would implement your authentication logic
    console.log('Login with:', email, password);
    // For now, we'll just navigate to the home screen
    router.replace({pathname: '/home'});
  };

  const handleSignup = () => {
    // Implement signup logic here
    console.log('Signup with:', {
      name,
      email,
      password,
      confirm_password: confirmPassword
    });
    // For now, we'll just navigate to the home screen
    router.replace({pathname: '/home'});
  };

  const handleGoogleLogin = () => {
    // Implement Google authentication here
    console.log('Login with Google');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/klyptik.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        
        <Text style={[styles.welcomeText, { color: theme.text }]}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
          {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
        </Text>
        
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
              <Ionicons name="person-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your name"
                placeholderTextColor={isDark ? '#aaa' : '#999'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
            <Ionicons name="mail-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#aaa' : '#999'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? '#aaa' : '#999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={isDark ? '#aaa' : '#666'} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Confirm your password"
                placeholderTextColor={isDark ? '#aaa' : '#999'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={isDark ? '#aaa' : '#666'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: theme.primary }]} 
          onPress={isLogin ? handleLogin : handleSignup}
        >
          <Text style={styles.loginButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
        </TouchableOpacity>
        
        <View style={styles.orContainer}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Text style={[styles.orText, { color: isDark ? '#aaa' : '#666' }]}>OR</Text>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>
        
        <TouchableOpacity 
          style={[styles.googleButton, { borderColor: theme.border, backgroundColor: isDark ? '#212130' : '#f8f9fa' }]}
          onPress={handleGoogleLogin}
        >
          <Ionicons name="logo-google" size={20} color={theme.text} />
          <Text style={[styles.googleButtonText, { color: theme.text }]}>Continue with Google</Text>
        </TouchableOpacity>
        
        <View style={styles.signupContainer}>
          <Text style={[styles.noAccountText, { color: isDark ? '#ccc' : '#666' }]}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={toggleAuthMode}>
            <Text style={[styles.signupText, { color: theme.primary }]}>
              {isLogin ? "Sign Up" : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    marginBottom: 32,
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noAccountText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 