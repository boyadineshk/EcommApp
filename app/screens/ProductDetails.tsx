// app/screens/ProductDetails.tsx - UPDATED WITH AUTH CHECK
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productsApi } from '../../services/api';
import { useCart } from '../../contents/CartContext';
import { useAuth } from '../../contents/AuthContext';
import AuthPrompt from '../components/AuthPrompt';

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  rating?: number;
  ratingCount?: number;
  category?: { name: string };
};

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ? Number(id) : null;

  const [product, setProduct] = useState<Product | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const router = useRouter();
  const { dispatch } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!productId || isNaN(productId)) {
      Alert.alert('Error', 'Invalid product ID');
      router.back();
      return;
    }

    setLoading(true);
    productsApi
      .get<Product>(`/products/${productId}`)
      .then((res) => setProduct(res.data))
      .catch((error) => {
        console.error('Product fetch error:', error);
        Alert.alert('Error', 'Failed to load product details');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    // ✅ CHECK AUTH
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        image: product.images?.[0] || '',
        quantity: quantity,
      },
    });
    setAddedToCart(true);
  };

  const toggleWishlist = () => {
    // ✅ CHECK AUTH
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    setWishlisted((prev) => !prev);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 10 }}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderGallery = () => (
    <FlatList
      data={product.images}
      keyExtractor={(_, idx) => idx.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={styles.galleryImage} />
      )}
      style={{ marginBottom: 16 }}
    />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.wishlistBtn} onPress={toggleWishlist}>
        <Text style={{ fontSize: 22, color: wishlisted ? '#e74c3c' : '#e67e22' }}>
          {wishlisted ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {product.images?.length ? (
          product.images.length > 1 ? (
            renderGallery()
          ) : (
            <Image source={{ uri: product.images[0] }} style={styles.image} />
          )
        ) : (
          <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text>No Image Available</Text>
          </View>
        )}

        <View style={styles.content}>
          {product.category && (
            <Text style={styles.categoryBadge}>{product.category.name}</Text>
          )}
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
          <Text style={styles.desc}>{product.description}</Text>

          {/* ✅ SHOW LOGIN PROMPT IF NOT AUTHENTICATED */}
          {!user && (
            <View style={styles.authNotice}>
              <Text style={styles.authNoticeText}>
                🔒 Login to add items to cart
              </Text>
            </View>
          )}

          <View style={styles.quantityRow}>
            <TouchableOpacity
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyLabel}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity((q) => q + 1)}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {!addedToCart && (
            <TouchableOpacity style={styles.btnAdd} onPress={handleAddToCart}>
              <Text style={styles.btnText}>
                {user ? 'Add to Cart' : 'Login to Add to Cart'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {addedToCart && (
        <View style={styles.fixedBottom}>
          <TouchableOpacity
            style={styles.fixedBtn}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Text style={styles.btnText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ AUTH PROMPT MODAL */}
      <AuthPrompt
        visible={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Please login to add items to your cart and wishlist"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  scrollContent: { paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  image: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  galleryImage: {
    width: 320,
    height: 300,
    resizeMode: 'contain',
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  content: { padding: 20, paddingTop: 0 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#222' },
  categoryBadge: {
    backgroundColor: '#e8f2fb',
    color: '#3498db',
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  price: { fontSize: 24, fontWeight: 'bold', color: '#e74c3c', marginBottom: 10 },
  desc: { fontSize: 16, lineHeight: 22, color: '#555', marginBottom: 20 },

  // ✅ AUTH NOTICE STYLES
  authNotice: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 15,
  },
  authNoticeText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  qtyBtn: {
    padding: 7,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  qtyBtnText: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
    width: 22,
    textAlign: 'center',
  },
  qtyLabel: { fontSize: 16, marginHorizontal: 14, minWidth: 30, textAlign: 'center' },
  btnAdd: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  back: { color: '#3498db', fontSize: 16, marginTop: 10, textAlign: 'left' },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 5,
  },
  fixedBtn: {
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 20,
    right: 22,
    zIndex: 99,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 8,
    elevation: 5,
  },
});