/**
 * app/(tabs)/settings.tsx
 * LabWatch — Settings Screen
 * Step A of the pivot roadmap.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getBackendUrl,
  setBackendUrl,
  resetBackendUrl,
  DEFAULT_BACKEND_URL,
} from '../../src/storage/backend';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
} from '../../constants/theme';

type TestState = 'idle' | 'testing' | 'ok' | 'error';

export default function SettingsScreen() {
  const [url, setUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [testState, setTestState] = useState<TestState>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    getBackendUrl().then((u) => {
      setUrl(u);
      setSavedUrl(u);
    });
  }, []);

  const testConnection = async () => {
    setTestState('testing');
    setTestMessage('');
    try {
      const clean = url.trim().replace(/\/+$/, '');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${clean}/status`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const count = data.results?.length ?? data.services?.length ?? 0;
      setTestState('ok');
      setTestMessage(`Connected — ${count} service${count !== 1 ? 's' : ''} found`);
    } catch (err: any) {
      setTestState('error');
      setTestMessage(err?.message ?? 'Could not reach the backend');
    }
  };

  const save = async () => {
    await setBackendUrl(url);
    setSavedUrl(url.trim().replace(/\/+$/, ''));
    setTestState('idle');
    setTestMessage('');
  };

  const reset = async () => {
    await resetBackendUrl();
    setUrl(DEFAULT_BACKEND_URL);
    setSavedUrl(DEFAULT_BACKEND_URL);
    setTestState('idle');
    setTestMessage('');
  };

  const hasChanges = url.trim().replace(/\/+$/, '') !== savedUrl;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.screenTitle}>Settings</Text>

        {/* Backend URL section */}
        <Text style={styles.sectionLabel}>BACKEND</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Backend URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://api.auxcon.dev"
            placeholderTextColor={Colors.textDisabled}
          />

          {testMessage !== '' && (
            <Text style={[
              styles.testMessage,
              { color: testState === 'ok' ? Colors.statusUp : Colors.statusDown }
            ]}>
              {testMessage}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={testConnection}
              disabled={testState === 'testing'}
            >
              {testState === 'testing'
                ? <ActivityIndicator size="small" color={Colors.accent} />
                : <Text style={styles.buttonSecondaryText}>
                    {testState === 'ok' ? '✓ Connected' : 'Test Connection'}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, !hasChanges && styles.buttonDisabled]}
              onPress={save}
              disabled={!hasChanges}
            >
              <Text style={styles.buttonPrimaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active backend info */}
        <Text style={styles.sectionLabel}>ACTIVE</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current backend</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{savedUrl}</Text>
          </View>
          <TouchableOpacity onPress={reset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset to default</Text>
          </TouchableOpacity>
        </View>

        {/* About section */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App version</Text>
            <Text style={styles.infoValue}>0.1.0</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>API contract</Text>
            <Text style={styles.infoValue}>v1.0</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>Default backend</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{DEFAULT_BACKEND_URL}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: Typography.sizeCaption,
    color: Colors.textSecondary,
    fontWeight: Typography.weightBold,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.sizeCaption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: Typography.sizeBody,
    fontFamily: Typography.mono,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  testMessage: {
    fontSize: Typography.sizeCaption,
    fontFamily: Typography.mono,
    marginBottom: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  buttonPrimary: {
    backgroundColor: Colors.accent,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPrimaryText: {
    color: Colors.textInverted,
    fontSize: Typography.sizeBody,
    fontWeight: Typography.weightBold,
  },
  buttonSecondaryText: {
    color: Colors.accent,
    fontSize: Typography.sizeBody,
    fontWeight: Typography.weightMedium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoLabel: {
    fontSize: Typography.sizeBody,
    color: Colors.textPrimary,
  },
  infoValue: {
    fontSize: Typography.sizeCaption,
    color: Colors.textSecondary,
    fontFamily: Typography.mono,
    maxWidth: '60%',
    textAlign: 'right',
  },
  resetButton: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  resetButtonText: {
    color: Colors.statusDown,
    fontSize: Typography.sizeBody,
    textAlign: 'center',
  },
});