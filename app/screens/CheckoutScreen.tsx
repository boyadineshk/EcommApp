// app/screens/CheckoutScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contents/CartContext';
import { useUser } from '../../contents/UserContext';

// Import Razorpay
import RazorpayCheckout from 'react-native-razorpay';

export default function CheckoutScreen() {
  const { state, dispatch } = useCart();
  const { addresses, user } = useUser();
  const items = state.items;
  const router = useRouter();
  const params = useLocalSearchParams();

  const [processing, setProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // Set selected address from route params if available
  useEffect(() => {
    if (params.selectedAddress) {
      try {
        const address = typeof params.selectedAddress === 'string'
          ? JSON.parse(params.selectedAddress)
          : params.selectedAddress;
        setSelectedAddress(address);
      } catch (error) {
        console.log('Error parsing address:', error);
      }
    }
  }, [params.selectedAddress]);

  // Auto-select default address if none selected
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [addresses, selectedAddress]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePayment = () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address before proceeding.');
      return;
    }

    if (total < 1) {
      Alert.alert('Minimum Order', 'Order must be at least ₹1 to proceed.');
      return;
    }

    // Check if Razorpay is available (only in built apps)
    if (typeof RazorpayCheckout.open !== 'function') {
      Alert.alert(
        'Payment Unavailable',
        'Razorpay works only in built apps. Please build the app using EAS Build to test payments.\n\nFor now, using demo payment.',
        [
          {
            text: 'Use Demo Payment',
            onPress: handleDemoPayment
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    setProcessing(true);

    const options = {
      key: 'rzp_test_RLjVf5Pta4ESgl', // Your Razorpay test key
      amount: Math.round(total * 100).toString(), // Amount in paise
      currency: 'INR',
      name: 'Ecomm Store',
      description: 'Complete your purchase',
      image: 'https://i.imgur.com/3g7nmJC.png', // Your store logo
      prefill: {
        email: user?.email || 'boyadineshkumar@gmail.com',
        contact: user?.phone || '9014289315',
        name: user?.name || 'Dinesh Kumar'
      },
      theme: { color: '#3498db' }
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        console.log('Payment Success:', data);

        // Payment successful - clear cart
        dispatch({ type: 'CLEAR_CART' });

        router.push({
          pathname: '/screens/PaymentResult',
          params: {
            status: 'success',
            amount: total.toString(),
            id: data.razorpay_payment_id || `pay_${Date.now()}`,
          },
        });
      })
      .catch((error: any) => {
        console.log('Payment Error:', error);

        let errorMessage = 'Payment failed or cancelled';

        if (error.error) {
          const errorCode = error.error.code;
          const errorDescription = error.error.description;

          if (errorCode === 2) errorMessage = 'Network error. Please check your connection.';
          else if (errorCode === 3) errorMessage = 'Payment cancelled by user.';
          else if (errorDescription) errorMessage = errorDescription;
        }

        router.push({
          pathname: '/screens/PaymentResult',
          params: {
            status: 'failure',
            error: errorMessage,
            amount: total.toString(),
          },
        });
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  const handleDemoPayment = () => {
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate

      if (isSuccess) {
        // Demo payment successful
        dispatch({ type: 'CLEAR_CART' });
        router.push({
          pathname: '/screens/PaymentResult',
          params: {
            status: 'success',
            amount: total.toString(),
            id: `demo_${Date.now()}`,
            demo: 'true',
          },
        });
      } else {
        // Demo payment failed
        router.push({
          pathname: '/screens/PaymentResult',
          params: {
            status: 'failure',
            error: 'Demo payment failed. Try again.',
            demo: 'true',
          },
        });
      }

      setProcessing(false);
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShopping}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.continueText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={item.id} style={[
              styles.itemRow,
              index === items.length - 1 && styles.lastItemRow
            ]}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.title}</Text>
                <Text style={styles.itemPrice}>₹{item.price.toFixed(2)} × {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>

        {!selectedAddress ? (
          <TouchableOpacity
            style={styles.selectAddressBtn}
            onPress={() => router.push('/screens/AddressScreen')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#3498db" />
            <Text style={styles.selectAddressText}>Select Delivery Address</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.selectedAddress}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressName}>{selectedAddress.name}</Text>
              <TouchableOpacity onPress={() => router.push('/screens/AddressScreen')}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText}>{selectedAddress.street}</Text>
            <Text style={styles.addressText}>
              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
            </Text>
            <Text style={styles.addressText}>Phone: {selectedAddress.phone}</Text>
          </View>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethod}>
          <Ionicons name="card-outline" size={24} color="#3498db" />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Razorpay Secure Payment</Text>
            <Text style={styles.paymentSubtitle}>Cards, UPI, Net Banking, Wallets, Pay Later</Text>
          </View>
        </View>
      </View>

      {/* Build Notice */}
      {typeof RazorpayCheckout.open !== 'function' && (
        <View style={styles.buildNotice}>
          <Ionicons name="warning-outline" size={20} color="#f39c12" />
          <Text style={styles.buildNoticeText}>
            Build the app with EAS Build to enable real Razorpay payments
          </Text>
        </View>
      )}

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            processing && styles.payButtonDisabled,
            typeof RazorpayCheckout.open !== 'function' && styles.demoButton
          ]}
          onPress={typeof RazorpayCheckout.open === 'function' ? handlePayment : handleDemoPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.payButtonText}>
              {typeof RazorpayCheckout.open === 'function'
                ? `Pay ₹${total.toFixed(2)}`
                : 'Try Demo Payment'
              }
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          <Ionicons name="lock-closed" size={12} color="#27ae60" />
          Secure and encrypted payment
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  itemsContainer: {
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  lastItemRow: {
    borderBottomWidth: 0,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  selectAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  selectAddressText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  selectedAddress: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  changeText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  buildNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    margin: 15,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  buildNoticeText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#856404',
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    marginTop: 'auto',
  },
  payButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  demoButton: {
    backgroundColor: '#95a5a6',
  },
  payButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNote: {
    fontSize: 12,
    color: '#27ae60',
    textAlign: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 24,
  },
  continueShopping: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});