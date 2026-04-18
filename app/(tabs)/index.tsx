import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const API_URL = 'https://api.auxcon.dev';

type ServiceResult = {
  name: string;
  status: 'up' | 'down';
  type: string;
  target: string;
  response_time_ms: number | null;
  status_code: number | null;
};

type ApiResponse = {
  total: number;
  up: number;
  down: number;
  results: ServiceResult[];
};

export default function DashboardScreen() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/status`);
      const json = await response.json();
      setData(json);
      setError(null);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (e) {
      setError('Could not reach the API.\nMake sure your Flask server is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Checking services...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStatus}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>LabWatch</Text>
      <Text style={styles.subtitle}>Last checked: {lastChecked}</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryNumber, { color: '#60a5fa' }]}>{data?.total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryNumber, { color: '#4ade80' }]}>{data?.up}</Text>
          <Text style={styles.summaryLabel}>Online</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryNumber, { color: '#f87171' }]}>{data?.down}</Text>
          <Text style={styles.summaryLabel}>Offline</Text>
        </View>
      </View>

      <FlatList
        data={data?.results}
        keyExtractor={(item) => item.name}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />
        }
        renderItem={({ item }) => (
          <View style={[styles.card, item.status === 'up' ? styles.cardUp : styles.cardDown]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{item.name}</Text>
              <View style={[styles.badge, item.status === 'up' ? styles.badgeUp : styles.badgeDown]}>
                <Text style={[styles.badgeText, { color: item.status === 'up' ? '#4ade80' : '#f87171' }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDetail}>
              Target: <Text style={styles.cardValue}>{item.target}</Text>
            </Text>
            <Text style={styles.cardDetail}>
              Response: <Text style={styles.cardValue}>
                {item.response_time_ms !== null ? `${item.response_time_ms} ms` : 'N/A'}
              </Text>
            </Text>
            <Text style={styles.cardDetail}>
              HTTP: <Text style={styles.cardValue}>
                {item.status_code !== null ? item.status_code : 'Unreachable'}
              </Text>
            </Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.refreshButton} onPress={fetchStatus}>
        <Text style={styles.refreshText}>Refresh Now</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0f1117',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardUp:   { borderLeftColor: '#4ade80' },
  cardDown: { borderLeftColor: '#f87171' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeUp:   { backgroundColor: '#14532d' },
  badgeDown: { backgroundColor: '#450a0a' },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDetail: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  cardValue: {
    color: '#aaa',
  },
  loadingText: {
    color: '#666',
    marginTop: 12,
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2a2d3a',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#aaa',
  },
  refreshButton: {
    backgroundColor: '#1a1d27',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 12,
  },
  refreshText: {
    color: '#aaa',
    fontSize: 14,
  },
});
