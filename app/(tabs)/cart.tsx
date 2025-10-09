// app/(tabs)/cart.tsx - UPDATED WITH AUTH CHECK
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useCart } from '../../contents/CartContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contents/AuthContext';

export default function CartScreen() {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const updateQuantity = (id: number, newQty: number) => {
    if (newQty < 1) {
      removeItem(id);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQty } });
  };

  const removeItem = (id: number) => {
    Alert.alert('Remove Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () =>
        dispatch({ type: 'REMOVE_ITEM', payload: id })
      },
    ]);
  };

  const clearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () =>
        dispatch({ type: 'CLEAR_CART' })
      },
    ]);
  };

  const checkout = () => {
    if (state.items.length === 0) {
      Alert.alert('Empty Cart', 'Add some items before checkout.');
      return;
    }

    // ✅ CHECK AUTH BEFORE CHECKOUT
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to proceed with checkout',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => router.push('/screens/LoginScreen')
          },
        ]
      );
      return;
    }

    router.push('/screens/CheckoutScreen');
  };

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total > 500 ? 0 : 40;
  const finalTotal = total + shipping;

  // ✅ SHOW LOGIN PROMPT IF NOT AUTHENTICATED AND CART HAS ITEMS
  if (!user && state.items.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart ({state.items.length})</Text>
        </View>

        <View style={styles.authPromptContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#3498db" />
          <Text style={styles.authPromptTitle}>Login to Continue</Text>
          <Text style={styles.authPromptMessage}>
            Please login to proceed with your purchase and manage your cart
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/screens/LoginScreen')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/screens/RegisterScreen')}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (state.items.length === 0) {
    return (
      <View style={styles.emptyCart}>
        <Ionicons name="cart-outline" size={80} color="#ddd" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Add some items to get started</Text>
        <TouchableOpacity style={styles.continueShopping} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.continueText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart ({state.items.length})</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
        {state.items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={16} color="#3498db" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={16} color="#3498db" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeItem(item.id)}
            >
              <Ionicons name="close" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
          </Text>
        </View>
        {shipping === 0 && (
          <Text style={styles.freeShippingText}>🎉 You qualify for free shipping!</Text>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  clearAllText: { color: '#e74c3c', fontSize: 14, fontWeight: '600' },

  // ✅ AUTH PROMPT STYLES
  authPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  authPromptMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingText: {
    color: '#999',
    fontSize: 14,
  },

  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 30,
  },
  continueShopping: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cartList: { flex: 1, paddingHorizontal: 15 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: { width: 80, height: 80, borderRadius: 12, marginRight: 15 },
  itemDetails: { flex: 1, justifyContent: 'space-between' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#333', lineHeight: 20 },
  itemPrice: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c', marginVertical: 8 },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    alignSelf: 'flex-start',
    padding: 4,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffeaea',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#e74c3c' },
  freeShippingText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  checkoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    margin: 15,
    padding: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});