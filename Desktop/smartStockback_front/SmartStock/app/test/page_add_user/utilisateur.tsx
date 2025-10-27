import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, PermissionStatus, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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
const Profileuser: React.FC = () => {
   const [search, setSearch] = useState('');
     // Utilisateur
     const [userName, setUserName] = useState('');
     const [userEmail, setUserEmail] = useState('');
     const [userPassword, setUserPassword] = useState('');
     const [userRole, setUserRole] = useState('');
     const [userList, setUserList] = useState<any[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
     
   // === MODAL ÉDITION UTILISATEUR ===
   const [editUserModalVisible, setEditUserModalVisible] = useState(false);
   const [selectedUser, setSelectedUser] = useState<any | null>(null);
   const [editUserName, setEditUserName] = useState('');
   const [editUserEmail, setEditUserEmail] = useState('');
   const [editUserRole, setEditUserRole] = useState('');
   const openEditUserModal = (user: any) => { 
   setSelectedUser(user);
  setEditUserName(user.nom || '');
  setEditUserEmail(user.email || '');
  setEditUserRole(user.role || '');
  setEditUserModalVisible(true);
   }
// === UPDATE UTILISATEUR ===
const handleUpdateUser = async () => {
  if (!selectedUser) return;
  if (!editUserName || !editUserEmail || !editUserRole)
    return Alert.alert('Erreur', 'Tous les champs sont obligatoires');

  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${selectedUser.id_user}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: editUserName,
          email: editUserEmail,
          role: editUserRole,
        }),
      }
    );

    if (response.ok) {
      Alert.alert('Succès', 'Utilisateur mis à jour avec succès');
      setEditUserModalVisible(false);
      fetchUsers();
    } else {
      const data = await response.json();
      Alert.alert('Erreur', data.message || 'Échec de mise à jour');
    }
  } catch (error) {
    console.error('Erreur update utilisateur:', error);
    Alert.alert('Erreur', 'Impossible de contacter le serveur');
  }
};
const handleDeleteUser = async (id: number) => {
  Alert.alert('Confirmation', 'Voulez-vous supprimer cet utilisateur ?', [
    { text: 'Annuler', style: 'cancel' },
    {
      text: 'Supprimer',
      style: 'destructive',
      onPress: async () => {
         try {

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (data.success) {
      Alert.alert('Suppression réussie', 'Utilisateur supprimé avec succès');

      fetchUsers(); // Rafraîchit la liste
    } else {
      Alert.alert('Erreur', data.message);
    }
  } catch (error) {
    console.error('Erreur suppression user:', error);
  }

      },
    },
  ]);
};
useEffect(() => {
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
    fetchUsers();
    fetchSearchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getusers`);
      const data = await response.json();
      if (Array.isArray(data)) setUserList(data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }

  };
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
    return (
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
                                 <TouchableOpacity style={{ marginRight: 10 }}onPress={() => openEditUserModal(item)}> <Feather name="edit" size={16} color="#6b4f2c" />
                                 </TouchableOpacity> 
                                 <TouchableOpacity onPress={() => handleDeleteUser(item.id_user)}>
                                   <Feather name="trash-2" size={16} color="#d9534f" />
                                 </TouchableOpacity> 
                             </View>
                          </View> )} /> 
                          </View> 
          </View>
                <Modal visible={editUserModalVisible} animationType="slide" transparent>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, width: '85%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Modifier l’utilisateur</Text>
    
          <CustomInput placeholder="Nom" value={editUserName} onChangeText={setEditUserName} />
          <CustomInput placeholder="Email" value={editUserEmail} onChangeText={setEditUserEmail} />
          <CustomInput placeholder="Rôle" value={editUserRole} onChangeText={setEditUserRole} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: '#ccc', flex: 1, marginRight: 5 }]}
              onPress={() => setEditUserModalVisible(false)}
            >
              <Text>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { flex: 1, marginLeft: 5 }]}
              onPress={handleUpdateUser}
            >
              <Text style={{ color: 'white' }}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
        </View>
      );}
  export default Profileuser;

    