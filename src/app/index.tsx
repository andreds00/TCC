import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Button, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import colors from '@/constants/Colors';
import { router } from 'expo-router';
import { EvilIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';


export default function Index() {
    return (

     
            <View style={styles.container}>

                <ActivityIndicator size={50} color={colors.darkBlue} />

            </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,

    },
    
});
