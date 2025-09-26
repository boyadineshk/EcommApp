// app/components/EnhancedProductCard.tsx
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

interface EnhancedProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    images: string[];
    category: { name: string };
    rating?: number;
  };
  onPress: () => void;
  compact?: boolean;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onPress,
  compact = false
}) => {
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

    Alert.alert('🎉 Added to Cart', 'Product successfully added to your cart!');
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

  const renderRating = () => {
    const rating = product.rating || 4.5;
    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compactCard]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.image} />
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={toggleWishlist}
        >
          <Ionicons
            name={isInWishlist ? "heart" : "heart-outline"}
            size={18}
            color={isInWishlist ? "#e74c3c" : "#fff"}
          />
        </TouchableOpacity>

        {product.price > 100 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>🔥 Hot</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        {!compact && (
          <>
            <Text style={styles.category}>{product.category.name}</Text>
            {renderRating()}
          </>
        )}

        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
            {!compact && product.price > 100 && (
              <Text style={styles.originalPrice}>
                ₹{(product.price * 1.2).toFixed(2)}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddToCart}
          >
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 6,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    maxWidth: '47%',
    flex: 1,
  },
  compactCard: {
    padding: 8,
    margin: 4,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: '#3498db',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
});

export default EnhancedProductCard;