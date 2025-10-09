// contents/CartContext.tsx
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

// ✅ FIXED: Allow `quantity` optionally in payload for ADD_ITEM
type CartAction =
  | { type: 'ADD_ITEM'; payload: Partial<CartItem> & { id: number } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CART_STORAGE_KEY = '@ecomm_cart';

const CartContext = createContext<
  { state: CartState; dispatch: React.Dispatch<CartAction> } | undefined
>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;

  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id);

      if (existing) {
        // ✅ FIX: Use payload quantity if provided, otherwise increment by 1
        const newQuantity = action.payload.quantity
          ? existing.quantity + action.payload.quantity
          : existing.quantity + 1;

        newState = {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: newQuantity } : i
          ),
        };
      } else {
        // ✅ FIX: Use quantity from payload or default to 1
        newState = {
          ...state,
          items: [
            ...state.items,
            { ...action.payload, quantity: action.payload.quantity || 1 } as CartItem,
          ],
        };
      }
      break;
    }

    case 'REMOVE_ITEM':
      newState = {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };
      break;

    case 'UPDATE_QUANTITY':
      newState = {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
      break;

    case 'CLEAR_CART':
      newState = { ...state, items: [] };
      break;

    case 'LOAD_CART':
      newState = { ...state, items: action.payload };
      break;

    default:
      return state;
  }

  // ✅ Always save to AsyncStorage after every cart update
  AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newState.items)).catch(console.error);

  return newState;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // ✅ Load from AsyncStorage on app start
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const items: CartItem[] = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: items });
        }
      } catch (error) {
        console.error('Failed to load cart from storage:', error);
      }
    };

    loadCart();
  }, []);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
