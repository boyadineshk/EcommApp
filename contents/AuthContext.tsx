// contents/AuthContext.tsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { emailService } from '../services/emailService'; // ✅ Correct import

interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    return digest;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Get all users from storage
      const usersData = await AsyncStorage.getItem('@registered_users');
      const users = usersData ? JSON.parse(usersData) : [];

      // Find user by email
      const user = users.find((u: any) => u.email === email);

      if (!user) {
        console.log('User not found');
        return false;
      }

      // Verify password
      const hashedPassword = await hashPassword(password);
      if (user.password !== hashedPassword) {
        console.log('Invalid password');
        return false;
      }

      // Store user session (without password)
      const userSession = {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone
      };

      await AsyncStorage.setItem('@user_data', JSON.stringify(userSession));
      setUser(userSession);

      // ✅ Send login email (non-blocking)
      emailService.sendLoginEmail(user.email, user.username).catch(err => {
        console.log('Login email failed (non-critical):', err);
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if user already exists
      const usersData = await AsyncStorage.getItem('@registered_users');
      const users = usersData ? JSON.parse(usersData) : [];

      const existingUser = users.find((u: any) => u.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        createdAt: new Date().toISOString()
      };

      // Save user
      const updatedUsers = [...users, newUser];
      await AsyncStorage.setItem('@registered_users', JSON.stringify(updatedUsers));

      // ✅ Send registration email (non-blocking, won't crash if it fails)
      emailService.sendRegistrationEmail(userData.email, userData.username).catch(err => {
        console.log('Registration email failed (non-critical):', err);
      });

      console.log('✅ User registered successfully');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user_data');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};