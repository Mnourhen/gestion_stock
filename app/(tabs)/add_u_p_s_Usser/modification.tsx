import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, PermissionStatus, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styleU';

// ==================== TYPES ====================
interface CustomInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isBarcode?: boolean;
  iconName?: string;
  [key: string]: any;
}

interface ToggleButtonProps {
  type: 'Achat' | 'Vente';
  currentType: 'Achat' | 'Vente';
  onPress: (type: 'Achat' | 'Vente') => void;
}

// ==================== COMPONENTS ====================
const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  value,
  onChangeText,
  isBarcode = false,
  ...props
}) => {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleScan = (scanResult: { data: string }) => {
    onChangeText(scanResult.data);
    setScannerVisible(false);
  };

  if (!permission) return null;
  if (permission.status !== PermissionStatus.GRANTED && scannerVisible) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.permissionButton}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A9A9A9"
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {isBarcode && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setScannerVisible(true)}
        >
          <Feather name="camera" size={20} color="#696969" />
        </TouchableOpacity>
      )}

      <Modal visible={scannerVisible} animationType="slide">
        <CameraView
          style={{ flex: 1 }}
          ref={cameraRef}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128'],
          }}
          onBarcodeScanned={handleScan}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
          <View style={styles.cancelContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setScannerVisible(false)}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </Modal>
    </View>
  );
};

const ToggleButton: React.FC<ToggleButtonProps> = ({ type, currentType, onPress }) => {
  const isActive = currentType === type;
  const icon = type === 'Achat' ? 'arrow-down' : 'arrow-up';
  const color = type === 'Achat' ? '#f50707ff' : '#2E6B3E';

  return (
    <TouchableOpacity
      style={[
        styles.toggleButton,
        isActive ? styles.activeToggleButton : styles.inactiveToggleButton,
        isActive && { borderColor: color },
      ]}
      onPress={() => onPress(type)}
    >
      <AntDesign
        name={icon}
        size={16}
        color={isActive ? 'white' : color}
        style={{ marginRight: 5 }}
      />
      <Text style={[styles.toggleButtonText, { color: isActive ? 'white' : color }]}>
        {type}
      </Text>
    </TouchableOpacity>
  );
};
const API_BASE_URL = 'http://192.168.154.105:3000/api'; // Votre IP locale - À ADAPTER

// ==================== MAIN SCREEN ====================
const ProfileScreen1: React.FC = () => {
  const [currentForm, setCurrentForm] = useState<'product' | 'user' | 'supplier' | null>(null);
  const [search, setSearch] = useState('');

  // Produit
  const [productType, setProductType] = useState<'Achat' | 'Vente'>('Achat');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [batchProducts, setBatchProducts] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);

  // Utilisateur
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userList, setUserList] = useState<any[]>([]);

  // Fournisseur
  const [fourName, setfourName] = useState('');
  const [fourCan, setfourCan] = useState('');
  const [fourAdre, setfourAdre] = useState('');
  const [supplierList, setSupplierList] = useState<any[]>([]);
const [editModalVisible, setEditModalVisible] = useState(false);
const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
const [editName, setEditName] = useState('');
const [editPrice, setEditPrice] = useState('');
const [editStock, setEditStock] = useState('');
const openEditModal = (produit: any) => {
  console.log('🟢 Ouverture modal pour :', produit);

  setSelectedProduct(produit);

  // Vérifie les propriétés disponibles et les initialise
  setEditName(produit.nom || produit.name || '');
  setEditPrice(
    produit.prix_unitaire?.toString() ||
    produit.price?.toString() ||
    ''
  );
  setEditStock(
    produit.stock_actuel?.toString() ||
    produit.stock?.toString() ||
    ''
  );

  setEditModalVisible(true);
};


