import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons , AntDesign, Feather} from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import{styles} from "./style_t"
// ==================== TYPES ====================

// ==================== API SERVICE AMÉLIORÉ ====================
// ESSAYEZ CES DIFFÉRENTES URL :
// const API_BASE_URL = 'http://localhost:3000/api'; // Ne fonctionne pas sur mobile
// const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Pour Android emulator
const API_BASE_URL = 'http://192.168.33.105:3000/api'; // Votre IP locale - À ADAPTER

class ApiService {
  private async makeRequest<T>(url: string): Promise<T> {
    try {
      console.log(`🔄 Tentative de connexion à: ${url}`);
      
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
      console.error(`❌ Erreur API pour ${url}:`, error);
      throw error;
    }
  }

  async getBalanceData(): Promise<BalanceData> {
    try {
      return await this.makeRequest<BalanceData>(`${API_BASE_URL}/balance`);
    } catch (error) {
      console.log('Utilisation des données mockées pour le solde');
      return {
       
        total_balance: 5000.02,
        total_income: 800,
        total_expenses: 600
      };
    }
  }

  async getRecentTransactions(): Promise<Transaction[]> {
    try {
      return await this.makeRequest<Transaction[]>(`${API_BASE_URL}/transactions/recent`);
    } catch (error) {
      console.log('Utilisation des transactions mockées');
      return [
       
        
      ];
    }
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      return await this.makeRequest<Product[]>(`${API_BASE_URL}/products/search?q=${encodeURIComponent(searchTerm)}`);
    } catch (error) {
      console.log('Erreur de recherche');
      return [];
    }
  }

 
    
}

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

interface BalanceData {
  total_balance: number;
  total_income: number;
  total_expenses: number;
 
}

interface Product {
  id_produit: number;
  nom: string;
  categorie: string;
  prix_unitaire: number;
  stock_actuel: number;
};
 
  

// ==================== COMPOSANT PRINCIPAL ====================
const App = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  const router = useRouter();
const apiService = new ApiService();

  useEffect(() => {
    loadInitialData();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('Test en cours...');
      const response = await fetch(`${API_BASE_URL}/test`);
      const data = await response.json();
      setConnectionStatus(`✅ Connecté: ${data.message}`);
    } catch (error) {
      console.error(error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des données initiales...');
      // Test de connexion d'abord
      await testConnection();
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        console.log("👤 Utilisateur connecté:", u.nom);
      } else {
        console.log("⚠️ Aucun utilisateur trouvé dans AsyncStorage");
      }
      const [ balance, recentTransactions] = await Promise.all([
        
        apiService.getBalanceData(),
        apiService.getRecentTransactions()
      ]);
      
     
      setBalanceData(balance);
      setTransactions(recentTransactions);
      console.log('✅ Données chargées avec succès');
      
    } catch (error) {
      console.error('Load initial data error:', error);
      Alert.alert(
        'Mode Démo', 
        'Connexion au serveur impossible. Mode démo activé avec des données fictives.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchText(text);
    
    if (text.length > 2) {
      try {
        setSearchLoading(true);
        const results = await apiService.searchProducts(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        // Ne pas afficher d'alerte pour les erreurs de recherche
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

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

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getTransactionTypeText = (type: string): string => {
    switch (type) {
      case 'entree': return 'Income';
      case 'sortie': return 'Expense';
      default: return '';
    }
  };

  // ==================== RENDU ====================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
          <Text style={styles.connectionStatus}>{connectionStatus}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
    <View style={styles.header}>
  <View style={styles.headerLeft}>
 <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.image}
          resizeMode="contain"
        />    <View>
      <Text style={styles.welcomeText}>Welcome</Text>
      <Text style={styles.usernameText}>{user?.nom}</Text>
    </View>
  </View>

  <View style={styles.headerRight}>
    <TouchableOpacity   onPress={() => router.push('../page_add_user/profilescreen')}
style={styles.addButtonHeader}>
      <Text style={styles.addText}> +Add</Text>
    </TouchableOpacity>

    <TouchableOpacity   onPress={() => router.push('../home/home')}
style={styles.logoutButton}>
      <Feather name="log-out" size={18} color="#5C4033" />
    </TouchableOpacity>
  </View>
</View>


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        {balanceData && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {balanceData.total_balance.toFixed(2)} DT
            </Text>
            
            <View style={styles.incomeExpenseContainer}>
              <View style={styles.incomeContainer}>
                <Text style={styles.incomeLabel}>Income</Text>
                <Text style={styles.incomeAmount}>
                  +{balanceData.total_income.toFixed(2)} DT
                </Text>
              </View>
              <View style={styles.expenseContainer}>
                <Text style={styles.expenseLabel}>Expenses</Text>
                <Text style={styles.expenseAmount}>
                  -{balanceData.total_expenses.toFixed(2)} DT
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Search Bar */}
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

        {/* Search Results */}
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

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions  </Text>
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
                      <Text style={[styles.transactionType, { color: '#808285ff' }]}>
                   Quantity: {transaction.quantite}
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