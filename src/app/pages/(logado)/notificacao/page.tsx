import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function NotificacaoPage() {
  const router = useRouter();

  const handleConfirmacao = () => {
 
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Notificações</Text>


        <TouchableOpacity style={styles.notificationBox} accessibilityRole="button" onPress={()=> router.push('/pages/(logado)/perfil/page')}>
          <Text style={styles.notificationText}>Atualize suas informações!</Text>
          <Text style={styles.arrow} accessibilityLabel="abrir">{">"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.notificationBox} accessibilityRole="button" onPress={()=> router.push('/pages/(logado)/home/page')}>
          <Text style={styles.notificationText}>
            Não perca tempo! Confira nossas categorias para agendar sua nova atividade em grupo!
          </Text>
          <Text style={styles.arrow} accessibilityLabel="abrir">{">"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonVoltar} onPress={() => router.replace('/pages/(logado)/home/page')} accessibilityRole="button">
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: "#0C1F44",
    marginBottom: 35,
  },
  notificationBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#0C1F44",
    marginBottom: 15,
    width: "100%",
  },
  notificationText: {
    fontSize: 14,
    color: "#0C1F44",
    flex: 1,
    paddingRight: 10,
  },
  arrow: {
    color: "#0C1F44",
    fontSize: 20,
    alignSelf: "center",
  },
  buttonVoltar: {
    marginTop: 40,
    backgroundColor: "#0C1F44",
    borderRadius: 19,
    height: 38,
    width: 170,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
