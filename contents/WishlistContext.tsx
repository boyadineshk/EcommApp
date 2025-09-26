// contents/WishlistContext.tsx
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WishlistItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  category?: string;
};

type WishlistState = {
  items: WishlistItem[];
};

type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: number }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] }
  | { type: 'CLEAR_WISHLIST' };

const WishlistContext = createContext<{
  state: WishlistState;
  dispatch: React.Dispatch<WishlistAction>;
} | undefined>(undefined);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  let newState: WishlistState;

  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.items.find(item => item.id === action.payload.id)) return state;
      newState = { items: [...state.items, action.payload] };
      break;
    case 'REMOVE_FROM_WISHLIST':
      newState = { items: state.items.filter(item => item.id !== action.payload) };
      break;
    case 'LOAD_WISHLIST':
      newState = { items: action.payload };
      break;
    case 'CLEAR_WISHLIST':
      newState = { items: [] };
      break;
    default:
      return state;
  }

  AsyncStorage.setItem('@wishlist', JSON.stringify(newState.items));
  return newState;
};

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  // Load wishlist from AsyncStorage on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const storedWishlist = await AsyncStorage.getItem('@wishlist');
        if (storedWishlist) {
          dispatch({ type: 'LOAD_WISHLIST', payload: JSON.parse(storedWishlist) });
        }
      } catch (error) {
        console.log('Failed to load wishlist:', error);
      }
    };
    loadWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ state, dispatch }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
