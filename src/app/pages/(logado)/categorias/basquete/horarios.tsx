import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '@/constants/Colors';

export default function HorariosMeditacao() {
  const router = useRouter();
  const params = useLocalSearchParams<{ localNome?: string; localEndereco?: string }>();
  
  const horarios = [
    { hora: '7h00', nivel: 'iniciante' },
    { hora: '9h20', nivel: 'intermediário' },
    { hora: '10h00', nivel: 'intermediária' },
    { hora: '17h30', nivel: 'avançado' },
    { hora: '18h00', nivel: 'iniciante' },
    { hora: '20h30', nivel: 'iniciante' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.header}

      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={{ paddingHorizontal: 4 }}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.darkBlue} />
        </TouchableOpacity>
        <Text style={styles.title}>Escolha o horario</Text>
      </View>

      <Text style={styles.subtitle}>Escolha o melhor horario e nível da sua aula</Text>

      {params.localNome && (
        <View style={styles.localInfo}>
          <Text style={styles.localLabel}>Local escolhido:</Text>
          <Text style={styles.localNome}>{params.localNome}</Text>
          {params.localEndereco && (
            <Text style={styles.localEndereco}>{params.localEndereco}</Text>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.options}>
        {horarios.map((item, index) => (
          <Link
            key={index}
            href={{
              pathname: '/pages/(logado)/categorias/basquete/confimacao/page',
              params: {
                localNome: params.localNome || 'Local não informado',
                localEndereco: params.localEndereco || '',
                horario: item.hora,
                nivel: item.nivel,
              },
            }}
            asChild
          >
            <TouchableOpacity style={styles.button}>
              <Text style={styles.hora}>{item.hora}</Text>
              <Text style={styles.nivel}>{item.nivel}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    width: '100%',
    flexDirection: "row",
    alignContent: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',

  },
  title: {
    width: '90%',
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: colors.darkBlue,
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 10,
    textAlign: 'center',
    padding: 20,
    paddingVertical: 30,
  },
  localInfo: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  localLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
    fontWeight: '600',
  },
  localNome: {
    color: colors.darkBlue,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  localEndereco: {
    color: colors.darkGray,
    fontSize: 14,
  },

  options: {
    gap: 20,
    paddingHorizontal: 20,
    width: '100%',

  },
  button: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 30,
    marginBottom: 12,
    marginTop: 10,
    justifyContent: 'center',
  },
  hora: {
    marginLeft: 10,
    fontSize: 18,
    color: colors.darkBlue,
    fontWeight: 'bold',

  },
  nivel: {
    marginLeft: 10,
    fontSize: 10,
    color: colors.darkGray,
    fontWeight: 'bold',
  },
});