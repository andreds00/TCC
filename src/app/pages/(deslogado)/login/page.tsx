import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, Pressable, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function InitialScreen() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [passwordVisible, setPasswordVisible] = React.useState(true);

    async function handleSignIn() {
  setLoading(true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Supabase signIn error:", error.message);
      Alert.alert("Erro", error.message || "Email ou senha inválidos");
      return;
    }

    // sucesso: o onAuthStateChange do _layout deve redirecionar
  } catch (e: any) {
    console.log("SignIn catch:", e?.message || e);
    Alert.alert("Erro de rede", "Não foi possível conectar. Tente novamente.");
  } finally {
    setLoading(false);
  }
}

    function handlePress() {
        setPasswordVisible(!passwordVisible);
        return passwordVisible ? 'eye-outline' : 'eye-off-outline';
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white, }}>

            <ScrollView style={{ flex: 1 }}>

                <View style={styles.container}>


                    <View style={styles.header}>
                        {/* <Image source={require('@/assets/images/logo.png')} style={styles.logo} /> */}
                        <Text style={styles.title}>Login</Text>
                        <Text style={styles.subtitle}>Que bom que você voltou! Entre e continue a melhorar seus resultados!</Text>
                    </View>
                    <View style={{ width: '100%', marginTop: 20, gap: 5, alignItems: 'center' }}>

                        <View style={styles.Conteinerform}>

                            <Text style={styles.label}>Endereço de email</Text>
                            <View style={styles.form}>

                                <TextInput placeholder="Digite seu email" value={email} onChangeText={setEmail} style={styles.input} textContentType='emailAddress' placeholderTextColor={colors.darkGray}/>
                                <MaterialIcons name="email" size={24} color={colors.darkBlue} style={styles.icon} />

                            </View>
                        </View>

                        <View style={styles.Conteinerform}>

                            <Text style={styles.label}>Digite sua senha</Text>
                            <View style={styles.form}>

                                <TextInput placeholder="Senha" secureTextEntry={passwordVisible} value={password} onChangeText={setPassword} style={styles.input} placeholderTextColor={colors.darkGray} textContentType='password'/>
                                <TouchableOpacity onPress={handlePress}>
                                    <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.darkBlue} style={styles.icon} />
                                </TouchableOpacity>

                        </View>
                    </View>

                    <Pressable style={{ width: '80%' }}>
                        <Link href={'/pages/(deslogado)/senha/page'} style={styles.esqueciSenha}>Esqueci minha senha</Link>
                    </Pressable>

                    <TouchableOpacity activeOpacity={0.6} style={styles.button} onPressIn={() => { handleSignIn() }}>
                        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
                    </TouchableOpacity>

                    <Pressable style={styles.buttonVoltar} onPressOut={() => { router.back() }}>
                        <Text style={styles.buttonVoltarText}>Voltar</Text>
                    </Pressable>




                </View>


            </View>
        </ScrollView>
        </SafeAreaView >
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: colors.white,
        gap: 15,


    },
    header: {
        paddingTop: '30%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '80%',

    },
    logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 16,
        color: colors.darkBlue,
    },
    subtitle: {
        fontSize: 16,
        color: colors.darkBlue,
        textAlign: 'center',
    },

    Conteinerform: {
        width: '80%',
        marginTop: 20,
        gap: 5
    },
    form: {
        alignContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 30,
        paddingVertical: 5,
        paddingHorizontal: 15,
    },
    label: {
        fontSize: 14,
        color: colors.darkBlue,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        flex: 1,
        minHeight: 40,
        fontSize: 16,
        color: colors.darkBlue,
    },
    icon: {
        marginLeft: 10,
        color: colors.darkBlue,
    },
    esqueciSenha: {
        paddingLeft: '5%',
        color: colors.darkBlue,
        textDecorationLine: 'underline'

    },
    button: {
        marginTop: 20,

        width: '80%',
        backgroundColor: colors.blue,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        boxShadow: '3px 3px 3px 3px rgba(0,0,0, 0.07)',
    },
    buttonText: {
        fontSize: 16,
        color: colors.white,
        fontWeight: 'bold',
    },
    buttonVoltar: {
        marginVertical: 10,
        width: '20%',
        borderBottomWidth: 3,
        borderBottomColor: colors.darkBlue,
        paddingVertical: 8,
        alignItems: 'center',
        marginBottom: '30%',
    },
    buttonVoltarText: {
        fontSize: 16,
        color: colors.darkBlue,
        fontWeight: 'bold',
    },


});
