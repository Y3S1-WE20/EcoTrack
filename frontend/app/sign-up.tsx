import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('SignUp component mounted');
    console.log('isLoaded:', isLoaded);
    console.log('signUp object:', !!signUp);
  }, [isLoaded, signUp]);

  const onSignUpPress = React.useCallback(async () => {
    if (!isLoaded || !signUp || loading) {
      console.log('SignUp not ready or already loading');
      return;
    }

    if (!emailAddress.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating sign up with email:', emailAddress);
      
      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
      });

      console.log('Sign up created, preparing email verification');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      console.log('Email verification prepared, showing verification screen');
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', JSON.stringify(err, null, 2));
      Alert.alert('Sign Up Error', err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, emailAddress, password, loading]);

  const onPressVerify = React.useCallback(async () => {
    if (!isLoaded || !signUp || loading) {
      console.log('SignUp not ready or already loading');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting email verification with code:', code);
      
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      console.log('Verification response:', completeSignUp.status);

      if (completeSignUp.status === 'complete') {
        console.log('Verification complete, setting active session');
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(tabs)');
      } else {
        console.log('Verification incomplete:', JSON.stringify(completeSignUp, null, 2));
        Alert.alert('Verification Failed', 'Please check your code and try again');
      }
    } catch (err: any) {
      console.error('Verification error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, code, setActive, loading]);

  const onResendCode = React.useCallback(async () => {
    if (!isLoaded || !signUp || loading) return;

    setLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert('Success', 'Verification code sent again to your email');
    } catch (err: any) {
      console.error('Resend error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, loading]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">
        {!pendingVerification ? 'Sign Up for EcoTrack' : 'Verify Your Email'}
      </ThemedText>
      
      {!pendingVerification ? (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={onSignUpPress}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/sign-in">
              <Text style={styles.link}>Sign in</Text>
            </Link>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.instructionText}>
            Please enter the verification code sent to your email
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={onPressVerify}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, loading && { opacity: 0.6 }]} 
            onPress={onResendCode}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              {loading ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});