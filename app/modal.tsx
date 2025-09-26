// app/modal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ModalScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is a modal screen</Text>
      <TouchableOpacity style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  text: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  closeText: {
    color: '#000',
  },
});

export default ModalScreen;