import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ConfirmacaoMeditacao() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    localNome?: string;
    localEndereco?: string;
    horario?: string;
    nivel?: string;
  }>();

  const localNome = params.localNome || 'Local não informado';
  const localEndereco = params.localEndereco || '';
  const horario = params.horario || 'Horário não informado';
  const nivel = params.nivel || '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={styles.content}>
          <Text style={styles.message}>
            Parabéns por confirmar sua aula de{"\n"}
            <Text style={styles.bold}>Meditação {nivel ? `(${nivel})` : ''}</Text> no{" "}
            <Text style={styles.bold}>{localNome}</Text>
            {localEndereco ? `\n${localEndereco}` : ''}
            {"\n"}às <Text style={styles.bold}>{horario}!</Text>
          </Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Local:</Text>
              <Text style={styles.detailValue}>{localNome}</Text>
            </View>
            {localEndereco && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Endereço:</Text>
                <Text style={styles.detailValue}>{localEndereco}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Horário:</Text>
              <Text style={styles.detailValue}>{horario}</Text>
            </View>
            {nivel && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nível:</Text>
                <Text style={styles.detailValue}>{nivel}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/pages/(logado)/home/page')}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#003973',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 30,
  },
  bold: {
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    width: 100,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: '#003973',
    fontSize: 16,
    fontWeight: '600',
  },
});
