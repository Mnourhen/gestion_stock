import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F0",
  },
  scroll: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  image: {
    width: 280,
    height: 280,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#5B3924",
    marginBottom: 40,
  },
  input: {
    width: "80%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E3D5CA",
  },
  button: {
    backgroundColor: "#8B5E3C",
    width: "80%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});