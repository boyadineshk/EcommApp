// app/screens/PaymentResult.tsx (Updated)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaymentResult() {
  const { status, amount, id, error, demo } = useLocalSearchParams();
  const router = useRouter();

  const goHome = () => {
    router.replace('/(tabs)');
  };

  const goToOrders = () => {
    // You can implement an orders screen later
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {status === 'success' ? (
        <>
          <Text style={[styles.icon, { color: '#2ecc71' }]}>✅</Text>
          <Text style={styles.title}>
            {demo === 'true' ? 'Demo Payment Successful!' : 'Payment Successful!'}
          </Text>
          <Text style={styles.detail}>Amount: ₹{Number(amount).toFixed(2)}</Text>
          <Text style={styles.detail}>Transaction ID: {id}</Text>
          {demo === 'true' && (
            <Text style={styles.demoNote}>This was a demo transaction</Text>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={goToOrders}>
            <Text style={styles.btnText}>View Orders</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.icon, { color: '#e74c3c' }]}>❌</Text>
          <Text style={styles.title}>
            {demo === 'true' ? 'Demo Payment Failed' : 'Payment Failed'}
          </Text>
          <Text style={styles.detail}>{error}</Text>
          {demo === 'true' && (
            <Text style={styles.demoNote}>This was a demo transaction</Text>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={goHome}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
        <Text style={styles.secondaryBtnText}>Back to Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  icon: {
    fontSize: 80,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333'
  },
  detail: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 8,
    lineHeight: 22
  },
  demoNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
    minWidth: 150,
    alignItems: 'center',
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#3498db',
    minWidth: 150,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryBtnText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600'
  },
});