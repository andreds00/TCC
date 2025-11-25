import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/src/contextos/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

export default function Perfil() {

    const { setAuth, user, userData } = useAuth();


    async function signOut() {
        const { error } = await supabase.auth.signOut();
        setAuth(null);
        router.replace('/pages/(deslogado)/inicial/page');

        if (error) {
            console.log('Erro ao sair:', 'Tente novamente mais tarde...');
            return;
        }

    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, paddingVertical: 20 }}>

            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => router.replace('/pages/(logado)/home/page')}>
                        <MaterialIcons name="arrow-back-ios" size={24} color={Colors.darkBlue} />
                    </TouchableOpacity>


                    <Text style={styles.title}>Perfil</Text>
                </View>

                <View style={styles.avatarContainer}>
                    <MaterialIcons name="person" size={60} color="#0A1C3F" />
                </View>

                <Text style={styles.name}>{userData?.name || user?.user_metadata.name}</Text>
                <Text style={styles.email}>{user?.user_metadata.email}</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons name="stopwatch-outline" size={30} color="#0A1C3F" />
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Tempo total</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="flame-outline" size={30} color="#0A1C3F" />
                        <Text style={styles.statValue}>0 cal</Text>
                        <Text style={styles.statLabel}>Queimou</Text>
                    </View>
                    <View style={styles.statItem}>
                        <FontAwesome5 name="running" size={30} color="#0A1C3F" />
                        <Text style={styles.statValue}>0 dias</Text>
                        <Text style={styles.statLabel}>De sequência</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/pages/(logado)/informacoes/page')}>
                        <MaterialIcons name="person-outline" size={24} color="#9097B2" />
                        <Text style={styles.menuText}>Informações pessoais</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#9097B2" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/pages/(logado)/buscarRelogio/page')}>
                        <MaterialIcons name="watch" size={24} color="#9097B2" />
                        <Text style={styles.menuText}>Conectar a um dispositivo</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#9097B2" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pages/(logado)/configuracao/page')}>
                        <Ionicons name="settings-outline" size={24} color="#9097B2" />
                        <Text style={styles.menuText}>Configurações</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#9097B2" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pages/(logado)/notificacao/page')}>
                        <Ionicons name="notifications-outline" size={24} color="#9097B2" />
                        <Text style={styles.menuText}>Notificações</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#9097B2" />
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.6} style={styles.menuItem} onPress={signOut}>
                        <MaterialIcons name="logout" size={24} color="#9097B2" />
                        <Text style={styles.menuText}>Sair da minha conta</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#9097B2" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: "row",
        alignContent: "center",
        marginBottom: 20,

    },
    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.darkBlue,
        alignSelf: "center",
    },
    avatarContainer: {
        alignSelf: 'center',
        marginVertical: 20,
        backgroundColor: '#E6EAF6',
        borderRadius: 40,
        padding: 20,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#0A1C3F',
    },
    email: {
        fontSize: 12,
        textAlign: 'center',
        color: '#666',
        marginBottom: 30,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 40,
    },
    statItem: {
        alignItems: 'center',
        width: 90,
    },
    statValue: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '700',
        color: '#0A1C3F',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    menuContainer: {
        borderWidth: 1,
        borderColor: '#0A1C3F',
        borderRadius: 15,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#0A1C3F',
    },
    menuText: {
        flex: 1,
        fontSize: 14,
        color: '#9097B2',
        marginLeft: 10,
    },
});
