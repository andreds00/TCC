import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, } from 'react-native';
import colors from '@/constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase'

export default function Cadastro() {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [passwordVisible, setPasswordVisible] = React.useState(true);

    async function handleCadastro() {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    email: email,
                }
            }
        });

        if (error) {
            console.log("Resultado cadastro:", { data, error });
            Alert.alert('Erro ao cadastrar:', error.message);
            setLoading(false);
            return;
        } else {
            Alert.alert('Usuário cadastrado com sucesso', 'Agora você pode realizar seu login!');
            setLoading(false);
            router.replace('/pages/(deslogado)/login/page');
            return;
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

                        <Text style={styles.title}>Cadastro</Text>
                        <Text style={styles.subtitle}>É seguro, rápido e fácil!</Text>
                    </View>
                    <View style={{ width: '100%', marginTop: 20, gap: 5, alignItems: 'center' }}>

                        <View style={styles.Conteinerform}>

                            <Text style={styles.label}>Nome</Text>
                            <View style={styles.form}>

                                <TextInput placeholder="Nome e sobrenome ..." value={name} onChangeText={setName} style={styles.input} placeholderTextColor={colors.darkGray}/>
                                <MaterialIcons name="person" size={24} color={colors.darkBlue} style={styles.icon} />

                            </View>
                        </View>

                        <View style={styles.Conteinerform}>

                            <Text style={styles.label}>Endereço de email</Text>
                            <View style={styles.form}>

                                <TextInput placeholder="Digite seu email" value={email} onChangeText={setEmail} style={styles.input} textContentType='emailAddress' placeholderTextColor={colors.darkGray}/>
                                <MaterialIcons name="email" size={24} color={colors.darkBlue} style={styles.icon} />

                            </View>
                        </View>

                        <View style={styles.Conteinerform}>

                            <Text style={styles.label}>Crie uma senha</Text>
                            <View style={styles.form}>


                                <TextInput placeholder="Senha" secureTextEntry={passwordVisible} value={password} onChangeText={setPassword} style={styles.input} textContentType='password' placeholderTextColor={colors.darkGray}/>
                                <TouchableOpacity onPress={handlePress}>
                                    <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.darkBlue} style={styles.icon} />
                                </TouchableOpacity>

                            </View>
                        </View>



                        <TouchableOpacity activeOpacity={0.6} style={styles.button} onPress={() => { handleCadastro() }}>
                            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Cadastrar</Text>}
                        </TouchableOpacity>

                        <Pressable style={styles.buttonVoltar} onPressOut={() => { router.back() }}>
                            <Text style={styles.buttonVoltarText}>Voltar</Text>
                        </Pressable>




                    </View>


                </View>
            </ScrollView>
        </SafeAreaView>
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
    },
    icon: {
        marginLeft: 10,
        color: colors.darkBlue,
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
