// app/(tabs)/categories.tsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productsApi } from '../../services/api';

type Category = {
  id?: string;
  name: string;
  slug: string;
};

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsApi.get('/products/categories');

      // Handle DummyJSON response format
      let categoriesData: any[] = [];

      if (Array.isArray(response.data)) {
        // Direct array response
        categoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.categories)) {
        // Object with categories array
        categoriesData = response.data.categories;
      } else {
        throw new Error('Unexpected API response format');
      }

      // Transform data to consistent format
      const formattedCategories: Category[] = categoriesData.map((cat, index) => {
        if (typeof cat === 'string') {
          return {
            id: `cat-${index}`,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            slug: cat.toLowerCase().replace(/\s+/g, '-'),
          };
        }

        return {
          id: cat.id || `cat-${index}`,
          name: cat.name || 'Unnamed Category',
          slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        };
      }).filter(cat => cat.name && cat.slug);

      setCategories(formattedCategories);
      console.log('Categories loaded:', formattedCategories.length);

    } catch (error) {
      console.error('Categories API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      setError(errorMessage);

      // Fallback categories
      setCategories([
        { id: '1', name: 'Smartphones', slug: 'smartphones' },
        { id: '2', name: 'Laptops', slug: 'laptops' },
        { id: '3', name: 'Fragrances', slug: 'fragrances' },
        { id: '4', name: 'Skincare', slug: 'skincare' },
        { id: '5', name: 'Groceries', slug: 'groceries' },
        { id: '6', name: 'Home Decoration', slug: 'home-decoration' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/(tabs)',
      params: {
        categoryName: category.slug,
        categoryTitle: category.name
      },
    });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons
          name="pricetag-outline"
          size={24}
          color="#3498db"
        />
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productCount}>View products</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="warning-outline" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>Failed to load categories</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Product Categories</Text>
      <Text style={styles.subHeader}>
        Browse products by category ({categories.length} categories)
      </Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id || item.slug}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.list}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  subHeader: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  list: { padding: 16 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorText: { fontSize: 18, color: '#e74c3c', marginTop: 12, textAlign: 'center' },
  errorSubtext: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  categoryItem: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 12,
    color: '#3498db',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});