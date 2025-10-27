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
const API_BASE_URL = 'http://192.168.33.105:3000/api'; // Votre IP locale - À ADAPTER



// ==================== COMPONENTS ====================
const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  value,
  onChangeText,
  isBarcode = false,
  ...props
}) => {
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
    </View>
  );
};


const Profilesupplier: React.FC = () => {
   const [search, setSearch] = useState('');
 
 // Fournisseur
  const [fourName, setfourName] = useState('');
  const [fourCan, setfourCan] = useState('');
  const [fourAdre, setfourAdre] = useState('');
  const [supplierList, setSupplierList] = useState<any[]>([]);
// === MODAL ÉDITION FOURNISSEUR ===
const [editSupplierModalVisible, setEditSupplierModalVisible] = useState(false);
const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
const [editSupplierName, setEditSupplierName] = useState('');
const [editSupplierContact, setEditSupplierContact] = useState('');
const [editSupplierAddress, setEditSupplierAddress] = useState('');

const openEditSupplierModal = (f: any) => {
  setSelectedSupplier(f);
  setEditSupplierName(f.nomf || f.nom || '');
  setEditSupplierContact(f.contact || '');
  setEditSupplierAddress(f.adresse || '');
  setEditSupplierModalVisible(true);
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
 
 const handleUpdateSupplier = async () => {
   if (!selectedSupplier) return;
   if (!editSupplierName || !editSupplierContact || !editSupplierAddress)
     return Alert.alert('Erreur', 'Tous les champs sont obligatoires');
 
   try {
     const response = await fetch(
       `${API_BASE_URL}/fournisseurs/${selectedSupplier.id_fournisseur}`,
       {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           nomf: editSupplierName,
           contact: editSupplierContact,
           adresse: editSupplierAddress,
         }),
       }
     );
 
     if (response.ok) {
       Alert.alert('Succès', 'Fournisseur mis à jour avec succès');
       setEditSupplierModalVisible(false);
       fetchFournisseurs();
     } else {
       const data = await response.json();
       Alert.alert('Erreur', data.message || 'Échec de mise à jour');
     }
   } catch (error) {
     console.error('Erreur update fournisseur:', error);
     Alert.alert('Erreur', 'Impossible de contacter le serveur');
   }
 };
   const handleDeleteSupplier = async (id: number) => {
     Alert.alert('Confirmation', 'Voulez-vous supprimer ce fournisseur ?', [
       { text: 'Annuler', style: 'cancel' },
       {
         text: 'Supprimer',
         style: 'destructive',
         onPress: async () => {
           try {
             const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}`, {
     method: "DELETE",
   });
   
             if (response.ok) {
               Alert.alert('Succès', 'Fournisseur supprimé');
               fetchFournisseurs();
             } else {
               Alert.alert('Erreur', 'Suppression échouée');
             }
           } catch (error) {
             console.error('Erreur suppression fournisseur:', error);
             Alert.alert('Erreur', 'Impossible de contacter le serveur');
           }
         },
       },
     ]);
   };
   useEffect(() => {
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
fetchSearchFournisseurs();
})
   const fetchFournisseurs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fournisseurs`);
      const data = await response.json();
      if (Array.isArray(data)) setSupplierList(data);
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error);
    }
  };
 
   
 
 return (
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
                             <TouchableOpacity style={{ marginRight: 10 }}  onPress={() => openEditSupplierModal(item)}>
                               <Feather name="edit" size={16} color="#6b4f2c" />
                             </TouchableOpacity> 
                             <TouchableOpacity onPress={() => handleDeleteSupplier(item.id_fournisseur)} >
                               <Feather name="trash-2" size={16} color="#d9534f" />
                             </TouchableOpacity> 
                         </View>
            </View>
          )}
        />
        </View>
      </View>

<Modal visible={editSupplierModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, width: '85%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Modifier le fournisseur</Text>

      <CustomInput placeholder="Nom" value={editSupplierName} onChangeText={setEditSupplierName} />
      <CustomInput placeholder="Contact" value={editSupplierContact} onChangeText={setEditSupplierContact} />
      <CustomInput placeholder="Adresse" value={editSupplierAddress} onChangeText={setEditSupplierAddress} />

     <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: '#ccc', flex: 1, marginRight: 5 }]}
                onPress={() => setEditSupplierModalVisible(false)}
        >
          <Text>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addButton, { flex: 1, marginLeft: 5 }]}
          onPress={handleUpdateSupplier}
        >
          <Text style={{ color: 'white' }}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );}
  export default Profilesupplier;