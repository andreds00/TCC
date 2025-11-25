import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import {useRouter} from 'expo-router';

export default function InformacoesHandebol() {
    const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
    
      <Text style={styles.logo}>Body Moove</Text>

   
      <View style={styles.banner}>
        <Text style={styles.bannerText}> Handebol de Quadra Avançado - 17h40</Text>
      </View>

     
      <TouchableOpacity style={styles.button}>
        <Ionicons name="location-outline" size={20} color="#333" />
        <Text style={styles.buttonText}>H10 Escola de Esportes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="person-outline" size={20} color="#333" />
        <Text style={styles.buttonText}>Instrutor Cauê Ceccon</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="alert-circle-outline" size={20} color="#333" />
        <Text style={styles.buttonText}>Instruções Pré-aula</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={styles.confirmText}>Confirmar presença</Text>
        //rota de volta
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  banner: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  bannerText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28A745',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
  },
  confirmText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
