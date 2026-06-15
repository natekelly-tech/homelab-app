import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { MetricRow } from '@/components/MetricRow';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Colors,
  Radius,
  Spacing,
  Typography,
  statusColor,
} from '@/constants/theme';
import { getBackendUrl } from '@/src/storage/backend';

type ServiceStatus = 'up' | 'down' | 'degraded';

interface ServiceResult {
  name: string;
  status: ServiceStatus;
  type: string;
  response_time_ms: number;
  status_code: number;
  target: string;
}

interface StatusResponse {
  up: number;
  down: number;
  total: number;
  results?: ServiceResult[];
  services?: ServiceResult[];
}

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const serviceName = safeDecode(name ?? '');

  const [service, setService] = useState<ServiceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchService = useCallback(async () => {
    try {
      setError(null);
      const backendUrl = await getBackendUrl();
      const response = await fetch(backendUrl + '/status');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data: StatusResponse = await response.json();
      const list = data.results ?? data.services ?? [];
      const match = list.find((s) => s.name === serviceName);
      if (!match) throw new Error('Service not found');
      setService(match);
      setLastChecked(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serviceName]);

  useEffect(() => { fetchService(); }, [fetchService]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchService();
  }, [fetchService]);

  if (loading && !service) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Loading..." onBack={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !service) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title={serviceName} onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load service</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => { setLoading(true); fetchService(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={service.name} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        <Card accent={statusColor(service.status)}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>CURRENT STATUS</Text>
              <Text style={[styles.heroStatus, { color: statusColor(service.status) }]}>
                {service.status.toUpperCase()}
              </Text>
              <Text style={styles.heroSub}>{service.response_time_ms} ms response</Text>
            </View>
            <StatusBadge status={service.status} />
          </View>
          {lastChecked && <Text style={styles.lastChecked}>Last checked {lastChecked.toLocaleTimeString()}</Text>}
        </Card>

        <Card>
          <MetricRow label="Target" value={service.target} />
          <MetricRow label="Check type" value={service.type.toUpperCase()} />
          <MetricRow label="HTTP status" value={String(service.status_code)} />
          <MetricRow label="Response time" value={service.response_time_ms + ' ms'} />
        </Card>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
        <Text style={styles.backText}>{String.fromCharCode(8249)} Back</Text>
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function safeDecode(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { paddingVertical: Spacing.xs, paddingRight: Spacing.sm, width: 60 },
  backText: { color: Colors.accent, fontSize: 16, fontWeight: Typography.weightMedium },
  headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: Typography.sizeHeading, fontWeight: Typography.weightBold, textAlign: 'center' },
  headerSpacer: { width: 60 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroLabel: { color: Colors.textSecondary, fontSize: Typography.sizeCaption, letterSpacing: 1.2, marginBottom: Spacing.xs },
  heroStatus: { fontSize: 32, fontWeight: Typography.weightBold, letterSpacing: 1 },
  heroSub: { color: Colors.textSecondary, fontSize: Typography.sizeBody, marginTop: Spacing.xs },
  lastChecked: { marginTop: Spacing.sm, color: Colors.textSecondary, fontSize: Typography.sizeCaption },
  errorText: { color: Colors.textPrimary, fontSize: Typography.sizeLabel, fontWeight: Typography.weightBold, marginBottom: Spacing.xs },
  errorSubtext: { color: Colors.textSecondary, fontSize: Typography.sizeBody, textAlign: 'center', marginBottom: Spacing.lg },
  retryButton: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  retryText: { color: Colors.textInverted, fontWeight: Typography.weightBold },
});