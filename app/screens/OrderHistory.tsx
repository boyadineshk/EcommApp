// app/screens/OrderHistory.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../contents/UserContext';
import { Ionicons } from '@expo/vector-icons';

export default function OrderHistory() {
  const { orders } = useUser();
  const router = useRouter();

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge,
          { backgroundColor:
            item.status === 'completed' ? '#27ae60' :
            item.status === 'cancelled' ? '#e74c3c' : '#f39c12'
          }]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.orderTotal}>₹{item.total.toFixed(2)}</Text>
      <Text style={styles.itemsCount}>{item.items.length} items</Text>

      <View style={styles.addressPreview}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.addressText} numberOfLines={1}>
          {item.address.street}, {item.address.city}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your orders will appear here</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  list: { padding: 16 },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  orderDate: { fontSize: 12, color: '#666', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  orderTotal: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c', marginBottom: 4 },
  itemsCount: { fontSize: 14, color: '#666', marginBottom: 8 },
  addressPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addressText: { fontSize: 12, color: '#666', marginLeft: 4, flex: 1 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
  shopButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  shopButtonText: { color: '#fff', fontWeight: '600' },
});