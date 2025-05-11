import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Login() {
  const { isDark } = useTheme();
  const { login, register, isAuthenticated } = useAuth();
  const theme = getTheme(isDark);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated]);

  // Check if passwords match in real-time
  useEffect(() => {
    if (!isLogin && password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword, isLogin]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!isLogin && !name) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && !confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      setPasswordsMatch(false);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await register(
          name, 
          email,
          password,
          confirmPassword
        );
        
        // Display success message
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: response.message || 'You can now login with your credentials',
          position: 'bottom'
        });
        
        // Switch to login form after successful registration
        setIsLogin(true);
        resetForm();
      } catch (error) {
        // Display error message
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error instanceof Error ? error.message : 'An unexpected error occurred',
          position: 'bottom'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await login(email, password);
        
        // Display success message
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: response.message || 'Welcome back!',
          position: 'bottom',
          visibilityTime: 2000
        });
        
        // Navigate to home screen
        setTimeout(() => {
          router.replace('/home');
        }, 1000);
      } catch (error) {
        // Display error message
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: error instanceof Error ? error.message : 'Invalid email or password',
          position: 'bottom'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google authentication here
    Toast.show({
      type: 'info',
      text1: 'Google Login',
      text2: 'Google login is not implemented yet',
      position: 'bottom'
    });
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setPasswordsMatch(true);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetForm();
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
            <View style={[styles.inputWrapper, { borderColor: errors.name ? theme.error : theme.border }]}>
              <Ionicons name="person-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your name"
                placeholderTextColor={isDark ? '#aaa' : '#999'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            {errors.name && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>
            )}
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
          <View style={[styles.inputWrapper, { borderColor: errors.email ? theme.error : theme.border }]}>
            <Ionicons name="mail-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#aaa' : '#999'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.email && (
            <Text style={[styles.errorText, { color: theme.error }]}>{errors.email}</Text>
          )}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
          <View style={[styles.inputWrapper, { borderColor: errors.password ? theme.error : theme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? '#aaa' : '#999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              disabled={isLoading}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={isDark ? '#aaa' : '#666'} 
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={[styles.errorText, { color: theme.error }]}>{errors.password}</Text>
          )}
        </View>
        
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, { 
              borderColor: errors.confirmPassword ? theme.error : 
                (!passwordsMatch && confirmPassword ? theme.error : theme.border) 
            }]}>
              <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Confirm your password"
                placeholderTextColor={isDark ? '#aaa' : '#999'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={isDark ? '#aaa' : '#666'} 
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.confirmPassword}</Text>
            )}
            {!passwordsMatch && confirmPassword && !errors.confirmPassword && (
              <Text style={[styles.errorText, { color: theme.error }]}>Passwords do not match</Text>
            )}
            {passwordsMatch && password && confirmPassword && (
              <Text style={[styles.matchText, { color: theme.accent }]}>Passwords match!</Text>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.loginButton, 
            { 
              backgroundColor: theme.primary,
              opacity: isLoading ? 0.7 : 1 
            }
          ]} 
          onPress={isLogin ? handleLogin : handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.orContainer}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Text style={[styles.orText, { color: isDark ? '#aaa' : '#666' }]}>OR</Text>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>
        
        <TouchableOpacity 
          style={[styles.googleButton, { borderColor: theme.border, backgroundColor: isDark ? '#212130' : '#f8f9fa' }]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <Ionicons name="logo-google" size={20} color={theme.text} />
          <Text style={[styles.googleButtonText, { color: theme.text }]}>Continue with Google</Text>
        </TouchableOpacity>
        
        <View style={styles.signupContainer}>
          <Text style={[styles.noAccountText, { color: isDark ? '#ccc' : '#666' }]}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={toggleAuthMode} disabled={isLoading}>
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  matchText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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