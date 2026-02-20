import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';
import {ThemeColors} from '../styles/colors';

interface SignUpScreenProps {
  onGoToSignIn: () => void;
}

export default function SignUpScreen({onGoToSignIn}: SignUpScreenProps) {
  const {handleSignUp, handleConfirmSignUp} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  // Tracks whether we're on the sign-up form or the verification step
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const onSubmitSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await handleSignUp(email, password);
      // Sign-up succeeded — Cognito sent a verification code to the email
      setNeedsConfirmation(true);
      Alert.alert('Check your email', 'We sent a verification code to ' + email);
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      await handleConfirmSignUp(email, code);
      Alert.alert('Success', 'Account verified! You can now sign in.', [
        {text: 'OK', onPress: onGoToSignIn},
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verification code step
  if (needsConfirmation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSubmitCode}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Sign-up form
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FormTracker</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSubmitSignUp}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToSignIn}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.link}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.background,
      padding: 24,
      paddingTop: 100,
      paddingBottom: 40,
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    form: {
      padding: 20,
      marginTop: 20,
    },
    input: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 14,
      fontSize: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.textPrimary,
    },
    button: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      backgroundColor: colors.highlight,
    },
    buttonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: '800',
    },
    linkText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 14,
      color: colors.textSecondary,
    },
    link: {
      color: colors.accent,
      fontWeight: '700',
    },
  });
