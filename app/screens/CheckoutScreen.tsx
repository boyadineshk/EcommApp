// app/screens/CheckoutScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contents/CartContext';
import { useUser } from '../../contents/UserContext';
import { useAuth } from '../../contents/AuthContext';
import { emailService } from '../../services/emailService';
import RazorpayCheckout from 'react-native-razorpay';

export default function CheckoutScreen() {
  const { state, dispatch } = useCart();
  const { addresses, user: userProfile, addOrder } = useUser();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const items = state.items;

  const [processing, setProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // ✅ Handle selectedAddress from route params
  useEffect(() => {
    if (params.selectedAddress) {
      try {
        const address =
          typeof params.selectedAddress === 'string'
            ? JSON.parse(params.selectedAddress)
            : params.selectedAddress;
        setSelectedAddress(address);
      } catch (error) {
        console.log('Error parsing address:', error);
      }
    }
  }, [params.selectedAddress]);

  // ✅ Auto-select default address (optimized dependencies)
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [addresses]); // ✅ removed selectedAddress dependency

  // ✅ Memoized total to avoid re-computing on each render
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // ✅ Send order confirmation email + record order
  const sendOrderConfirmation = async (orderId: string, isDemo: boolean = false) => {
    try {
      const orderDetails = {
        id: orderId,
        items: state.items,
        total,
        address: selectedAddress,
        date: new Date().toISOString(),
        paymentMethod: isDemo ? 'Demo Payment' : 'Razorpay',
      };

      addOrder({
        items: state.items,
        total,
        status: 'completed',
        address: selectedAddress,
      });

      if (authUser?.email) {
        await emailService.sendOrderConfirmation(authUser.email, orderDetails, authUser);
      }
    } catch (error) {
      console.error('Error sending order confirmation:', error);
    }
  };

  // ✅ Razorpay / demo payment handler
  const handlePayment = () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address before proceeding.');
      return;
    }

    if (!authUser) {
      Alert.alert('Authentication Required', 'Please login to complete your purchase.');
      router.push('/screens/LoginScreen');
      return;
    }

    if (total < 1) {
      Alert.alert('Minimum Order', 'Order must be at least ₹1 to proceed.');
      return;
    }

    if (typeof RazorpayCheckout.open !== 'function') {
      Alert.alert(
        'Payment Unavailable',
        'Razorpay works only in built apps. Using demo payment instead.',
        [
          { text: 'Use Demo Payment', onPress: handleDemoPayment },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setProcessing(true);
    const options = {
      key: 'rzp_test_RLjVf5Pta4ESgl',
      amount: Math.round(total * 100).toString(),
      currency: 'INR',
      name: 'Ecomm Store',
      description: 'Complete your purchase',
      prefill: {
        email: authUser?.email || 'boyadineshkumar@gmail.com',
        contact: userProfile?.phone || '9014289315',
        name: authUser?.username || 'Customer',
      },
      theme: { color: '#3498db' },
    };

    RazorpayCheckout.open(options)
      .then(async (data: any) => {
        const paymentId = data.razorpay_payment_id || `pay_${Date.now()}`;
        await sendOrderConfirmation(paymentId, false);
        dispatch({ type: 'CLEAR_CART' });
        router.push({
          pathname: '/screens/PaymentResult',
          params: { status: 'success', amount: total.toString(), id: paymentId },
        });
      })
      .catch(() => {
        router.push({
          pathname: '/screens/PaymentResult',
          params: { status: 'failure', error: 'Payment failed', amount: total.toString() },
        });
      })
      .finally(() => setProcessing(false));
  };

  // ✅ Demo payment fallback
  const handleDemoPayment = async () => {
    setProcessing(true);
    setTimeout(async () => {
      const isSuccess = Math.random() > 0.3;
      if (isSuccess) {
        const demoOrderId = `demo_${Date.now()}`;
        await sendOrderConfirmation(demoOrderId, true);
        dispatch({ type: 'CLEAR_CART' });
        router.push({
          pathname: '/screens/PaymentResult',
          params: { status: 'success', amount: total.toString(), id: demoOrderId, demo: 'true' },
        });
      } else {
        router.push({
          pathname: '/screens/PaymentResult',
          params: { status: 'failure', error: 'Demo payment failed.', demo: 'true' },
        });
      }
      setProcessing(false);
    }, 2000);
  };

  // ✅ Authentication check
  if (!authUser) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed" size={64} color="#bdc3c7" />
        <Text style={styles.emptyText}>Please login to continue</Text>
        <TouchableOpacity
          style={styles.continueShopping}
          onPress={() => router.push('/screens/LoginScreen')}
        >
          <Text style={styles.continueText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Empty cart UI
  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cart-outline" size={64} color="#bdc3c7" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.continueShopping}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.continueText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Main checkout UI
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.userWelcome}>Hello, {authUser.username}!</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.title}</Text>
              <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {!selectedAddress ? (
            <TouchableOpacity
              style={styles.selectAddressBtn}
              onPress={() => router.push('/screens/AddressScreen')}
            >
              <Ionicons name="add-circle-outline" size={22} color="#3498db" />
              <Text style={styles.selectAddressText}>Select Address</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedAddress}>
              <Text style={styles.addressName}>{selectedAddress.name}</Text>
              <Text style={styles.addressText}>{selectedAddress.street}</Text>
              <Text style={styles.addressText}>
                {selectedAddress.city}, {selectedAddress.state} -{' '}
                {selectedAddress.zipCode || selectedAddress.pincode}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <Ionicons name="card-outline" size={22} color="#3498db" />
            <Text style={styles.paymentTitle}>Razorpay Secure Payment</Text>
          </View>
        </View>

        {/* Email Notice */}
        <View style={styles.emailNotice}>
          <Ionicons name="mail-outline" size={16} color="#27ae60" />
          <Text style={styles.emailNoticeText}>
            Order confirmation will be sent to {authUser.email}
          </Text>
        </View>
      </ScrollView>

      {/* Footer (Sticky Pay Button) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={
            typeof RazorpayCheckout.open === 'function'
              ? handlePayment
              : handleDemoPayment
          }
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              {typeof RazorpayCheckout.open === 'function'
                ? `Pay ₹${total.toFixed(2)}`
                : 'Try Demo Payment'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 100 },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' },
  userWelcome: { fontSize: 14, color: '#7f8c8d', textAlign: 'center' },
  section: { backgroundColor: '#fff', padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 14, color: '#34495e' },
  itemTotal: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#ecf0f1',
    paddingTop: 10,
  },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c' },
  selectAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  selectAddressText: { marginLeft: 8, color: '#3498db', fontWeight: '500' },
  selectedAddress: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 },
  addressName: { fontWeight: 'bold', color: '#2c3e50' },
  addressText: { color: '#7f8c8d' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center' },
  paymentTitle: { marginLeft: 8, color: '#2c3e50', fontWeight: '500' },
  emailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d5f4e6',
    margin: 15,
    padding: 10,
    borderRadius: 8,
  },
  emailNoticeText: { marginLeft: 6, fontSize: 12, color: '#155724' },
  footer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  payButton: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center' },
  payButtonDisabled: { backgroundColor: '#95a5a6' },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#7f8c8d', marginTop: 10 },
  continueShopping: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, marginTop: 10 },
  continueText: { color: '#fff', fontWeight: '600' },
});
