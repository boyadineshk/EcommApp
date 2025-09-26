// app/screens/AddressScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../contents/UserContext';
import { Ionicons } from '@expo/vector-icons';

export default function AddressScreen() {
  const { addresses, addAddress, updateAddress, deleteAddress } = useUser();
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false,
  });

  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    addAddress(newAddress);
    setNewAddress({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      isDefault: false,
    });
    setShowAddForm(false);
    Alert.alert('Success', 'Address saved successfully!');
  };

  const handleSelectAddress = (address: any) => {
    router.back();
    // You can pass the selected address back to checkout
  };

  const renderAddressItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.addressCard} onPress={() => handleSelectAddress(item)}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{item.name}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>{item.city}, {item.state} {item.zipCode}</Text>
      <Text style={styles.addressText}>📱 {item.phone}</Text>

      <View style={styles.addressActions}>
        <TouchableOpacity onPress={() => updateAddress(item.id, { isDefault: true })}>
          <Text style={styles.actionText}>Set Default</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteAddress(item.id)}>
          <Text style={[styles.actionText, { color: '#e74c3c' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Address</Text>
        <View style={{ width: 24 }} />
      </View>

      {!showAddForm ? (
        <>
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="location-outline" size={64} color="#ddd" />
                <Text style={styles.emptyText}>No addresses saved</Text>
                <Text style={styles.emptySubtext}>Add your first address to continue</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={newAddress.name}
            onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Street Address *"
            value={newAddress.street}
            onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="City *"
            value={newAddress.city}
            onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="State"
            value={newAddress.state}
            onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="ZIP Code"
            value={newAddress.zipCode}
            onChangeText={(text) => setNewAddress({ ...newAddress, zipCode: text })}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            value={newAddress.phone}
            onChangeText={(text) => setNewAddress({ ...newAddress, phone: text })}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
          >
            <View style={[styles.checkbox, newAddress.isDefault && styles.checkboxChecked]}>
              {newAddress.isDefault && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </TouchableOpacity>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveAddressButton}
              onPress={handleSaveAddress}
            >
              <Text style={styles.saveAddressButtonText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
  list: { padding: 16, flexGrow: 1 },
  addressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  defaultBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  addressText: { fontSize: 14, color: '#666', marginBottom: 4 },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionText: { color: '#3498db', fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  formContainer: { flex: 1, padding: 16 },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
  },
  checkboxLabel: { color: '#333', fontSize: 14 },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveAddressButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#3498db',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#666', fontWeight: '600' },
  saveAddressButtonText: { color: '#fff', fontWeight: '600' },
});