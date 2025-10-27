import React from "react";
import { Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "./_styleHome";

interface Props {
  email: string;
  password: string;
  setEmail: (text: string) => void;
  setPassword: (text: string) => void;
  onLogin: () => void;
}

export default function InputsButtons({
  email,
  password,
  setEmail,
  setPassword,
  onLogin,
}: Props) {
  return (
    <>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </>
  );
}
