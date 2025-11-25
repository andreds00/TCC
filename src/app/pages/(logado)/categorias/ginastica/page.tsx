import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ModalidadesGinastica() {


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

          <Text style={styles.title}>Ginástica</Text>

        </LinearGradient>

        <View style={styles.main}>

          <View style={{ width: "100%", justifyContent: 'center', marginTop: 20 }}>
            <Text style={styles.subtitle}>
              Selecione a categoria de ginástica que deseja praticar:
            </Text>
          </View>


          <View style={styles.options}>
            <TouchableOpacity style={styles.button1} activeOpacity={0.6} onPress={() => { router.replace({
              pathname: '/pages/(logado)/categorias/ginastica/escolhas', 
              params: { atividade: 'ginastica-artistica' },
            }) }}>
              <Text style={styles.buttonText}> Ginástica Artística </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button2} activeOpacity={0.6} onPress={() => { router.replace({
              pathname: '/pages/(logado)/categorias/ginastica/escolhas', 
              params: { atividade: 'ginastica-ritmica' },
            }) }}>
              
              <Text style={styles.buttonText}>Ginástica Rítmica </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button3} activeOpacity={0.6} onPress={() => { router.replace({
              pathname: '/pages/(logado)/categorias/ginastica/escolhas', 
              params: { atividade: 'hidroginastica' },
            }) }}>
              <Text style={styles.buttonText}> Hidroginástica </Text>
            </TouchableOpacity>

          </View>
        </View>
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
    marginBottom: 20,
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

  },
  subtitle: {
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