// 🔹 Sauvegarde les modifications
const handleUpdateProduct = async () => {
  if (!selectedProduct) return;
  if (!editName || !editPrice || !editStock) {
    return Alert.alert('Erreur', 'Tous les champs sont obligatoires');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/produits/${selectedProduct.id_produit}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: editName,
          prix_unitaire: parseFloat(editPrice),
          stock_actuel: parseInt(editStock),
        }),
      }
    );

    if (response.ok) {
      Alert.alert('Succès', 'Produit mis à jour avec succès !');
      setEditModalVisible(false);
      fetchProducts(); // ✅ recharge la liste
    } else {
      const data = await response.json();
      Alert.alert('Erreur', data.message || 'Mise à jour échouée');
    }
  } catch (error) {
    console.error('Erreur update produit:', error);
    Alert.alert('Erreur', 'Impossible de contacter le serveur');
  }
};

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id_user);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du user:', error);
      }
    };
    getUser();
    fetchProducts();
    fetchUsers();
    fetchFournisseurs();
  }, []);

  // ==================== FETCH FONCTIONS ====================
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getproduits`);
      const data = await response.json();
      if (Array.isArray(data)) setProductList(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getusers`);
      const data = await response.json();
      if (Array.isArray(data)) setUserList(data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fournisseurs`);
      const data = await response.json();
      if (Array.isArray(data)) setSupplierList(data);
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error);
    }
  };

  // ==================== RECHERCHE DYNAMIQUE ====================
  useEffect(() => {
    const fetchSearchProducts = async () => {
      if (!search) return fetchProducts();
      try {
        const response = await fetch(
          `${API_BASE_URL}/products/search?q=${encodeURIComponent(search)}`
        );
        const data = await response.json();
        if (Array.isArray(data)) setProductList(data);
      } catch (error) {
        console.error('Erreur recherche produit:', error);
      }
    };

    const fetchSearchUsers = async () => {
      if (!search) return fetchUsers();
      try {
        const response = await fetch(
          `${API_BASE_URL}/utilisateur/search?q=${encodeURIComponent(search)}`
        );
        const data = await response.json();
        if (Array.isArray(data)) setUserList(data);
      } catch (error) {
        console.error('Erreur recherche utilisateur:', error);
      }
    };
    const fetchSearchFournisseurs = async () => {
      if (!search) return fetchFournisseurs();
      try {
        const response = await fetch(
          `${API_BASE_URL}/supplier/search?q=${encodeURIComponent(search)}`
        );
        const data = await response.json();
        if (Array.isArray(data)) setSupplierList(data);
      } catch (error) {
        console.error('Erreur recherche fournisseur:', error);
      }
    };
    if (currentForm === 'product') fetchSearchProducts();
    if (currentForm === 'user') fetchSearchUsers();
      if (currentForm === 'supplier') fetchSearchFournisseurs();
  }, [search, currentForm]);
const handleDeleteProduct = async (id: number) => {
  Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer ce produit ?', [
    { text: 'Annuler', style: 'cancel' },
    {
      text: 'Supprimer',
      style: 'destructive',
      onPress: async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/produits/${id}`,
            { method: 'DELETE' }
          );
          if (response.ok) {
            Alert.alert('Succès', 'Produit supprimé avec succès !');
            fetchProducts();
          } else {
            Alert.alert('Erreur', 'Suppression échouée');
          }
        } catch (error) {
          console.error('Erreur suppression produit:', error);
          Alert.alert('Erreur', 'Impossible de contacter le serveur');
        }
      },
    },
  ]);
};
  // ==================== AJOUT / ENVOI PRODUIT ====================
  const handleAddBatch = () => {
    if (!name || !price || !quantity) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement');
    }

    const newProduct = {
      nom: name.trim(),
      code_barre: barcode || '',
      categorie: category || '',
      prix_unitaire: parseFloat(price.replace(',', '.')),
      stock_actuel: parseInt(quantity.replace(',', '.')),
      stock_min: 1,
      id_user: userId,
      type_mouvement: productType === 'Achat' ? 'entree' : 'sortie',
    };

    setBatchProducts([...batchProducts, newProduct]);
    setName('');
    setBarcode('');
    setCategory('');
    setPrice('');
    setQuantity('');

    Alert.alert('Ajouté', 'Produit ajouté au batch avec succès !');
  };

  const handleAddAllProducts = async () => {
    if (batchProducts.length === 0)
      return Alert.alert('Erreur', 'Aucun produit dans le batch');

    try {
      const response = await fetch(`${API_BASE_URL}/produitsT`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produits: batchProducts }),
      });

      const data = await response.json();

      if (Array.isArray(data)) {
         const total = batchProducts.reduce(
        (acc, p) => acc + p.prix_unitaire * p.stock_actuel,
        0
      );

      const details = batchProducts
        .map(
          (p) => `${p.nom} - Qty: ${p.stock_actuel} - Prix: ${p.prix_unitaire}`
        )
        .join('\n');
        Alert.alert('Succès', `${details}\n\nPrix total: ${total.toFixed(2)} dt \'n Produits enregistrés avec succès !`);
        setBatchProducts([]);
        fetchProducts();
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de l’envoi');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  // ==================== AJOUT UTILISATEUR ====================
  const handleAddUser = async () => {
    if (!userName || !userEmail || !userPassword || !userRole) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: userName,
          email: userEmail,
          mot_de_passe: userPassword,
          role: userRole,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', `Utilisateur ${data.user.nom} ajouté !`);
        setUserName('');
        setUserEmail('');
        setUserPassword('');
        setUserRole('');
        fetchUsers();
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de l’ajout');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };
 const handleAddSupplier = async () => { 
  if (!fourName || !fourCan || !fourAdre) { 
    return Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
   } 
   try {
     const response = await fetch(`${API_BASE_URL}/fournisseurinsert`,
       { method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
       body: JSON.stringify({ 
        nomf: fourName,
         contact: fourCan,
          adresse: fourAdre, }), });
           const data = await response.json(); 
           console.log('Réponse serveur fournisseur:', data);
      if (data.success) { Alert.alert('Succès', `Fournisseur ${data.user.nom} ajouté !`); 
      setfourName('');
      setfourCan('');
      setfourAdre('');
      fetchFournisseurs(); 
 // actualiser la liste 
   } 
   else {
     Alert.alert('Erreur', data.message || 'Erreur lors de l’ajout du fournisseur'); } }
      catch (error) { console.error(error); Alert.alert('Erreur', 'Impossible de contacter le serveur'); } }; 

  // ==================== RENDU DES FORMULAIRES ====================
  const renderProductForm = () => (
    <View style={styles.formSection}>
      <View style={styles.toggleGroup}>
        <ToggleButton type="Achat" currentType={productType} onPress={setProductType} />
        <ToggleButton type="Vente" currentType={productType} onPress={setProductType} />
      </View>

      <CustomInput placeholder="Nom produit" value={name} onChangeText={setName} />
      <CustomInput placeholder="Catégorie" value={category} onChangeText={setCategory} />
      <CustomInput placeholder="Quantité" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
      <CustomInput placeholder="Prix unitaire" keyboardType="numeric" value={price} onChangeText={setPrice} />
      <CustomInput placeholder="Code à barre" isBarcode value={barcode} onChangeText={setBarcode} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <TouchableOpacity
          style={[styles.addButton, { flex: 1, marginRight: 5, backgroundColor: '#582a03ff' }]}
          onPress={handleAddBatch}
        >
          <Text style={styles.addButtonText}>Ajouter produit</Text>
        </TouchableOpacity>
   <TouchableOpacity
          style={[styles.addButton, { flex: 1, marginLeft: 5 }]}
          onPress={handleAddAllProducts}
        >
          <Text style={styles.addButtonText}>Sauvegarder Produit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={18} color="#c07d45" />
            <Text style={styles.title}> Product Liste</Text>
          </View>
        </View>

        {/* 🔍 Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="#888" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Product"
            value={search}
            onChangeText={setSearch} 
          />
      <Feather name="camera" size={16} color="#6b4f2c" style={{ marginLeft: 6 }} isBarcode value={barcode} onChangeText={setBarcode} /> 
          
        </View>

        {/* Liste Produits */}
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerText]}>Produit</Text>
            <Text style={[styles.cell, styles.headerText]}>Prix</Text>
            <Text style={[styles.cell, styles.headerText]}>Qty</Text>
            <Text style={[styles.cell, styles.headerText]}>Action</Text>
          </View>

          <FlatList
            data={productList}
            keyExtractor={(item) => item.id_produit?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <View style={[styles.row]}>
                <Text style={styles.cell}>{item.nom}</Text>
                <Text style={styles.cell}>{item.prix_unitaire}</Text>
                <Text style={styles.cell}>{item.stock_actuel}</Text>
                <View style={[styles.cell, { flexDirection: 'row', justifyContent: 'center' }]}> 
                             <TouchableOpacity style={{ marginRight: 10 }}  onPress={() => openEditModal(item)}> 
                              <Feather name="edit" size={16} color="#6b4f2c" />
                             </TouchableOpacity> 
                             <TouchableOpacity onPress={() => handleDeleteProduct(item.id_produit)}>
                               <Feather name="trash-2" size={16} color="#d9534f" />
                             </TouchableOpacity> 
                         </View>
              </View>
            )}
          />
        </View>
      </View>
            {/* 🔹 MODAL D'ÉDITION */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, width: '85%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Modifier le produit
            </Text>
      
            <CustomInput
              style={styles.input}
              placeholder="Nom du produit"
              value={editName}
              onChangeText={setEditName}
            />
            <CustomInput
              style={styles.input}
              placeholder="Prix unitaire"
              keyboardType="numeric"
              value={editPrice}
              onChangeText={setEditPrice}
            />
            <CustomInput
              style={styles.input}
              placeholder="Stock actuel"
              keyboardType="numeric"
              value={editStock}
              onChangeText={setEditStock}
            />
      
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: '#ccc', flex: 1, marginRight: 5 }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>
      
              <TouchableOpacity
                style={[styles.addButton, { flex: 1, marginLeft: 5 }]}
                onPress={handleUpdateProduct}
              >
                <Text style={{ color: 'white' }}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    </View>
  );
 const renderSupplierForm = () => (
    <View style={styles.formSection}>
      <CustomInput placeholder="Nom fournisseur" value={fourName} onChangeText={setfourName} />
      <CustomInput placeholder="contact" value={fourCan} onChangeText={setfourCan}  />
      <CustomInput placeholder="Adresse" value={fourAdre} onChangeText={setfourAdre} />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddSupplier}
      >
        <Text style={styles.addButtonText}>Ajouter fournisseur</Text>
      </TouchableOpacity>

      {/* 🔍 Recherche Fournisseur */}
      <View style={styles.card}>
       
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="business-outline" size={18} color="#c07d45" />
            <Text style={styles.title}> Fournisseur Liste</Text>
          </View>
        

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="#888" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Fournisseur"
            value={search}
            onChangeText={setSearch}
          />
        </View>
          <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerText]}>fournisseur</Text>
            <Text style={[styles.cell, styles.headerText]}>contact</Text>
            <Text style={[styles.cell, styles.headerText]}>Adresse</Text>
           <Text style={[styles.cell, styles.headerText]}>Action</Text>

          </View>
        <FlatList
          data={supplierList}
          keyExtractor={(item, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={[styles.row]}>
              <Text style={styles.cell}>{item.nom}</Text>
              <Text style={styles.cell}>{item.contact}</Text>
              <Text style={styles.cell}>{item.adresse}</Text>
              <View style={[styles.cell, { flexDirection: 'row', justifyContent: 'center' }]}> 
                             <TouchableOpacity style={{ marginRight: 10 }}> <Feather name="edit" size={16} color="#6b4f2c" />
                             </TouchableOpacity> 
                             <TouchableOpacity >
                               <Feather name="trash-2" size={16} color="#d9534f" />
                             </TouchableOpacity> 
                         </View>
            </View>
          )}
        />
        </View>
      </View>
    </View>
  );

  
  const renderUserForm = () => (
    <View style={styles.formSection}>
      <CustomInput placeholder="Nom" value={userName} onChangeText={setUserName} />
      <CustomInput placeholder="Email" value={userEmail} onChangeText={setUserEmail} />
      <CustomInput placeholder="Mot de passe" value={userPassword} onChangeText={setUserPassword} />
      <CustomInput placeholder="Rôle" value={userRole} onChangeText={setUserRole} />
      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <Text style={styles.addButtonText}>Ajouter l’utilisateur</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="people-outline" size={18} color="#c07d45" />
            <Text style={styles.title}> User Liste</Text>
          </View>
        </View>

        {/* 🔍 Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="#888" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search User"
            value={search}
            onChangeText={setSearch}
          />
        </View>

       <View style={styles.table}> 
                     {/* Header row */} 
                     <View style={[styles.row, styles.headerRow]}> 
                       <Text style={[styles.cell, styles.headerText]}>nom</Text> 
                       <Text style={[styles.cell, styles.headerText]}>email</Text> 
                       <Text style={[styles.cell, styles.headerText]}>role</Text> 
                       <Text style={[styles.cell, styles.headerText]}>Action</Text>
                     </View> 
                     {/* Data rows */} 
                     <FlatList data={userList} keyExtractor={(item) => item.id} renderItem={({ item, index }) => ( 
                       <View style={[ styles.row, { backgroundColor: index % 2 === 0 ? '#fdf9f5' : '#fff' }, ]} > 
                       <Text style={styles.cell}>{item.nom}</Text> 
                       <Text style={styles.cell}>{item.email}</Text>
                        <Text style={styles.cell}>{item.role}</Text> 
                        <View style={[styles.cell, { flexDirection: 'row', justifyContent: 'center' }]}> 
                             <TouchableOpacity style={{ marginRight: 10 }}> <Feather name="edit" size={16} color="#6b4f2c" />
                             </TouchableOpacity> 
                             <TouchableOpacity >
                               <Feather name="trash-2" size={16} color="#d9534f" />
                             </TouchableOpacity> 
                         </View>
                      </View> )} /> 
                      </View> 
      </View>
    </View>
  );

  // ==================== MAIN RETURN ====================
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={styles.profileButtonGroup}>
            <TouchableOpacity style={styles.profileButton} onPress={() => setCurrentForm('user')}>
              <Feather name="user" size={18} color="#5C4033" />
              <Text style={styles.profileText}>User-profile-group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={() => setCurrentForm('supplier')}>
              <Feather name="truck" size={18} color="#5C4033" />
              <Text style={styles.profileText}>Supplier-profile-group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={() => setCurrentForm('product')}>
              <Feather name="box" size={18} color="#5C4033" />
              <Text style={styles.profileText}>Ajouter produit</Text>
            </TouchableOpacity>
          </View>

          {currentForm === 'user' && renderUserForm()}
          {currentForm === 'product' && renderProductForm()}
           {currentForm === 'supplier' && renderSupplierForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileScreen1;
