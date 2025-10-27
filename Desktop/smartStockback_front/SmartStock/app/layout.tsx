// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="home/home" options={{ title: "Accueil" }} />
      <Tabs.Screen name="addE" options={{ title: "Ajouter E" }} />
      <Tabs.Screen name="addUser" options={{ title: "Ajouter utilisateur" }} />
      <Tabs.Screen name="pageE" options={{ title: "Page E" }} />
      <Tabs.Screen name="pageUser" options={{ title: "Page utilisateur" }} />
    </Tabs>
  );
}
