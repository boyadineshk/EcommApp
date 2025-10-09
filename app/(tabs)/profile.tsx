// app/(tabs)/profile.tsx (Updated with safe email handling)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../contents/UserContext';
import { useAuth } from '../../contents/AuthContext';
import { useWishlist } from '../../contents/WishlistContext';

// Safe email service import with error handling
let emailService: any = null;
try {
  const emailModule = require('../../services/emailService');
  emailService = emailModule.emailService;
} catch (error) {
  console.log('Email service not available:', error);
  // Create a mock service if the file doesn't exist
  emailService = {
    getSentEmails: async () => {
      console.log('Mock email service: getSentEmails');
      return [];
    },
    sendWelcomeEmail: async () => {
      console.log('Mock email service: sendWelcomeEmail');
      return true;
    },
    sendOrderConfirmation: async () => {
      console.log('Mock email service: sendOrderConfirmation');
      return true;
    },
    clearSentEmails: async () => {
      console.log('Mock email service: clearSentEmails');
    }
  };
}

const ProfileScreen = () => {
  const { user, orders, addresses } = useUser();
  const { user: authUser, logout } = useAuth();
  const { state: wishlistState } = useWishlist();
  const [emails, setEmails] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      if (emailService && emailService.getSentEmails) {
        const sentEmails = await emailService.getSentEmails();
        setEmails(sentEmails);
      }
    } catch (error) {
      console.log('Failed to load emails:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
        }
      },
    ]);
  };

  // If user is not authenticated, show login prompt
  if (!authUser) {
    return (
      <View style={styles.container}>
        <View style={styles.authRequired}>
          <Ionicons name="person-circle-outline" size={80} color="#bdc3c7" />
          <Text style={styles.authTitle}>Welcome!</Text>
          <Text style={styles.authSubtitle}>Please login to view your profile</Text>
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
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#666" />
        </View>
        <Text style={styles.name}>{authUser.username || 'User'}</Text>
        <Text style={styles.email}>{authUser.email || 'No email provided'}</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/screens/EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{addresses.length}</Text>
          <Text style={styles.statLabel}>Addresses</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{wishlistState.items.length}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/screens/OrderHistory')}
        >
          <Ionicons name="time-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Order History ({orders.length})</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/screens/WishlistScreen')}
        >
          <Ionicons name="heart-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Wishlist ({wishlistState.items.length})</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/screens/AddressScreen')}
        >
          <Ionicons name="location-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Addresses ({addresses.length})</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Email Inbox Menu Item - Only show if email service is available */}
        {emailService && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/screens/EmailInbox')}
          >
            <Ionicons name="mail-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Email Inbox ({emails.length})</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/screens/EditProfile')}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Account Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* App Info Section */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>Ecomm App v1.0.0</Text>
        <Text style={styles.appDescription}>Your favorite shopping companion</Text>
        {!emailService && (
          <Text style={styles.warningText}>
            Note: Email service not fully configured
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  authRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    width: '80%',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  menu: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#2c3e50',
  },
  logoutText: {
    color: '#e74c3c',
  },
  appInfo: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 12,
    color: '#999',
  },
  warningText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;