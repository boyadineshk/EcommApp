// app/_layout.tsx (Updated)
import { Stack } from 'expo-router';
import { CartProvider } from '../contents/CartContext';
import { WishlistProvider } from '../contents/WishlistContext';
import { UserProvider, useUser } from '../contents/UserContext';
import { StatusBar } from 'react-native';
import UserModal from './components/UserModal';


function RootLayoutContent() {
  const { user, showUserModal, setShowUserModal, updateUser } = useUser();

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/ProductDetails" options={{ title: 'Product Details' }} />
        <Stack.Screen name="screens/CheckoutScreen" options={{ title: 'Checkout' }} />
        <Stack.Screen name="screens/PaymentResult" options={{ title: 'Payment Result' }} />
        <Stack.Screen name="screens/AddressScreen" options={{ title: 'Select Address' }} />
        <Stack.Screen name="screens/OrderHistory" options={{ title: 'Order History' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

      <UserModal
        visible={showUserModal && !user.username}
        onClose={(userData) => {
          updateUser(userData);
          setShowUserModal(false);
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <CartProvider>
        <WishlistProvider>
          <RootLayoutContent />
        </WishlistProvider>
      </CartProvider>
    </UserProvider>
  );
}