// app/(tabs)/index.tsx (Fixed - Remove non-functional + button)
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { productsApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contents/CartContext';

const { width } = Dimensions.get('window');

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: {
    id: number;
    name: string;
  };
}

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800',
    title: 'Summer Collection',
    subtitle: 'Up to 50% OFF',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    title: 'New Arrivals',
    subtitle: 'Fresh styles just in',
  },
];

const quickCategories = [
  { id: 1, name: 'smartphones', icon: 'phone-portrait' },
  { id: 2, name: 'laptops', icon: 'laptop' },
  { id: 3, name: 'groceries', icon: 'basket' },
  { id: 4, name: 'skincare', icon: 'sparkles' },
];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryName?: string }>();
  const { dispatch } = useCart();

  const selectedCategoryName = params.categoryName;

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryName) return products;
    return products.filter(
      (p) =>
        p.category.name.toLowerCase().trim() ===
        selectedCategoryName.toLowerCase().trim()
    );
  }, [products, selectedCategoryName]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setActiveBanner((prev) => (prev + 1) % banners.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.get('/products');
      if (response.data && Array.isArray(response.data.products)) {
        const rawProducts = response.data.products;
        const validProducts: Product[] = rawProducts
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            description: item.description,
            images: [item.thumbnail, ...(item.images || [])].filter(Boolean),
            category: {
              id: item.id * 10,
              name: item.category,
            },
          }))
          .filter(
            (item: Product) =>
              item.id &&
              item.title &&
              item.price !== undefined &&
              item.images.length > 0
          );
        setProducts(validProducts);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load products. Using sample data.');
      setProducts(getSampleProducts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getSampleProducts = (): Product[] => [
    {
      id: 1,
      title: 'Sample Product 1 (Dummy)',
      price: 99.99,
      description: 'This is a sample product description',
      images: ['https://via.placeholder.com/300x300?text=Product+1'],
      category: { id: 10, name: 'smartphones' },
    },
    {
      id: 2,
      title: 'Sample Product 2 (Dummy)',
      price: 149.99,
      description: 'This is another sample product',
      images: ['https://via.placeholder.com/300x300?text=Product+2'],
      category: { id: 20, name: 'laptops' },
    },
    {
      id: 3,
      title: 'Sample Product 3 (Dummy)',
      price: 79.99,
      description: 'Sample product description',
      images: ['https://via.placeholder.com/300x300?text=Product+3'],
      category: { id: 30, name: 'groceries' },
    },
    {
      id: 4,
      title: 'Sample Product 4 (Dummy)',
      price: 199.99,
      description: 'Another sample product',
      images: ['https://via.placeholder.com/300x300?text=Product+4'],
      category: { id: 40, name: 'skincare' },
    },
  ];

  const displayedProducts = filteredProducts.slice(0, 20);

  const renderBannerItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.bannerItem}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  // FIXED: Remove the non-functional + button
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: '/screens/ProductDetails',
          params: { id: item.id.toString() },
        })
      }
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productCategory}>
          {item.category.name.charAt(0).toUpperCase() +
            item.category.name.slice(1).replace(/-/g, ' ')}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
          {/* + Button removed - users can add from product details page */}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        router.push({
          pathname: '/(tabs)',
          params: { categoryName: item.name.toLowerCase() },
        })
      }
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon as any} size={24} color="#3498db" />
      </View>
      <Text style={styles.categoryName}>
        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  const headerTitle = selectedCategoryName
    ? `Results for: ${
        selectedCategoryName.charAt(0).toUpperCase() +
        selectedCategoryName.slice(1).replace(/-/g, ' ')
      }`
    : 'Featured Products';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProducts} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome! 👋</Text>
            <Text style={styles.subGreeting}>
              {selectedCategoryName
                ? `Showing ${filteredProducts.length} results`
                : 'Discover amazing products'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {selectedCategoryName && (
          <TouchableOpacity
            style={styles.clearFilterBtn}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="close-circle" size={18} color="#e74c3c" />
            <Text style={styles.clearFilterText}>Clear Filter</Text>
          </TouchableOpacity>
        )}

        {!selectedCategoryName && (
          <View style={styles.bannerContainer}>
            <FlatList
              data={banners}
              renderItem={renderBannerItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            />
            <View style={styles.bannerIndicators}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.bannerIndicator,
                    index === activeBanner && styles.bannerIndicatorActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {!selectedCategoryName && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>
              Shop by Category
            </Text>
            <FlatList
              data={quickCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{headerTitle}</Text>
            <Text style={styles.productCount}>
              {displayedProducts.length} items
            </Text>
          </View>

          {displayedProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#ddd" />
              <Text style={styles.emptyText}>
                No products found in this category.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.retryText}>View All Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={displayedProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.productsGrid}
              />
              {!selectedCategoryName && (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={() => router.push('/(tabs)/explore')}
                >
                  <Text style={styles.loadMoreText}>View All Products</Text>
                  <Ionicons name="arrow-forward" size={16} color="#3498db" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  greeting: { fontSize: 18, fontWeight: '600', color: '#333' },
  subGreeting: { fontSize: 14, color: '#666', marginTop: 2 },
  notificationBtn: { padding: 8 },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  clearFilterText: {
    color: '#e74c3c',
    fontWeight: '600',
    marginLeft: 5,
  },
  bannerContainer: { height: 200, marginBottom: 20 },
  bannerItem: {
    width: width - 40,
    height: 200,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  bannerSubtitle: { fontSize: 14, color: '#eee' },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  bannerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    margin: 4,
  },
  bannerIndicatorActive: { backgroundColor: '#3498db', width: 20 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesList: { paddingHorizontal: 15 },
  categoryItem: { alignItems: 'center', marginRight: 20 },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: { fontSize: 12, fontWeight: '500', color: '#333' },
  productCount: { fontSize: 14, color: '#666' },
  productsGrid: { paddingHorizontal: 10 },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 6,
    padding: 12,
    elevation: 2,
    maxWidth: '47%',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  productInfo: { flex: 1 },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: { fontSize: 12, color: '#666', marginBottom: 8 },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto', // This pushes the price to the bottom
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 8, // Add spacing above the price
  },
  // REMOVED: addToCartBtn styles since we're not using the button anymore
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', marginTop: 12 },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  loadMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 12,
  },
  loadMoreText: { color: '#3498db', fontWeight: '600', marginRight: 8 },
});