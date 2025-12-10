import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/Colors';
import { sendTrainConfirmationNotificationOnce } from '@/lib/localNotifications';

export default function ConfirmacaoHotYoga() {
  const handleConfirmar = async () => {
    router.replace('/pages/(logado)/home/page')
    Alert.alert('Parabéns', 'Sua presença foi confirmada com sucesso.');
    
    try {
      await sendTrainConfirmationNotificationOnce();
      
    } catch (e) {
      console.warn("Erro ao enviar notificação de confirmação:", e);
    }
    

    
  };

  const handleDesmarcar = () => {
    Alert.alert('Confirmação', 'Sua presença foi desmarcada com sucesso.');

    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/pages/(logado)/home/page');
      }
    }, 10);
  };

  const handleFechar = () => {
    router.replace('/pages/(logado)/home/page');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        colors={[colors.darkBlue, colors.blue, colors.lightBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.background}>
          <View style={styles.content}>
            <Text style={styles.message}>
              Podemos confirmar sua presença na aula de{" "}
              <Text style={styles.bold}>Hot Yoga Iniciante</Text> no{" "}
              <Text style={styles.bold}>Studio Sunset</Text>{" "}
              às <Text style={styles.bold}>10h00?</Text>
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
              <Text style={styles.buttonText}>Confirmar Presença</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleDesmarcar}>
              <Text style={styles.buttonText}>Desmarcar presença</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleFechar}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBlue
  },
  background: {
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 23,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 30,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%'
  },
  buttonText: {
    textAlign: 'center',
    color: '#003973',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
