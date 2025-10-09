// app/_layout.tsx - FIXED VERSION (No UserModal)
import { Stack } from 'expo-router';
import { CartProvider } from '../contents/CartContext';
import { WishlistProvider } from '../contents/WishlistContext';
import { UserProvider } from '../contents/UserContext';
import { AuthProvider, useAuth } from '../contents/AuthContext';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import React from 'react';
// ✅ REMOVED: import UserModal from './components/UserModal';

function RootLayoutContent() {
  const { user: authUser, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack>
        {!authUser ? (
          // Auth screens when not logged in
          <>
            <Stack.Screen name="screens/LoginScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/RegisterScreen" options={{ headerShown: false }} />
            {/* Allow access to tabs even when not logged in */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </>
        ) : (
          // App screens when logged in
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screens/ProductDetails" options={{ title: 'Product Details' }} />
            <Stack.Screen name="screens/CheckoutScreen" options={{ title: 'Checkout' }} />
            <Stack.Screen name="screens/PaymentResult" options={{ title: 'Payment Result' }} />
            <Stack.Screen name="screens/AddressScreen" options={{ title: 'Select Address' }} />
            <Stack.Screen name="screens/OrderHistory" options={{ title: 'Order History' }} />
            <Stack.Screen name="screens/EmailInbox" options={{ title: 'Email Inbox' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack>

      {/* ✅ REMOVED: UserModal component entirely */}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <RootLayoutContent />
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </AuthProvider>
  );
}