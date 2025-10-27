import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, SafeAreaView, ScrollView, Text } from "react-native";
import { styles } from "./_styleHome";
import InputsButtons from "./components";

const API_URL = "http://192.168.33.105:3000";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          router.push("../transaction_balance/pageUser");
        } else if (["gerant", "vendeur"].includes(data.user.role)) {
          router.push("../page_employe/pageE");
        } else {
          Alert.alert("Erreur", "Rôle utilisateur inconnu");
        }
      } else {
        Alert.alert("Erreur", data.message || "Identifiants incorrects");
      }
    } catch (error) {
      console.error("❌ Erreur connexion :", error);
      Alert.alert("Erreur", "Impossible de se connecter au serveur");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={require("../../../assets/images/revenue-i4.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome Back</Text>

        <InputsButtons
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onLogin={handleLogin}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
