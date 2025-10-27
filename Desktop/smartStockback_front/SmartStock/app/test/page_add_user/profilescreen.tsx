import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, ScrollView, Text, View, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './styleU';
import { useRouter } from 'expo-router';
import Profileproduit from './produit';
import Profilesupplier from './fournisseur';
import Profileuser from './utilisateur';

const ProfileScreen1: React.FC = () => {
  const [currentForm, setCurrentForm] = useState<'product' | 'utilisateur' | 'supplier' | null>(null);
  const [user, setUser] = useState<{ nom: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur :', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header1}>
          <View style={styles.headerLeft}>
            <Image source={require("../../../assets/images/logo.png")} style={styles.image} resizeMode="contain" />
            <View>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.usernameText}> {user ? user.nom : 'Utilisateur'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('../transaction_balance/pageUser')} style={styles.addButtonHeader}>
                 <Feather name="home" size={18} color="#f3ece9ff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/test/home/home')} style={styles.logoutButton}>
              <Feather name="log-out" size={18} color="#f5f1f0ff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={styles.profileButtonGroup}>
            <TouchableOpacity style={styles.profileButton} onPress={() => setCurrentForm('supplier')}>
              <Feather name="truck" size={18} color="#5C4033" />
              <Text style={styles.profileText}>Ajouter fournisseur</Text>
            </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} onPress={() => setCurrentForm('utilisateur')}>
              <Feather name="truck" size={18} color="#5C4033" />
              <Text style={styles.profileText}>Ajouter Utilisateur</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={() => setCurrentForm('product')}>
              <Feather name="box" size={18} color="#5C4033" />
              <Text style={styles.profileText}>Ajouter produit</Text>
            </TouchableOpacity>
          </View>

          {currentForm === 'product' && <Profileproduit />}
          {currentForm === 'utilisateur' && <Profileuser />}
          {currentForm === 'supplier' && <Profilesupplier />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileScreen1;
