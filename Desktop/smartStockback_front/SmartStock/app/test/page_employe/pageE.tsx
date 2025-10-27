import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {styles} from "./style_P_E"
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ==================== TYPES ====================
interface User {
  id_user: number;
  nom: string;
  email: string;
  role: string;
}

interface Transaction {
  id_mouvement: number;
  type_mouvement: 'entree' | 'sortie' | '';
  quantite: number;
  prix_unitaire: number;
  date_mouvement: string;
  commentaire: string;
  nom_produit: string;
  id_user: number;
}

interface Product {
  id_produit: number;
  nom: string;
  categorie: string;
  prix_unitaire: number;
  stock_actuel: number;
}

// ==================== API SERVICE ====================
const API_BASE_URL = 'http://192.168.33.105:3000/api'; // ⚠️ Mets ton IP locale

class ApiService {
  private async makeRequest<T>(url: string): Promise<T> {
    try {
      console.log(`🔄 Requête à: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Réponse reçue de: ${url}`);
      return data;
    } catch (error) {
      console.error(`❌ Erreur API: ${url}`, error);
      throw error;
    }
  }

  async getRecentTransactions(): Promise<Transaction[]> {
    try {
      return await this.makeRequest<Transaction[]>(`${API_BASE_URL}/transactions/recent`);
    } catch (error) {
      console.log('Aucune transaction trouvée');
      return [];
    }
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      return await this.makeRequest<Product[]>(`${API_BASE_URL}/products/search?q=${encodeURIComponent(searchTerm)}`);
    } catch (error) {
      console.log("Erreur de recherche");
      return [];
    }
  }
}

// ==================== COMPOSANT PRINCIPAL ====================
const App = () => {
  const router = useRouter();

  const [searchText, setSearchText] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  const apiService = new ApiService();

  // Charger les données au démarrage
  useEffect(() => {
    loadInitialData();
  }, []);

  // ==================== TEST DE CONNEXION ====================
  const testConnection = async () => {
    try {
      setConnectionStatus('Test en cours...');
      const response = await fetch(`${API_BASE_URL}/test`);
      const data = await response.json();
      setConnectionStatus(`✅ Connecté: ${data.message}`);
    } catch (error) {
      console.error(error);
      setConnectionStatus('❌ Erreur de connexion au serveur');
    }
  };

  // ==================== CHARGEMENT INITIAL ====================
  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des données initiales...');
      await testConnection();

      // ✅ Récupération de l'utilisateur connecté depuis AsyncStorage
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        console.log("👤 Utilisateur connecté:", u.nom);
      } else {
        console.log("⚠️ Aucun utilisateur trouvé dans AsyncStorage");
      }

      // ✅ Récupération des transactions
      const recentTransactions = await apiService.getRecentTransactions();
      setTransactions(recentTransactions);

      console.log('✅ Données chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement initial:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== RECHERCHE ====================
  const handleSearch = async (text: string) => {
    setSearchText(text);

    if (text.length > 2) {
      try {
        setSearchLoading(true);
        const results = await apiService.searchProducts(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur de recherche:', error);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // ==================== FORMATAGE ====================
  const formatAmount = (type: string, quantite: number, prix_unitaire: number): string => {
    const amount = quantite * prix_unitaire;
    const sign = type === 'entree' ? '+' : '-';
    return `${sign}${amount.toFixed(2)} DT`;
  };

  const getTransactionColor = (type: string, amount: string): string => {
    if (amount.includes('+')) return '#4CAF50';
    if (amount.includes('-')) return '#F44336';
    if (type === 'entree') return '#4CAF50';
    if (type === 'sortie') return '#F44336';
    return '#666';
  };

  const getTransactionTypeText = (type: string): string => {
    switch (type) {
      case 'entree': return 'Income';
      case 'sortie': return 'Expense';
      default: return '';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // ==================== AFFICHAGE ====================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
          <Text style={styles.connectionStatus}>{connectionStatus}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* ========== HEADER ========== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.usernameText}>{user?.nom}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push('/test/add_p_Employer/addE')}
            style={styles.addButtonHeader}
          >
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/test/home/home')}
            style={styles.logoutButton}
          >
            <Feather name="log-out" size={18} color="#5C4033" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ========== SEARCH ========== */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchLoading && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.searchLoading} />
          )}
        </View>

        {/* ========== SEARCH RESULTS ========== */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsTitle}>Résultats de recherche</Text>
            {searchResults.map((product) => (
              <View key={product.id_produit} style={styles.searchResultItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.nom}</Text>
                  <Text style={styles.productCategory}>{product.categorie}</Text>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>{product.prix_unitaire.toFixed(2)} DT</Text>
                  <Text style={styles.productStock}>Stock: {product.stock_actuel}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ========== RECENT TRANSACTIONS ========== */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={loadInitialData}>
              <Ionicons name="refresh" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              const amount = formatAmount(
                transaction.type_mouvement,
                transaction.quantite,
                transaction.prix_unitaire
              );

              return (
                <View key={transaction.id_mouvement} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: transaction.type_mouvement === 'entree' ? '#e8f5e8' : '#ffe8e8' }
                    ]}>
                      <Text style={styles.transactionIconText}>
                        {transaction.type_mouvement === 'entree' ? '📥' : '📤'}
                      </Text>
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>
                        {transaction.nom_produit || transaction.commentaire || 'Transaction'}
                      </Text>
                      <Text style={[
                        styles.transactionType,
                        { color: getTransactionColor(transaction.type_mouvement, amount) }
                      ]}>
                        {getTransactionTypeText(transaction.type_mouvement)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type_mouvement, amount) }
                    ]}>
                      {amount}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date_mouvement)}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noTransactions}>Aucune transaction récente</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
