import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded || !signIn || loading) {
      console.log('SignIn not loaded or already loading');
      return;
    }

    if (!emailAddress.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting passwordless sign in with email:', emailAddress);
      
      // Create a sign-in attempt with email code strategy
      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
      });

      console.log('Preparing email verification for sign in');
      const emailFactor = signInAttempt.supportedFirstFactors.find(
        (factor) => factor.strategy === 'email_code'
      );
      
      if (!emailFactor || !emailFactor.emailAddressId) {
        throw new Error('Email verification not supported');
      }

      await signInAttempt.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailFactor.emailAddressId,
      });

      console.log('Email verification prepared, showing verification screen');
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign in error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, emailAddress, loading]);

  const onPressVerify = React.useCallback(async () => {
    if (!isLoaded || !signIn || loading) return;

    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to verify code for sign in');
      
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: code.trim(),
      });

      if (completeSignIn.status === 'complete') {
        console.log('Sign in verification complete, setting active session');
        await setActive({ session: completeSignIn.createdSessionId });
        router.replace('/(tabs)');
      } else {
        console.log('Sign in verification incomplete:', JSON.stringify(completeSignIn, null, 2));
        Alert.alert('Verification Failed', 'Please check your code and try again');
      }
    } catch (err: any) {
      console.error('Verification error:', JSON.stringify(err, null, 2));
      Alert.alert('Verification Error', err.errors?.[0]?.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, code, setActive, loading]);

  const onResendCode = React.useCallback(async () => {
    if (!isLoaded || !signIn || loading) return;

    setLoading(true);
    try {
      console.log('Resending verification code for sign in');
      const emailFactor = signIn.supportedFirstFactors.find(
        (factor) => factor.strategy === 'email_code'
      );
      
      if (!emailFactor || !emailFactor.emailAddressId) {
        throw new Error('Email verification not supported');
      }

      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailFactor.emailAddressId,
      });
      Alert.alert('Code Sent', 'A new verification code has been sent to your email');
    } catch (err: any) {
      console.error('Resend error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, loading]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">
        {!pendingVerification ? 'Sign In to EcoTrack' : 'Verify Your Email'}
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

          <Text style={styles.infoText}>
            We'll send you a verification code to sign in. No password required!
          </Text>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={onSignInPress}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/sign-up">
              <Text style={styles.link}>Sign up</Text>
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
              {loading ? 'Verifying...' : 'Sign In'}
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
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
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