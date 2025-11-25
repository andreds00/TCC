import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import {useRouter} from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function InformacoesCirco() {
    const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
   
      <View style={styles.banner}>
        <Text style={styles.bannerText}> Malabarismo Iniciante - 11h30</Text>
      </View>

     
      <TouchableOpacity style={styles.button}>
        <Ionicons name="location-outline" size={20} color="#D9D9D9" />
        <Text style={styles.buttonText}>Acro Gym</Text>
        <MaterialIcons name="arrow-forward-ios" size={18} color="#D9D9D9" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="person-outline" size={20} color="#D9D9D9" />
        <Text style={styles.buttonText}>Instrutora Sarah Thames</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="alert-circle-outline" size={20} color="#D9D9D9" />
        <Text style={styles.buttonText}>Instruções Pré-aula</Text>
        <MaterialIcons name="arrow-forward-ios" size={18} color="#D9D9D9" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#D9D9D9" />
        <Text style={styles.confirmText}>Confirmar presença</Text>
        //rota de volta
        <MaterialIcons name="arrow-forward-ios" size={18} color="#D9D9D9" />
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
  banner: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  bannerText: {
    color: '#003973',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 19,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 30,
    marginBottom: 12,
    marginTop: 10,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#586583',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 19,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 30,
    marginBottom: 12,
    marginTop: 10,
  },
  confirmText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#586583',
  },
});
