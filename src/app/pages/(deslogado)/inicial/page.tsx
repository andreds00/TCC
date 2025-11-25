import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import colors from '@/constants/Colors';
import { router } from 'expo-router';


export default function InitialScreen() {
    return (
     
            <View style={styles.container}>


                <View style={styles.header}>
                    <Image source={require('@/assets/images/logoClara.png')} style={styles.logo} />
                    <Text style={styles.title}>Bem vindo a Body Moove!</Text>
                    <Text style={styles.subtitle}>Não perca a oportunidade de aprimorar seus treinos com a Body!</Text>
                </View>

                <View style={{ width: '80%', marginTop: 20, justifyContent: 'center', gap: 20 }}>

                    <TouchableOpacity activeOpacity={0.6} style={styles.button} onPressIn={() => { router.push('/pages/(deslogado)/login/page') }}>
                        <Text style={styles.buttonText}>Entrar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.6} style={styles.button} onPressIn={() => { router.push('/pages/(deslogado)/cadastro/page') }}>

                        <Text style={styles.buttonText}>Cadastre-se</Text>

                    </TouchableOpacity>
                </View>

            </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        gap: '15%',


    },
    header: {
        alignItems: 'center',
        width: '80%',

    },
    logo: {
        width: 130,
        height: 130,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        marginVertical: 16,
        color: colors.darkBlue,
    },
    subtitle: {
        fontSize: 16,
        color: colors.darkBlue,
        textAlign: 'center',
    },
    button: {
        borderWidth: 3,
        borderColor: colors.darkBlue,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        boxShadow: '3px 3px 3px 3px rgba(0,0,0, 0.07)',
    },
    buttonText: {
        fontSize: 20,
        color: colors.darkBlue,
        fontWeight: 'bold',
    },

});
