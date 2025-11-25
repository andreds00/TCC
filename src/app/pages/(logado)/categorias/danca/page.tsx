import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ModalidadesDanca() {


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>

        <LinearGradient
          style={styles.header}
          colors={[colors.darkBlue, colors.blue, colors.lightBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity activeOpacity={0.6} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={24} color={colors.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Danças</Text>

        </LinearGradient>

        <ScrollView style={{ flexGrow: 1, backgroundColor: colors.white }} >
          <View style={styles.main}>

            <View style={{ width: "100%", justifyContent: 'center', marginTop: 20 }}>
              <Text style={styles.subtitle}>
                Selecione a categoria de dança que deseja praticar:
              </Text>
            </View>


            <View style={styles.options}>
              <TouchableOpacity style={styles.button1} activeOpacity={0.6} onPress={() => {
                router.replace({
                  pathname: '/pages/(logado)/categorias/danca/escolhas',
                  params: { atividade: 'zumba' },
                })
              }}>
                <Text style={styles.buttonText}> Zumba </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button2} activeOpacity={0.6} onPress={() => {
                router.replace({
                  pathname: '/pages/(logado)/categorias/danca/escolhas',
                  params: { atividade: 'jazz' },
                })
              }}>

                <Text style={styles.buttonText}> Jazz </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button3} activeOpacity={0.6} onPress={() => {
                router.replace({
                  pathname: '/pages/(logado)/categorias/danca/escolhas',
                  params: { atividade: 'barre-fit' },
                })
              }}>
                <Text style={styles.buttonText}> Barre Fit </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button3} activeOpacity={0.6} onPress={() => {
                router.replace({
                  pathname: '/pages/(logado)/categorias/danca/escolhas',
                  params: { atividade: 'fit-dance' },
                })
              }}>
                <Text style={styles.buttonText}>Fit Dance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

    </SafeAreaView >
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
    
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',

  },
  title: {
    width: '90%',
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
    color: colors.white,
    alignSelf: "center",
  },
  main: {
    flex: 1,
    alignItems: 'center',
    gap: "5%",
    paddingHorizontal: 20,
    marginBottom: '20%'

  },
  subtitle: {
    paddingTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkBlue,
    marginBottom: 10,
    textAlign: 'center',
  },
  button1: {
    backgroundColor: colors.darkBlue,
    paddingVertical: 65,
    borderRadius: 20,
    alignItems: 'center',
  },
  button2: {
    width: '100%',
    backgroundColor: colors.blue,
    paddingVertical: 65,
    borderRadius: 20,
    alignItems: 'center',
  },
  button3: {
    backgroundColor: colors.lightBlue,
    paddingVertical: 65,
    borderRadius: 20,
    alignItems: 'center',
  },
  button4: {
    width: '100%',
    backgroundColor: colors.lightBlue,
    paddingVertical: 65,
    borderRadius: 20,
    alignItems: 'center',
  },
  options: {
    width: '100%',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 15,

  },
  buttonText: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '600',
    zIndex: 999,
  },
});
