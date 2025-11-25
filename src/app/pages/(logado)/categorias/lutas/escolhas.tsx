import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

type DisplayPlace = {
  id: string;
  name: string;
  address: string;
  highlight?: string;
  rating?: number;
  extra?: string;
  location?: {
    lat: number;
    lng: number;
  };
};

type ActivityConfig = {
  title: string;
  description: string;
  fallback: DisplayPlace[];
};

const ACTIVITIES: Record<string, ActivityConfig> = {
  'muay-thai': {
    title: 'Muay Thai',
    description: 'Academias especializadas em Muay Thai.',
    fallback: [
      {
        id: 'fight-club',
        name: 'Fight Club',
        address: 'Rua das Lutas, 123 - Centro',
        highlight: 'Treinamento intensivo com campeões locais.',
        extra: 'Abre às 08h',
        location: { lat: -23.5635, lng: -46.6549 },
      },
      {
        id: 'espaco-lutas',
        name: 'Espaço Lutas',
        address: 'Av. dos Campeões, 456 - Bairro Forte',
        highlight: 'Instrutores certificados',
        location: { lat: -23.5478, lng: -46.6363 },
      },
      {
        id: 'campoes-gym',
        name: 'Campeões Gym',
        address: 'Rua do Boxe, 789 - Zona Leste',
        highlight: 'Aulas para iniciantes e avançados.',
        location: { lat: -23.5672, lng: -46.6429 },
      },
    ],
  },

  karate: {
    title: 'Karate',
    description: 'Academias especializadas em Karate.',
    fallback: [
      {
        id: 'stake-karate',
        name: 'Stake Karate Dojo',
        address: 'Rua dos Samurai, 234 - Centro',
        highlight: 'Treinamento tradicional',
        location: { lat: -23.6001, lng: -46.6673 },
      },
      {
        id: 'kathay-gym',
        name: 'Kathay Gym',
        address: 'Av. do Dragão, 567',
        highlight: 'Treinos para competição',
        location: { lat: -23.5704, lng: -46.6582 },
      },
      {
        id: 'samurai-center',
        name: 'Samurai Center',
        address: 'Rua do Guerreiro, 890',
        highlight: 'Todas as idades',
        location: { lat: -23.5712, lng: -46.6789 },
      },
    ],
  },

  wrestling: {
    title: 'Wrestling',
    description: 'Academias especializadas em Wrestling.',
    fallback: [
      {
        id: 'romano',
        name: 'Romano Wrestling Club',
        address: 'Rua das Lutas, 321',
        location: { lat: -23.5558, lng: -46.6396 },
      },
      {
        id: 'zenith',
        name: 'Zenith Wrestling',
        address: 'Rua Horizonte, 410',
        location: { lat: -23.5294, lng: -46.6499 },
      },
      {
        id: 'gladiadores',
        name: 'Gladiadores Gym',
        address: 'Rua do Comércio, 88',
        location: { lat: -23.5505, lng: -46.6333 },
      },
    ],
  },
};

const DEFAULT_ACTIVITY = 'wrestling';

// Centro padrão
const CENTER = { lat: -23.5505, lng: -46.6333 };

export default function LocaisMeditacao() {
  const params = useLocalSearchParams<{ atividade?: string }>();
  const activityKey =
    typeof params.atividade === 'string' ? params.atividade : DEFAULT_ACTIVITY;

  const activity = ACTIVITIES[activityKey] ?? ACTIVITIES[DEFAULT_ACTIVITY];
  const markers = activity.fallback.filter((p) => p.location);

  const mapHtml = useMemo(() => {
    const markersJson = JSON.stringify(markers);

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <style>
          html, body, #map { margin:0; padding:0; height:100%; width:100%;}
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${CENTER.lat}, ${CENTER.lng}], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);

          var places = ${markersJson};
          places.forEach(p => {
            L.marker([p.location.lat, p.location.lng]).addTo(map)
              .bindPopup('<b>' + p.name + '</b><br/>' + p.address);
          });
        </script>
      </body>
    </html>`;
  }, [markers]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={[colors.darkBlue, colors.blue, colors.lightBlue]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{activity.title}</Text>
      </LinearGradient>

      <View style={styles.main}>
        <Text style={styles.subtitle}>{activity.description}</Text>

        <View style={styles.mapWrapper}>
          <WebView source={{ html: mapHtml }} />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Locais recomendados</Text>
        </View>

        <ScrollView>
          {activity.fallback.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/pages/(logado)/categorias/lutas/horarios',
                  params: {
                    localNome: place.name,
                    localEndereco: place.address,
                  },
                })
              }
            >
              <View style={styles.cardHeader}>
                <Text style={styles.placeName}>{place.name}</Text>
              </View>

              <Text style={styles.placeAddress}>{place.address}</Text>
              {place.highlight && (
                <Text style={styles.placeHighlight}>{place.highlight}</Text>
              )}
              {place.extra && (
                <Text style={styles.placeExtra}>{place.extra}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    padding: 20,
    textAlign: 'center',
    color: colors.darkGray,
    
  },
  mapWrapper: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ddd',
    marginBottom: 18,
  },
  listHeader: {
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkBlue,
  },
  card: {
    backgroundColor: '#f7f9ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderColor: '#e0e5ff',
    borderWidth: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  placeAddress: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 4,
  },
  placeHighlight: {
    fontSize: 13,
    color: colors.blue,
    marginTop: 4,
  },
  placeExtra: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', },
});
