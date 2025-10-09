// contents/UserContext.tsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  username: string;
  email: string;
}

interface Order {
  id: string;
  date: string;
  items: any[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  address: Address;
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface UserContextType {
  user: User;
  orders: Order[];
  addresses: Address[];
  showUserModal: boolean;
  setShowUserModal: (show: boolean) => void;
  updateUser: (user: User) => void;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ username: '', email: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  // ✅ CHANGED: Don't show modal on app start
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [userData, ordersData, addressesData] = await Promise.all([
        AsyncStorage.getItem('@user_data'),
        AsyncStorage.getItem('@user_orders'),
        AsyncStorage.getItem('@user_addresses'),
      ]);

      if (userData) {
        setUser(JSON.parse(userData));
        // ✅ REMOVED: Don't set showUserModal to false
      }
      if (ordersData) setOrders(JSON.parse(ordersData));
      if (addressesData) setAddresses(JSON.parse(addressesData));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateUser = async (newUser: User) => {
    setUser(newUser);
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(newUser));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
      date: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    try {
      await AsyncStorage.setItem('@user_orders', JSON.stringify(updatedOrders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  };

  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...addressData,
      id: `addr_${Date.now()}`,
    };

    const updatedAddresses = addressData.isDefault
      ? addresses.map(addr => ({ ...addr, isDefault: false }))
      : addresses;

    updatedAddresses.push(newAddress);
    setAddresses(updatedAddresses);

    try {
      await AsyncStorage.setItem('@user_addresses', JSON.stringify(updatedAddresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  };

  const updateAddress = async (id: string, addressData: Partial<Address>) => {
    const updatedAddresses = addresses.map(addr =>
      addr.id === id ? { ...addr, ...addressData } : addr
    );

    if (addressData.isDefault) {
      updatedAddresses.forEach(addr => {
        if (addr.id !== id) addr.isDefault = false;
      });
    }

    setAddresses(updatedAddresses);

    try {
      await AsyncStorage.setItem('@user_addresses', JSON.stringify(updatedAddresses));
    } catch (error) {
      console.error('Error updating addresses:', error);
    }
  };

  const deleteAddress = async (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedAddresses);

    try {
      await AsyncStorage.setItem('@user_addresses', JSON.stringify(updatedAddresses));
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      orders,
      addresses,
      showUserModal,
      setShowUserModal,
      updateUser,
      addOrder,
      addAddress,
      updateAddress,
      deleteAddress,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};