import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import colors from '@/constants/Colors';

export default function Configuracao() {

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white, paddingVertical: 20 }}>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => router.replace('/pages/(logado)/home/page')}>
                        <MaterialIcons name="arrow-back-ios" size={24} color={colors.darkBlue} />
                    </TouchableOpacity>


                    <Text style={styles.title}>Help/Fac</Text>
                </View>

                {/* Feedback Box */}
                <View style={styles.feedbackBox}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialIcons name="thumb-up-off-alt" size={24} color={colors.darkBlue} />
                        <Text style={styles.feedbackTitle}>Deixe um feedback!</Text>
                    </View>
                    <Text style={styles.feedbackSubtitle}>
                        Conte para nós se você está gostando do app!
                    </Text>
                </View>

                {/* Menu */}
                <View style={styles.menuContainer}>

                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.6}
                        onPress={() => {Linking.openSettings();}}
                    >
                        <Ionicons name="lock-closed" size={24} color={colors.darkBlue} />
                        <Text style={styles.menuText}>Permissões</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.darkBlue} />
                    </TouchableOpacity>



                </View>
                <View style={{ marginTop: 380, marginBottom: 40 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                        <MaterialIcons name="mail" size={24} color={colors.darkBlue} />
                        <Text style={[styles.feedbackTitle, { marginLeft: 8 }]}>Email para contato:</Text>
                    </View>

                    <Text style={[styles.feedbackSubtitle, { marginLeft: 32 }]}>
                        bodymoove@gmail.com
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 15 }}>
                        <MaterialIcons name="phone" size={24} color={colors.darkBlue} />
                        <Text style={[styles.feedbackTitle, { marginLeft: 8 }]}>Número para contato:</Text>
                    </View>

                    <Text style={[styles.feedbackSubtitle, { marginLeft: 32 }]}>
                        55-11-99999-9999
                    </Text>

                    <Text style={[styles.feedbackSubtitle, { marginTop: 20 }]}>
                        Fale conosco!
                    </Text>
                </View>


            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 35,
    },

    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: colors.darkBlue,
    },

    feedbackBox: {
        backgroundColor: "#F1F3FA",
        padding: 16,
        borderRadius: 12,
        marginBottom: 25,

    },

    feedbackTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 10,
        color: colors.darkBlue,
    },

    feedbackSubtitle: {
        marginTop: 6,
        fontSize: 12,
        color: "#666",
        marginLeft: 3,
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
        borderBottomWidth: 2,
        borderBottomColor: colors.darkBlue,
    },

    menuText: {
        flex: 1,
        fontSize: 14,
        color: colors.darkBlue,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
