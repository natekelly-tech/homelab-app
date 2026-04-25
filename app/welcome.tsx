/**
 * app/welcome.tsx
 * LabWatch — Welcome / Onboarding Screen
 * Step C of the pivot roadmap.
 *
 * Shown only on first launch. Sets hasOnboarded flag in AsyncStorage
 * so subsequent launches go straight to the dashboard.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  setBackendUrl,
  setHasOnboarded,
  DEFAULT_BACKEND_URL,
} from '../src/storage/backend';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
} from '../constants/theme';

type Step = 'welcome' | 'enter-url';

export default function WelcomeScreen() {
  const [step, setStep] = useState<Step>('welcome');
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const handleDemo = async () => {
    await setBackendUrl(DEFAULT_BACKEND_URL);
    await setHasOnboarded();
    router.replace('/(tabs)');
  };

  const handleEnterUrl = () => {
    setStep('enter-url');
  };

  const handleConnect = async () => {
    setTesting(true);
    setError('');
    try {
      const clean = url.trim().replace(/\/+$/, '');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${clean}/status`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await setBackendUrl(clean);
      await setHasOnboarded();
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message ?? 'Could not reach that backend');
      setTesting(false);
    }
  };

  if (step === 'enter-url') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setStep('welcome')} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Enter your backend URL</Text>
          <Text style={styles.subheading}>
            Point LabWatch at your self-hosted backend.
          </Text>

          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://your-server.com"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {error !== '' && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.buttonPrimary, (!url || testing) && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={!url || testing}
          >
            {testing
              ? <ActivityIndicator color={Colors.textInverted} size="small" />
              : <Text style={styles.buttonPrimaryText}>Connect</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonGhost} onPress={handleDemo}>
            <Text style={styles.buttonGhostText}>Use demo backend instead</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.wordmarkContainer}>
          <View style={styles.wordmark}>
            <Text style={styles.wordmarkPrimary}>Lab</Text>
            <Text style={styles.wordmarkAccent}>Watch</Text>
          </View>
          <Text style={styles.tagline}>Universal infrastructure monitor</Text>
          <Text style={styles.byline}>by Auxcon Technologies</Text>
        </View>

        <View style={styles.features}>
          {[
            'Monitor any backend from your phone',
            'Self-hostable — your data stays yours',
            'Works with any LabWatch-compatible API',
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleDemo}>
            <Text style={styles.buttonPrimaryText}>Try the demo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={handleEnterUrl}>
            <Text style={styles.buttonSecondaryText}>Connect my backend</Text>
          </TouchableOpacity>

          <View style={styles.qrRow}>
            <Text style={styles.qrText}>Scan QR code — coming soon</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  backButton: {
    marginBottom: Spacing.xl,
  },
  backText: {
    color: Colors.accent,
    fontSize: Typography.sizeBody,
  },
  wordmarkContainer: {
    marginTop: Spacing.xxl,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  wordmarkPrimary: {
    fontSize: 48,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  wordmarkAccent: {
    fontSize: 48,
    fontWeight: Typography.weightBold,
    color: Colors.accent,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: Typography.sizeLabel,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  byline: {
    fontSize: Typography.sizeCaption,
    color: Colors.textDisabled,
    fontFamily: Typography.mono,
  },
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  featureText: {
    fontSize: Typography.sizeBody,
    color: Colors.textSecondary,
    flex: 1,
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPrimaryText: {
    color: Colors.textInverted,
    fontSize: Typography.sizeLabel,
    fontWeight: Typography.weightBold,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: Colors.accent,
    fontSize: Typography.sizeLabel,
    fontWeight: Typography.weightMedium,
  },
  buttonGhost: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  buttonGhostText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizeBody,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  qrRow: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    borderStyle: 'dashed',
  },
  qrText: {
    color: Colors.textDisabled,
    fontSize: Typography.sizeBody,
  },
  heading: {
    fontSize: 24,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: Typography.sizeBody,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.sizeBody,
    fontFamily: Typography.mono,
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: Colors.statusDown,
    fontSize: Typography.sizeCaption,
    fontFamily: Typography.mono,
    marginBottom: Spacing.sm,
  },
});
