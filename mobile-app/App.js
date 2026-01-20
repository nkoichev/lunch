import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { fetchLunchOrders } from './services/googleSheets';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [summary, setSummary] = useState([]);

  const loadData = async () => {
    try {
      const data = await fetchLunchOrders();
      setOrders(data.orders);
      setSummary(data.summary);
      setLastUpdate(new Date().toLocaleString('bg-BG'));
    } catch (error) {
      Alert.alert('Грешка', 'Неуспешно зареждане на данните: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Зареждане на поръчки...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" backgroundColor="#0066cc" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ Обедни Поръчки</Text>
        {lastUpdate && (
          <Text style={styles.lastUpdate}>Последна промяна: {lastUpdate}</Text>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Section */}
        {summary.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Обобщение по имена</Text>
            {summary.map((item, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryName}>{item.Client}</Text>
                <Text style={styles.summaryTotal}>{item.total.toFixed(2)} лв</Text>
              </View>
            ))}
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Orders Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>Всички поръчки</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colClient]}>Клиент</Text>
            <Text style={[styles.tableHeaderText, styles.colRestaurant]}>Ресторант</Text>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Описание</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Цена</Text>
            <Text style={[styles.tableHeaderText, styles.colQuant]}>Бр.</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Общо</Text>
          </View>

          {/* Table Rows */}
          {orders.map((order, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
              ]}
            >
              <Text style={[styles.tableCellText, styles.colClient]}>{order.Client}</Text>
              <Text style={[styles.tableCellText, styles.colRestaurant]}>{order.restorant}</Text>
              <Text style={[styles.tableCellText, styles.colDesc]}>{order.desc}</Text>
              <Text style={[styles.tableCellText, styles.colPrice]}>
                {order.disc_price ? order.disc_price.toFixed(2) : order.price.toFixed(2)}
              </Text>
              <Text style={[styles.tableCellText, styles.colQuant]}>{order.quant}</Text>
              <Text style={[styles.tableCellText, styles.colTotal, styles.totalBold]}>
                {order.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄 Обнови данните</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryName: {
    fontSize: 16,
    color: '#333',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  tableContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },
  tableRowOdd: {
    backgroundColor: '#fff',
  },
  tableCellText: {
    fontSize: 12,
    color: '#333',
  },
  colClient: {
    flex: 2,
  },
  colRestaurant: {
    flex: 2,
  },
  colDesc: {
    flex: 3,
  },
  colPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  colQuant: {
    flex: 1,
    textAlign: 'center',
  },
  colTotal: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalBold: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
  refreshButton: {
    backgroundColor: '#0066cc',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
