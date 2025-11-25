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
  query?: string;
  fallback: DisplayPlace[];
};

const ACTIVITIES: Record<string, ActivityConfig> = {
  'squash-individual': {
    title: 'Squash Individual',
    description:
      'Locais de squash com quadras para jogos individuais, com instrutores disponíveis.',
    query: 'quadras de squash|jogos individuais|instrutores de squash',
    fallback: [
      {
        id: 'squash-fitness',
        name: 'Squash Fitness',
        address: 'Av. Brasil, 123 - Centro',
        highlight: 'Aulas para todos os níveis.',
        extra: 'Abre às 07h',
        location: { lat: -23.5635, lng: -46.6549 },
      },
      {
        id: 'life-squash',
        name: 'Life Squash',
        address: 'Rua dos Esportes, 456 - Jardim das Flores',
        highlight: 'Instrutores certificados para jogos individuais.',
        extra: 'Planos mensais',
        location: { lat: -23.5478, lng: -46.6363 },
      },
      {
        id: 'the-squash-club',
        name: 'The Squash Club',
        address: 'Av. Paulista, 789 - Centro',
        highlight: 'Treinos personalizados de squash.',
        extra: 'Agenda flexível',
        location: { lat: -23.5672, lng: -46.6429 },
      },
    ],
  },
  'squash-em-dupla': {
    title: 'Squash em Dupla',
    description:
      'Locais com quadras de squash para jogos em dupla, com instrutores disponíveis.',
    query: 'quadras de squash|jogos em dupla|instrutores de squash',
    fallback: [
      {
        id: 'dupla-squash-center',
        name: 'Dupla Squash Center',
        address: 'Rua das Acácias, 250 - Jardim Primavera',
        highlight: 'Aulas de squash em dupla para todos os níveis.',
        extra: 'Primeira aula experimental',
        location: { lat: -23.5654, lng: -46.6598 },
      },
      {
        id: 'squash-fitness',
        name: 'Squash Fitness',
        address: 'Av. Brasil, 123 - Centro',
        highlight: 'Aulas para todos os níveis.',
        extra: 'Abre às 07h',
        location: { lat: -23.5635, lng: -46.6549 },
      },
      {
        id: 'the-squash-club',
        name: 'The Squash Club',
        address: 'Av. Paulista, 789 - Centro',
        highlight: 'Treinos personalizados de squash.',
        extra: 'Agenda flexível',
        location: { lat: -23.5672, lng: -46.6429 },
      },
    ],
  },
};

const DEFAULT_ACTIVITY = 'squash-individual';

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
                  pathname: '/pages/(logado)/categorias/squash/horarios',
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
