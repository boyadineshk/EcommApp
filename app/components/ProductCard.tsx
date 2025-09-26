// app/components/ProductCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contents/CartContext';
import { useWishlist } from '../../contents/WishlistContext';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    images: string[];
    category: { name: string };
  };
  onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { dispatch: cartDispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();

  const isInWishlist = wishlistState.items.some(item => item.id === product.id);

  const handleAddToCart = () => {
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        description: '',
        image: product.images[0],
      },
    });

    Alert.alert('Success', 'Product added to cart!');
  };

  const toggleWishlist = () => {
    if (isInWishlist) {
      wishlistDispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
    } else {
      wishlistDispatch({
        type: 'ADD_TO_WISHLIST',
        payload: {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images[0],
        },
      });
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress}>
        <Image source={{ uri: product.images[0] }} style={styles.image} />
        <TouchableOpacity style={styles.wishlistBtn} onPress={toggleWishlist}>
          <Ionicons
            name={isInWishlist ? "heart" : "heart-outline"}
            size={20}
            color={isInWishlist ? "#e74c3c" : "#666"}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.category}>{product.category.name}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 6,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  addBtn: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    padding: 6,
  },
});

export default ProductCard;