 import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/Colors';

export default function CategoryPlacesView() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares da Categoria</Text>
      <Text style={styles.sub}>Substitua este stub pelo componente real.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.white },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.darkBlue },
  sub: { marginTop: 8, color: colors.darkGray },
});
