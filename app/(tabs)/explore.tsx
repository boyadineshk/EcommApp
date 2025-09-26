// app/(tabs)/explore.tsx (Fixed - without placeholder)
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { productsApi } from '../../services/api';
import SearchBar from '../components/SearchBar';

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: { name: string };
};

export default function ExploreScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsApi.get('/products?limit=50');

      if (response.data && Array.isArray(response.data.products)) {
        const formattedProducts = response.data.products.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          description: item.description,
          images: [item.thumbnail, ...(item.images || [])].filter(Boolean),
          category: { name: item.category || 'Uncategorized' },
        }));
        setProducts(formattedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      // Fallback to sample data
      setProducts(getSampleProducts());
    } finally {
      setLoading(false);
    }
  };

  const getSampleProducts = (): Product[] => [
    {
      id: 1,
      title: 'iPhone 15 Pro',
      price: 999.99,
      description: 'Latest Apple smartphone with advanced features',
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300'],
      category: { name: 'smartphones' },
    },
    {
      id: 2,
      title: 'MacBook Air M2',
      price: 1299.99,
      description: 'Powerful and lightweight laptop',
      images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300'],
      category: { name: 'laptops' },
    },
    {
      id: 3,
      title: 'Organic Bananas',
      price: 2.99,
      description: 'Fresh organic bananas',
      images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300'],
      category: { name: 'groceries' },
    },
    {
      id: 4,
      title: 'Skincare Set',
      price: 49.99,
      description: 'Complete skincare routine',
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300'],
      category: { name: 'skincare' },
    },
    {
      id: 5,
      title: 'Wireless Headphones',
      price: 199.99,
      description: 'Noise cancelling wireless headphones',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'],
      category: { name: 'electronics' },
    },
  ];

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products; // Return all products when search is empty
    }

    const query = searchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const retryFetch = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore Products</Text>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={clearSearch}
        placeholder="Search products, categories..."
      />

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {searchQuery ? `Found ${filteredProducts.length} results for "${searchQuery}"` : `Showing all products (${filteredProducts.length})`}
        </Text>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push(`/screens/ProductDetails?id=${item.id}`)}
          >
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.productCategory}>
                {item.category.name.charAt(0).toUpperCase() + item.category.name.slice(1)}
              </Text>
              <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {searchQuery ? `No products found for "${searchQuery}"` : 'No products available'}
            </Text>
            {searchQuery && (
              <TouchableOpacity onPress={clearSearch}>
                <Text style={styles.clearSearchText}>Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsInfo: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  list: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  clearSearchText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
});