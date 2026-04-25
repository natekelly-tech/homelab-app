import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import {
  getSavedBackends,
  addSavedBackend,
  removeSavedBackend,
  getActiveBackendId,
  setActiveBackendId,
  DEMO_BACKEND,
  SavedBackend,
} from '../src/storage/backend';

export default function BackendsScreen() {
  const router = useRouter();

  const [backends, setBackends] = useState<SavedBackend[]>([]);
  const [activeId, setActiveId] = useState<string>('demo');
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const [saved, active] = await Promise.all([
      getSavedBackends(),
      getActiveBackendId(),
    ]);
    setBackends(saved);
    setActiveId(active);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // All displayable backends: demo is always first, then saved
  const allBackends: SavedBackend[] = [DEMO_BACKEND, ...backends];

  async function handleSelect(id: string) {
    await setActiveBackendId(id);
    setActiveId(id);
  }

  async function handleDelete(backend: SavedBackend) {
    Alert.alert(
      'Remove Backend',
      `Remove "${backend.label}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeSavedBackend(backend.id);
            await load();
          },
        },
      ]
    );
  }

  async function handleTestConnection() {
    const url = newUrl.trim();
    if (!url) return;
    setTesting(true);
    setTestResult('idle');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${url}/status`, { signal: controller.signal });
      clearTimeout(timer);
      setTestResult(res.ok ? 'ok' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  }

  async function handleAdd() {
    const url = newUrl.trim();
    const label = newLabel.trim() || new URL(url).hostname;
    if (!url) return;

    const backend: SavedBackend = {
      id: Date.now().toString(),
      label,
      url,
    };

    await addSavedBackend(backend);
    await setActiveBackendId(backend.id);
    setNewLabel('');
    setNewUrl('');
    setTestResult('idle');
    setAdding(false);
    await load();
  }

  const testButtonColor =
    testResult === 'ok'
      ? Colors.statusUp
      : testResult === 'fail'
      ? Colors.statusDown
      : Colors.accent;

  const testButtonLabel =
    testResult === 'ok'
      ? 'Connected'
      : testResult === 'fail'
      ? 'Failed -- Retry'
      : testing
      ? 'Testing...'
      : 'Test Connection';

  return (
  <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
    <Stack.Screen options={{ headerShown: false }} />
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Backends</Text>
          <TouchableOpacity
            onPress={() => {
              setAdding(!adding);
              setTestResult('idle');
            }}
            style={styles.addButton}
          >
            <Ionicons
              name={adding ? 'close' : 'add'}
              size={24}
              color={Colors.accent}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Add New Backend Form */}
          {adding && (
            <View style={styles.addForm}>
              <Text style={styles.sectionLabel}>ADD BACKEND</Text>
              <TextInput
                style={styles.input}
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Label (optional)"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                value={newUrl}
                onChangeText={(t) => {
                  setNewUrl(t);
                  setTestResult('idle');
                }}
                placeholder="https://your-backend.example.com"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
                autoCorrect={false}
              />
              <View style={styles.addActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: testButtonColor }]}
                  onPress={handleTestConnection}
                  disabled={testing || !newUrl.trim()}
                >
                  {testing ? (
                    <ActivityIndicator size="small" color={Colors.accent} />
                  ) : (
                    <Text style={[styles.actionButtonText, { color: testButtonColor }]}>
                      {testButtonLabel}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.saveButton,
                    { opacity: !newUrl.trim() ? 0.4 : 1 },
                  ]}
                  onPress={handleAdd}
                  disabled={!newUrl.trim()}
                >
                  <Text style={styles.saveButtonText}>Save and Activate</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Backend List */}
          <Text style={styles.sectionLabel}>SAVED BACKENDS</Text>
          {allBackends.map((backend) => {
            const isActive = backend.id === activeId;
            const isDemo = backend.id === 'demo';
            return (
              <TouchableOpacity
                key={backend.id}
                style={[styles.backendRow, isActive && styles.backendRowActive]}
                onPress={() => handleSelect(backend.id)}
                activeOpacity={0.7}
              >
                <View style={styles.backendRowLeft}>
                  <View style={styles.radioOuter}>
                    {isActive && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.backendLabel}>{backend.label}</Text>
                    <Text style={styles.backendUrl} numberOfLines={1}>
                      {backend.url}
                    </Text>
                  </View>
                </View>
                {!isDemo && (
                  <TouchableOpacity
                    onPress={() => handleDelete(backend)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={Colors.statusDown}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}

          {backends.length === 0 && !adding && (
            <Text style={styles.emptyNote}>
              No saved backends. Tap + to add one.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2433',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  addButton: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 8,
  },
  addForm: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: '#1E2433',
    borderRadius: 6,
    padding: 12,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    fontSize: 13,
    marginBottom: 10,
  },
  addActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  saveButtonText: {
    color: Colors.bg,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  backendRowActive: {
    borderColor: Colors.accent,
  },
  backendRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  backendLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  backendUrl: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  emptyNote: {
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
});